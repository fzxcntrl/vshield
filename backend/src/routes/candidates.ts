import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createCandidate, getCandidates, getCandidate, startVerification, generateReport } from '../controllers/candidates';

const router = Router();

router.use(authenticate);

router.post('/', createCandidate);
router.get('/', getCandidates);
router.get('/:id', getCandidate);
router.post('/:id/verify', startVerification);
router.get('/:id/report', generateReport);

export default router;
