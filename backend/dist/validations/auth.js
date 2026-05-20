"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("./common");
exports.registerSchema = zod_1.z.object({
    name: common_1.fullNameSchema,
    email: common_1.emailSchema,
    password: zod_1.z
        .string({ error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});
exports.loginSchema = zod_1.z.object({
    email: common_1.emailSchema,
    password: zod_1.z
        .string({ error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters'),
});
