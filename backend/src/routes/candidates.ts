import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createCandidate, getCandidates, getCandidate, startVerification, generateReport, deleteCandidate, updateCandidate } from '../controllers/candidates';

const router = Router();

router.use(authenticate);

router.post('/', createCandidate);
router.get('/', getCandidates);
router.get('/:id', getCandidate);
router.post('/:id/verify', startVerification);
router.get('/:id/report', generateReport);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

export default router;
