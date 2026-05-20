"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
describe('Mock APIs', () => {
    describe('POST /mock-api/aadhaar/verify', () => {
        it('should return verified for a valid 12-digit Aadhaar', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/mock-api/aadhaar/verify')
                .send({ aadhaarNumber: '123456789012' });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('verified');
            expect(response.body.nameMatch).toBe(true);
        });
        it('should return failed for an invalid Aadhaar', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/mock-api/aadhaar/verify')
                .send({ aadhaarNumber: '123' }); // Invalid length
            expect(response.status).toBe(400);
            expect(response.body.status).toBe('failed');
        });
    });
    describe('POST /mock-api/pan/verify', () => {
        it('should return verified for a valid PAN', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/mock-api/pan/verify')
                .send({ panNumber: 'ABCDE1234F' });
            expect(response.status).toBe(200);
            expect(response.body.status).toBe('verified');
        });
        it('should return failed for an invalid PAN format', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/mock-api/pan/verify')
                .send({ panNumber: '12345ABCDE' });
            expect(response.status).toBe(400);
            expect(response.body.status).toBe('failed');
        });
    });
});
