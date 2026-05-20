import request from 'supertest';
import app from '../app';
import prisma from '../prisma';
import jwt from 'jsonwebtoken';

jest.mock('../prisma', () => ({
  __esModule: true,
  default: {
    candidate: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    verificationLog: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    }
  },
}));

const mockToken = jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET || 'secret');

describe('Candidates API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/candidates', () => {
    it('should return 401 if unauthorized', async () => {
      const response = await request(app)
        .post('/api/candidates')
        .send({});
      
      expect(response.status).toBe(401);
    });

    it('should create a candidate successfully', async () => {
      (prisma.candidate.create as jest.Mock).mockResolvedValue({
        id: 'cand-123',
        fullName: 'John Doe',
        status: 'PENDING'
      });

      const response = await request(app)
        .post('/api/candidates')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          fullName: 'John Doe',
          email: 'john@test.com',
          phone: '9876543210',
          aadhaarNumber: '123456789012',
          panNumber: 'ABCDE1234F',
          dob: '1990-01-01',
          address: '123 Test St'
        });

      expect(response.status).toBe(201);
      expect(response.body.fullName).toBe('John Doe');
      expect(prisma.candidate.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/candidates/:id', () => {
    it('should update candidate successfully and clear logs if critical fields change', async () => {
      (prisma.candidate.findUnique as jest.Mock).mockResolvedValue({
        id: 'cand-123',
        createdById: 'user-123',
        aadhaarNumber: 'oldAadhaar',
        panNumber: 'oldPan',
      });
      (prisma.candidate.update as jest.Mock).mockResolvedValue({
        id: 'cand-123',
        status: 'PENDING'
      });

      const response = await request(app)
        .put('/api/candidates/cand-123')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          fullName: 'John Doe Edit',
          email: 'john@test.com',
          phone: '9876543210',
          aadhaarNumber: '234567890123',
          panNumber: 'ABCDE1234F',
          dob: '1990-01-01',
          address: '123 Test St'
        });

      expect(response.status).toBe(200);
      expect(prisma.verificationLog.deleteMany).toHaveBeenCalled();
    });
  });
});
