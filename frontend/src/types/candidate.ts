export type CandidateStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'PARTIAL';

export interface VerificationLog {
  id: string;
  verificationType: string;
  verificationStatus: 'verified' | 'failed';
  responsePayload?: {
    message?: string;
    [key: string]: unknown;
  } | null;
  verifiedAt: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  dob: string;
  address: string;
  status: CandidateStatus;
  createdAt: string;
  verificationLogs?: VerificationLog[];
}
