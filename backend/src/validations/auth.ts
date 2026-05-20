import { z } from 'zod';
import { emailSchema, fullNameSchema } from './common';

export const registerSchema = z.object({
  name: fullNameSchema,
  email: emailSchema,
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
});
