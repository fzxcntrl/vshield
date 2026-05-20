"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
const mockToken = jsonwebtoken_1.default.sign({ userId: 'user-123' }, process.env.JWT_SECRET || 'secret');
describe('Candidates API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/candidates', () => {
        it('should return 401 if unauthorized', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/candidates')
                .send({});
            expect(response.status).toBe(401);
        });
        it('should create a candidate successfully', async () => {
            prisma_1.default.candidate.create.mockResolvedValue({
                id: 'cand-123',
                fullName: 'John Doe',
                status: 'PENDING'
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/candidates')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                fullName: 'John Doe',
                email: 'john@test.com',
                phone: '1234567890',
                aadhaarNumber: '123456789012',
                panNumber: 'ABCDE1234F',
                dob: '1990-01-01',
                address: '123 Test St'
            });
            expect(response.status).toBe(201);
            expect(response.body.fullName).toBe('John Doe');
            expect(prisma_1.default.candidate.create).toHaveBeenCalled();
        });
    });
    describe('PUT /api/candidates/:id', () => {
        it('should update candidate successfully and clear logs if critical fields change', async () => {
            prisma_1.default.candidate.findUnique.mockResolvedValue({
                id: 'cand-123',
                createdById: 'user-123',
                aadhaarNumber: 'oldAadhaar',
                panNumber: 'oldPan',
            });
            prisma_1.default.candidate.update.mockResolvedValue({
                id: 'cand-123',
                status: 'PENDING'
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/candidates/cand-123')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({
                fullName: 'John Doe Edit',
                email: 'john@test.com',
                phone: '1234567890',
                aadhaarNumber: 'newAadhaar',
                panNumber: 'ABCDE1234F',
                dob: '1990-01-01',
                address: '123 Test St'
            });
            expect(response.status).toBe(200);
            expect(prisma_1.default.verificationLog.deleteMany).toHaveBeenCalled();
        });
    });
});
