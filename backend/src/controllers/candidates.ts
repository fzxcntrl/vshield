import { Request, Response } from 'express';
import prisma from '../prisma';
import axios from 'axios';
import { generateVerificationReportPDF } from '../services/pdfService';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const createCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, phone, aadhaarNumber, panNumber, dob, address } = req.body;
    const candidate = await prisma.candidate.create({
      data: {
        fullName,
        email,
        phone,
        aadhaarNumber,
        panNumber,
        dob: new Date(dob),
        address,
        createdById: req.user!.userId,
      },
    });
    res.status(201).json(candidate);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create candidate' });
  }
};

export const getCandidates = async (req: AuthRequest, res: Response) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { createdById: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id as string },
      include: { verificationLogs: true },
    });
    if (!candidate || candidate.createdById !== req.user!.userId) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const startVerification = async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findUnique({ where: { id: req.params.id as string } });
    if (!candidate || candidate.createdById !== req.user!.userId) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const aadhaarUrl = process.env.AADHAAR_API_URL || `${baseUrl}/mock-api/aadhaar/verify`;
    const panUrl = process.env.PAN_API_URL || `${baseUrl}/mock-api/pan/verify`;

    const aadhaarResponse = await axios.post(aadhaarUrl, {
      aadhaarNumber: candidate.aadhaarNumber,
    }).catch(err => err.response);

    await prisma.verificationLog.create({
      data: {
        candidateId: candidate.id,
        verificationType: 'AADHAAR',
        requestPayload: { aadhaarNumber: candidate.aadhaarNumber },
        responsePayload: aadhaarResponse?.data || {},
        verificationStatus: aadhaarResponse?.data?.status || 'failed',
      }
    });

    const panResponse = await axios.post(panUrl, {
      panNumber: candidate.panNumber,
    }).catch(err => err.response);

    await prisma.verificationLog.create({
      data: {
        candidateId: candidate.id,
        verificationType: 'PAN',
        requestPayload: { panNumber: candidate.panNumber },
        responsePayload: panResponse?.data || {},
        verificationStatus: panResponse?.data?.status || 'failed',
      }
    });

    let overallStatus = 'FAILED';
    if (aadhaarResponse?.data?.status === 'verified' && panResponse?.data?.status === 'verified') {
      overallStatus = 'VERIFIED';
    } else if (aadhaarResponse?.data?.status === 'verified' || panResponse?.data?.status === 'verified') {
      overallStatus = 'PARTIAL';
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { status: overallStatus },
    });

    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const generateReport = async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id as string },
      include: { verificationLogs: true },
    });

    if (!candidate || candidate.createdById !== req.user!.userId) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pdfBuffer: any;
    if (candidate.reportBase64) {
      pdfBuffer = Buffer.from(candidate.reportBase64, 'base64');
    } else {
      pdfBuffer = await generateVerificationReportPDF(candidate);
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { reportBase64: pdfBuffer.toString('base64') },
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${candidate.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const candidate = await prisma.candidate.findUnique({ where: { id: req.params.id as string } });
    if (!candidate || candidate.createdById !== req.user!.userId) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    await prisma.verificationLog.deleteMany({ where: { candidateId: candidate.id } });
    await prisma.candidate.delete({ where: { id: candidate.id } });

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, aadhaarNumber, panNumber, dob, address } = req.body;

    const candidate = await prisma.candidate.findUnique({ where: { id: id as string } });
    if (!candidate || candidate.createdById !== req.user!.userId) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const needsReVerification = candidate.aadhaarNumber !== aadhaarNumber || candidate.panNumber !== panNumber;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedData: any = {
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
      await prisma.verificationLog.deleteMany({ where: { candidateId: id as string } });
    }

    const updatedCandidate = await prisma.candidate.update({
      where: { id: id as string },
      data: updatedData,
    });

    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate' });
  }
};
