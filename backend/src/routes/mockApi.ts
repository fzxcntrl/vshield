import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Mock Aadhaar Verification API
 * 
 * Official Aadhaar Rules (UIDAI):
 * 1. Must be exactly 12 digits
 * 2. First digit cannot be 0 or 9 (official UIDAI rule)
 * 3. Completely random number with no intelligence
 * 4. Requires biometric authentication (simulated here)
 * 5. Valid for life
 * 
 * For Testing: Numbers ending with 0 will fail verification
 */
router.post('/aadhaar/verify', (req: Request, res: Response) => {
  const { aadhaarNumber } = req.body;
  
  console.log('[AADHAAR VERIFY] Received:', aadhaarNumber);
  
  // Validation 1: Must be 12 digits
  if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
    console.log('[AADHAAR VERIFY] Invalid format - must be 12 digits');
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid Aadhaar format. Must be exactly 12 digits.',
    });
  }

  // Validation 2: First digit cannot be 0 or 9 (Official UIDAI Rule)
  const firstDigit = aadhaarNumber.charAt(0);
  if (firstDigit === '0' || firstDigit === '9') {
    console.log('[AADHAAR VERIFY] Failed - first digit is 0 or 9');
    return res.json({
      status: 'failed',
      nameMatch: false,
      dobMatch: false,
      biometricMatch: false,
      message: 'Invalid Aadhaar number. First digit cannot be 0 or 9.',
    });
  }

  // Validation 3: Test rule - numbers ending with 0 fail (for demo purposes)
  if (aadhaarNumber.endsWith('0')) {
    console.log('[AADHAAR VERIFY] Failed - ends with 0 (test rule)');
    return res.json({
      status: 'failed',
      nameMatch: false,
      dobMatch: false,
      biometricMatch: false,
      message: 'Aadhaar verification failed. Biometric authentication did not match.',
    });
  }

  // Success case - simulates successful biometric verification
  console.log('[AADHAAR VERIFY] Success');
  return res.json({
    status: 'verified',
    nameMatch: true,
    dobMatch: true,
    biometricMatch: true,
    message: 'Aadhaar verified successfully with biometric authentication',
    verifiedAt: new Date().toISOString(),
    aadhaarStatus: 'active',
  });
});

/**
 * Mock PAN Verification API
 * 
 * Official PAN Rules (Income Tax Department - April 2026):
 * Format: AAAAA9999A (5 letters + 4 digits + 1 letter)
 * 
 * Structure:
 * - Characters 1-3: Alphabetic series (AAA to ZZZ)
 * - Character 4: Status/Type of holder
 *   P = Individual
 *   C = Company
 *   H = Hindu Undivided Family (HUF)
 *   F = Firm/LLP
 *   A = Association of Persons (AOP)
 *   B = Body of Individuals (BOI)
 *   G = Government
 *   J = Artificial Juridical Person
 *   L = Local Authority
 *   T = Trust
 * - Character 5: First letter of surname/entity name
 * - Characters 6-9: Sequential numbers (0001-9999)
 * - Character 10: Alphabetic check digit
 * 
 * 2026 Rules:
 * - Name must match Aadhaar exactly
 * - Cannot rely solely on Aadhaar (need additional DOB proof)
 * - Mother's name mandatory
 * - Multiple PANs are illegal (penalty under section 272B)
 * 
 * For Testing: Numbers ending with 'Z' will fail verification
 */
router.post('/pan/verify', (req: Request, res: Response) => {
  const { panNumber } = req.body;
  
  console.log('[PAN VERIFY] Received:', panNumber);
  
  // Validation 1: Must match PAN format AAAAA9999A
  if (!panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    console.log('[PAN VERIFY] Invalid format');
    return res.status(400).json({
      status: 'failed',
      message: 'Invalid PAN format. Must be in format: AAAAA9999A (e.g., ABCDE1234F)',
    });
  }

  // Validation 2: 4th character must be valid entity type
  const fourthChar = panNumber.charAt(3);
  const validEntityTypes: Record<string, string> = {
    'P': 'Individual',
    'C': 'Company',
    'H': 'Hindu Undivided Family (HUF)',
    'F': 'Firm/LLP',
    'A': 'Association of Persons (AOP)',
    'B': 'Body of Individuals (BOI)',
    'G': 'Government',
    'J': 'Artificial Juridical Person',
    'L': 'Local Authority',
    'T': 'Trust',
  };

  if (!validEntityTypes[fourthChar]) {
    console.log('[PAN VERIFY] Failed - invalid 4th character (entity type)');
    return res.json({
      status: 'failed',
      panStatus: 'invalid',
      message: `Invalid PAN structure. 4th character '${fourthChar}' is not a valid entity type.`,
    });
  }

  // Validation 3: First 3 characters should be alphabetic series (AAA-ZZZ)
  const firstThree = panNumber.substring(0, 3);
  if (!/^[A-Z]{3}$/.test(firstThree)) {
    console.log('[PAN VERIFY] Failed - invalid first 3 characters');
    return res.json({
      status: 'failed',
      panStatus: 'invalid',
      message: 'Invalid PAN structure. First 3 characters must be letters.',
    });
  }

  // Validation 4: 5th character should be a letter (first letter of surname/entity)
  const fifthChar = panNumber.charAt(4);
  if (!/^[A-Z]$/.test(fifthChar)) {
    console.log('[PAN VERIFY] Failed - invalid 5th character');
    return res.json({
      status: 'failed',
      panStatus: 'invalid',
      message: 'Invalid PAN structure. 5th character must be a letter.',
    });
  }

  // Validation 5: Test rule - numbers ending with 'Z' fail (for demo purposes)
  if (panNumber.endsWith('Z')) {
    console.log('[PAN VERIFY] Failed - ends with Z (test rule)');
    return res.json({
      status: 'failed',
      panStatus: 'inactive',
      message: 'PAN verification failed. PAN is inactive, cancelled, or does not match Aadhaar records.',
    });
  }

  // Success case
  console.log('[PAN VERIFY] Success');
  return res.json({
    status: 'verified',
    panStatus: 'active',
    message: 'PAN verified successfully. Name matches Aadhaar records.',
    verifiedAt: new Date().toISOString(),
    panType: validEntityTypes[fourthChar],
    holderType: fourthChar,
    aadhaarLinked: true,
    nameMatchWithAadhaar: true,
  });
});

export default router;
