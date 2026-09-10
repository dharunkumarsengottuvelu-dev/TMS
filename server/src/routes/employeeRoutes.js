import { Router } from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import { employeeQuerySchema, employeeIdParamSchema } from '../validators/employeeValidator.js';

const router = Router();

// Employee endpoints are restricted to ADMIN users
router.use(authenticate, requireRole('ADMIN'));

router.get(
  '/',
  validateRequest({ query: employeeQuerySchema }),
  employeeController.getEmployees
);

router.get(
  '/:id',
  validateRequest({ params: employeeIdParamSchema }),
  employeeController.getEmployeeById
);

export default router;
