"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.digitsOnly = exports.fullNameSchema = exports.emailSchema = exports.getEmailTypoMessage = void 0;
const zod_1 = require("zod");
const emailDomainSuggestions = {
    'gmail.co': 'gmail.com',
    'googlemail.co': 'googlemail.com',
    'yahoo.co': 'yahoo.com',
    'outlook.co': 'outlook.com',
    'hotmail.co': 'hotmail.com',
};
const getEmailTypoMessage = (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
        return null;
    }
    const suggestedDomain = emailDomainSuggestions[domain];
    if (!suggestedDomain) {
        return null;
    }
    return `Email domain looks incorrect. Did you mean ${suggestedDomain}?`;
};
exports.getEmailTypoMessage = getEmailTypoMessage;
exports.emailSchema = zod_1.z
    .string({ error: 'Email is required' })
    .trim()
    .email('Enter a valid email address')
    .superRefine((value, ctx) => {
    const typoMessage = (0, exports.getEmailTypoMessage)(value);
    if (typoMessage) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: typoMessage,
        });
    }
})
    .transform((value) => value.toLowerCase());
exports.fullNameSchema = zod_1.z
    .string({ error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, 'Full name can only contain letters, spaces, periods, apostrophes, and hyphens');
const digitsOnly = (value) => {
    if (typeof value !== 'string') {
        return value;
    }
    return value.replace(/\D/g, '');
};
exports.digitsOnly = digitsOnly;
