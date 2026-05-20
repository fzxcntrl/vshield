"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const prisma_1 = __importDefault(require("../prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    },
}));
describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/auth/login', () => {
        it('should return 400 for missing credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' }); // missing password
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });
        it('should return 400 for invalid credentials (user not found)', async () => {
            prisma_1.default.user.findUnique.mockResolvedValue(null);
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@test.com', password: 'password123' });
            expect(response.status).toBe(401);
            expect(response.body.error).toBe('Invalid credentials');
        });
        it('should return a token for valid credentials', async () => {
            const hashedPassword = await bcrypt_1.default.hash('password123', 10);
            prisma_1.default.user.findUnique.mockResolvedValue({
                id: 'user-123',
                email: 'test@test.com',
                passwordHash: hashedPassword,
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'password123' });
            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
        });
    });
});
