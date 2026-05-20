import { z } from 'zod';

const emailDomainSuggestions: Record<string, string> = {
  'gmail.co': 'gmail.com',
  'googlemail.co': 'googlemail.com',
  'yahoo.co': 'yahoo.com',
  'outlook.co': 'outlook.com',
  'hotmail.co': 'hotmail.com',
};

const getEmailTypoMessage = (email: string) => {
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
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .superRefine((value, ctx) => {
    const typoMessage = getEmailTypoMessage(value);

    if (typoMessage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: typoMessage,
      });
    }
  });

export const fullNameSchema = z
  .string({ error: 'Full name is required' })
  .trim()
  .min(2, 'Full name must be at least 2 characters')
  .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, 'Full name can only contain letters, spaces, periods, apostrophes, and hyphens');

export const candidateFormSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian mobile number'),
  aadhaarNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
    .refine((value) => {
      const firstDigit = value.charAt(0);
      return firstDigit !== '0' && firstDigit !== '9';
    }, 'Aadhaar number cannot start with 0 or 9 (UIDAI rule)'),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Must be AAAAA9999A (e.g., ABCPE1234F)')
    .refine((value) => {
      const fourthChar = value.charAt(3);
      return ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'].includes(fourthChar);
    }, 'Invalid PAN. 4th character must be valid entity type (P=Individual, C=Company, etc.)'),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Enter a valid date of birth')
    .refine((value) => {
      const date = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDifference = today.getMonth() - date.getMonth();

      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < date.getDate())) {
        age -= 1;
      }

      return age >= 18;
    }, 'Candidate must be at least 18 years old'),
  address: z.string().trim().min(10, 'Address must be at least 10 characters'),
});
