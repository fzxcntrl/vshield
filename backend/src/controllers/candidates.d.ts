import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}
export declare const createCandidate: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCandidates: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getCandidate: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const startVerification: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateReport: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=candidates.d.ts.map