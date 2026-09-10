import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/summary', reportController.getExecutiveReport);
router.get('/performance', reportController.getEmployeePerformanceReport);

export default router;
