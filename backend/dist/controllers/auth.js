"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const zod_1 = require("zod");
const auth_1 = require("../validations/auth");
const register = async (req, res) => {
    try {
        const { name, email, password } = auth_1.registerSchema.parse(req.body);
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: { name, email, passwordHash },
        });
        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.issues[0]?.message || 'Invalid request data' });
        }
        res.status(400).json({ error: 'Invalid request data or server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = auth_1.loginSchema.parse(req.body);
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, name: user.name }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d',
        });
        res.json({ token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.issues[0]?.message || 'Invalid request data' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};
exports.login = login;
