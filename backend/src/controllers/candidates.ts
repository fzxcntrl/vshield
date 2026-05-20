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

    // Aadhaar Verification
    const aadhaarResponse = await axios.post(`${baseUrl}/mock-api/aadhaar/verify`, {
      aadhaarNumber: candidate.aadhaarNumber,
    }).catch(err => err.response);

    await prisma.verificationLog.create({
      data: {
        candidateId: candidate.id,
        verificationType: 'AADHAAR',
        requestPayload: JSON.stringify({ aadhaarNumber: candidate.aadhaarNumber }),
        responsePayload: JSON.stringify(aadhaarResponse?.data || {}),
        verificationStatus: aadhaarResponse?.data?.status || 'failed',
      }
    });

    // PAN Verification
    const panResponse = await axios.post(`${baseUrl}/mock-api/pan/verify`, {
      panNumber: candidate.panNumber,
    }).catch(err => err.response);

    await prisma.verificationLog.create({
      data: {
        candidateId: candidate.id,
        verificationType: 'PAN',
        requestPayload: JSON.stringify({ panNumber: candidate.panNumber }),
        responsePayload: JSON.stringify(panResponse?.data || {}),
        verificationStatus: panResponse?.data?.status || 'failed',
      }
    });

    const overallStatus = 
      (aadhaarResponse?.data?.status === 'verified' && panResponse?.data?.status === 'verified') 
      ? 'VERIFIED' 
      : 'FAILED';

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { status: overallStatus },
    });

    res.json(updatedCandidate);
  } catch (error) {
    console.error(error);
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

    const pdfBuffer = await generateVerificationReportPDF(candidate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${candidate.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
