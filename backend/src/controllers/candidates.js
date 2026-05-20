"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReport = exports.startVerification = exports.getCandidate = exports.getCandidates = exports.createCandidate = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const axios_1 = __importDefault(require("axios"));
const pdfService_1 = require("../services/pdfService");
const createCandidate = async (req, res) => {
    try {
        const { fullName, email, phone, aadhaarNumber, panNumber, dob, address } = req.body;
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
        // Aadhaar Verification
        const aadhaarResponse = await axios_1.default.post(`${baseUrl}/mock-api/aadhaar/verify`, {
            aadhaarNumber: candidate.aadhaarNumber,
        }).catch(err => err.response);
        await prisma_1.default.verificationLog.create({
            data: {
                candidateId: candidate.id,
                verificationType: 'AADHAAR',
                requestPayload: JSON.stringify({ aadhaarNumber: candidate.aadhaarNumber }),
                responsePayload: JSON.stringify(aadhaarResponse?.data || {}),
                verificationStatus: aadhaarResponse?.data?.status || 'failed',
            }
        });
        // PAN Verification
        const panResponse = await axios_1.default.post(`${baseUrl}/mock-api/pan/verify`, {
            panNumber: candidate.panNumber,
        }).catch(err => err.response);
        await prisma_1.default.verificationLog.create({
            data: {
                candidateId: candidate.id,
                verificationType: 'PAN',
                requestPayload: JSON.stringify({ panNumber: candidate.panNumber }),
                responsePayload: JSON.stringify(panResponse?.data || {}),
                verificationStatus: panResponse?.data?.status || 'failed',
            }
        });
        const overallStatus = (aadhaarResponse?.data?.status === 'verified' && panResponse?.data?.status === 'verified')
            ? 'VERIFIED'
            : 'FAILED';
        const updatedCandidate = await prisma_1.default.candidate.update({
            where: { id: candidate.id },
            data: { status: overallStatus },
        });
        res.json(updatedCandidate);
    }
    catch (error) {
        console.error(error);
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
        const pdfBuffer = await (0, pdfService_1.generateVerificationReportPDF)(candidate);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${candidate.id}.pdf`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};
exports.generateReport = generateReport;
//# sourceMappingURL=candidates.js.map