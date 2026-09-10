import { Router } from 'express';
import * as auditController from '../controllers/auditController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/', auditController.getAuditLogs);

export default router;
