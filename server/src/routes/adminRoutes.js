import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { testEmailSchema } from '../validators/employeeValidator.js';
import { testEmail } from '../controllers/employeeController.js';

const router = Router();

// Strict Admin-only protection
router.use(authenticate, requireRole('ADMIN'));

// POST /api/admin/email/test
router.post(
  '/email/test',
  validateRequest({ body: testEmailSchema }),
  testEmail
);

export default router;
