import { z } from 'zod';

const emailDomainSuggestions: Record<string, string> = {
  'gmail.co': 'gmail.com',
  'googlemail.co': 'googlemail.com',
  'yahoo.co': 'yahoo.com',
  'outlook.co': 'outlook.com',
  'hotmail.co': 'hotmail.com',
};

export const getEmailTypoMessage = (email: string) => {
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

export const emailSchema = z
  .string({ error: 'Email is required' })
  .trim()
  .email('Enter a valid email address')
  .superRefine((value, ctx) => {
    const typoMessage = getEmailTypoMessage(value);

    if (typoMessage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: typoMessage,
      });
    }
  })
  .transform((value) => value.toLowerCase());

export const fullNameSchema = z
  .string({ error: 'Full name is required' })
  .trim()
  .min(2, 'Full name must be at least 2 characters')
  .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, 'Full name can only contain letters, spaces, periods, apostrophes, and hyphens');

export const digitsOnly = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/\D/g, '');
};
