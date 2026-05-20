"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCandidate = exports.deleteCandidate = exports.generateReport = exports.startVerification = exports.getCandidate = exports.getCandidates = exports.createCandidate = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const axios_1 = __importDefault(require("axios"));
const pdfService_1 = require("../services/pdfService");
const candidate_1 = require("../validations/candidate");
const zod_1 = require("zod");
const createCandidate = async (req, res) => {
    try {
        const { fullName, email, phone, aadhaarNumber, panNumber, dob, address } = candidate_1.candidateSchema.parse(req.body);
        const candidate = await prisma_1.default.candidate.create({
            data: {
                fullName,
                email,
                phone,
                aadhaarNumber,
                panNumber,
                dob: new Date(dob),
                address,
                createdById: req.user.userId,
            },
        });
        res.status(201).json(candidate);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.issues[0]?.message || 'Invalid candidate details' });
        }
        res.status(400).json({ error: 'Failed to create candidate' });
    }
};
exports.createCandidate = createCandidate;
const getCandidates = async (req, res) => {
    try {
        const candidates = await prisma_1.default.candidate.findMany({
            where: { createdById: req.user.userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(candidates);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getCandidates = getCandidates;
const getCandidate = async (req, res) => {
    try {
        const candidate = await prisma_1.default.candidate.findUnique({
            where: { id: req.params.id },
            include: { verificationLogs: true },
        });
        if (!candidate || candidate.createdById !== req.user.userId) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getCandidate = getCandidate;
const startVerification = async (req, res) => {
    try {
        const candidate = await prisma_1.default.candidate.findUnique({ where: { id: req.params.id } });
        if (!candidate || candidate.createdById !== req.user.userId) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        const host = req.get('host');
        const protocol = req.protocol;
        const baseUrl = `${protocol}://${host}`;
        const aadhaarUrl = process.env.AADHAAR_API_URL || `${baseUrl}/mock-api/aadhaar/verify`;
        const panUrl = process.env.PAN_API_URL || `${baseUrl}/mock-api/pan/verify`;
        console.log('[VERIFICATION] Starting verification for candidate:', candidate.id);
        console.log('[VERIFICATION] Aadhaar URL:', aadhaarUrl);
        console.log('[VERIFICATION] PAN URL:', panUrl);
        // Aadhaar verification
        let aadhaarResponse;
        let aadhaarData;
        let aadhaarStatus = 'failed';
        try {
            aadhaarResponse = await axios_1.default.post(aadhaarUrl, {
                aadhaarNumber: candidate.aadhaarNumber,
            });
            aadhaarData = aadhaarResponse.data;
            aadhaarStatus = aadhaarData?.status || 'failed';
            console.log('[VERIFICATION] Aadhaar response:', aadhaarData);
        }
        catch (err) {
            console.error('[VERIFICATION] Aadhaar API error:', err.message);
            aadhaarData = {
                status: 'failed',
                message: err.response?.data?.message || `API Error: ${err.message}`
            };
            if (err.response?.data) {
                aadhaarData = err.response.data;
                aadhaarStatus = err.response.data.status || 'failed';
            }
        }
        await prisma_1.default.verificationLog.create({
            data: {
                candidateId: candidate.id,
                verificationType: 'AADHAAR',
                requestPayload: { aadhaarNumber: candidate.aadhaarNumber },
                responsePayload: aadhaarData || {},
                verificationStatus: aadhaarStatus,
            }
        });
        // PAN verification
        let panResponse;
        let panData;
        let panStatus = 'failed';
        try {
            panResponse = await axios_1.default.post(panUrl, {
                panNumber: candidate.panNumber,
            });
            panData = panResponse.data;
            panStatus = panData?.status || 'failed';
            console.log('[VERIFICATION] PAN response:', panData);
        }
        catch (err) {
            console.error('[VERIFICATION] PAN API error:', err.message);
            panData = {
                status: 'failed',
                message: err.response?.data?.message || `API Error: ${err.message}`
            };
            if (err.response?.data) {
                panData = err.response.data;
                panStatus = err.response.data.status || 'failed';
            }
        }
        await prisma_1.default.verificationLog.create({
            data: {
                candidateId: candidate.id,
                verificationType: 'PAN',
                requestPayload: { panNumber: candidate.panNumber },
                responsePayload: panData || {},
                verificationStatus: panStatus,
            }
        });
        let overallStatus = 'FAILED';
        if (aadhaarStatus === 'verified' && panStatus === 'verified') {
            overallStatus = 'VERIFIED';
        }
        else if (aadhaarStatus === 'verified' || panStatus === 'verified') {
            overallStatus = 'PARTIAL';
        }
        console.log('[VERIFICATION] Overall status:', overallStatus);
        const updatedCandidate = await prisma_1.default.candidate.update({
            where: { id: candidate.id },
            data: { status: overallStatus },
        });
        res.json(updatedCandidate);
    }
    catch (error) {
        console.error('[VERIFICATION] Fatal error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};
exports.startVerification = startVerification;
const generateReport = async (req, res) => {
    try {
        const candidate = await prisma_1.default.candidate.findUnique({
            where: { id: req.params.id },
            include: { verificationLogs: true },
        });
        if (!candidate || candidate.createdById !== req.user.userId) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let pdfBuffer;
        if (candidate.reportBase64) {
            pdfBuffer = Buffer.from(candidate.reportBase64, 'base64');
        }
        else {
            pdfBuffer = await (0, pdfService_1.generateVerificationReportPDF)(candidate);
            await prisma_1.default.candidate.update({
                where: { id: candidate.id },
                data: { reportBase64: pdfBuffer.toString('base64') },
            });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${candidate.id}.pdf`);
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
};
exports.generateReport = generateReport;
const deleteCandidate = async (req, res) => {
    try {
        const candidate = await prisma_1.default.candidate.findUnique({ where: { id: req.params.id } });
        if (!candidate || candidate.createdById !== req.user.userId) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        await prisma_1.default.verificationLog.deleteMany({ where: { candidateId: candidate.id } });
        await prisma_1.default.candidate.delete({ where: { id: candidate.id } });
        res.json({ message: 'Candidate deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete candidate' });
    }
};
exports.deleteCandidate = deleteCandidate;
const updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, phone, aadhaarNumber, panNumber, dob, address } = candidate_1.candidateSchema.parse(req.body);
        const candidate = await prisma_1.default.candidate.findUnique({ where: { id: id } });
        if (!candidate || candidate.createdById !== req.user.userId) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        const needsReVerification = candidate.aadhaarNumber !== aadhaarNumber || candidate.panNumber !== panNumber;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedData = {
            fullName,
            email,
            phone,
            aadhaarNumber,
            panNumber,
            dob: new Date(dob),
            address,
        };
        if (needsReVerification) {
            updatedData.status = 'PENDING';
            updatedData.reportBase64 = null;
            await prisma_1.default.verificationLog.deleteMany({ where: { candidateId: id } });
        }
        const updatedCandidate = await prisma_1.default.candidate.update({
            where: { id: id },
            data: updatedData,
        });
        res.json(updatedCandidate);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.issues[0]?.message || 'Invalid candidate details' });
        }
        res.status(500).json({ error: 'Failed to update candidate' });
    }
};
exports.updateCandidate = updateCandidate;
