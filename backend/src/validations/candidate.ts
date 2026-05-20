import { z } from 'zod';
import { digitsOnly, emailSchema, fullNameSchema } from './common';

const adultDateOfBirthSchema = z
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
  }, 'Candidate must be at least 18 years old');

export const candidateSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: z.preprocess(
    digitsOnly,
    z.string().regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian mobile number'),
  ),
  aadhaarNumber: z.preprocess(
    digitsOnly,
    z
      .string()
      .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
      .refine((value) => {
        const firstDigit = value.charAt(0);
        return firstDigit !== '0' && firstDigit !== '9';
      }, 'Aadhaar number cannot start with 0 or 9 (UIDAI official rule)'),
  ),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format. Must be AAAAA9999A')
    .refine((value) => {
      const fourthChar = value.charAt(3);
      return ['P', 'C', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'].includes(fourthChar);
    }, 'Invalid PAN. 4th character must be valid entity type (P=Individual, C=Company, etc.)'),
  dob: adultDateOfBirthSchema,
  address: z.string().trim().min(10, 'Address must be at least 10 characters'),
});
