import { Router } from 'express';
import * as employeeController from '../controllers/employeeController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  employeeQuerySchema,
  employeeIdParamSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeStatusSchema,
} from '../validators/employeeValidator.js';

const router = Router();

// All employee management endpoints are Admin-only
router.use(authenticate, requireRole('ADMIN'));

// GET /api/employees — list with filters, search, pagination
router.get(
  '/',
  validateRequest({ query: employeeQuerySchema }),
  employeeController.getEmployees
);

// GET /api/employees/departments — distinct departments for filter UI
router.get('/departments', employeeController.getDepartments);

// POST /api/employees — create new employee account
router.post(
  '/',
  validateRequest({ body: createEmployeeSchema }),
  employeeController.createEmployee
);

// GET /api/employees/:id — employee profile + workload
router.get(
  '/:id',
  validateRequest({ params: employeeIdParamSchema }),
  employeeController.getEmployeeById
);

// PATCH /api/employees/:id — update employee profile fields
router.patch(
  '/:id',
  validateRequest({ params: employeeIdParamSchema, body: updateEmployeeSchema }),
  employeeController.updateEmployee
);

// PATCH /api/employees/:id/status — activate or deactivate
router.patch(
  '/:id/status',
  validateRequest({ params: employeeIdParamSchema, body: employeeStatusSchema }),
  employeeController.updateEmployeeStatus
);

// POST /api/employees/:id/resend-invitation — resend onboarding email
router.post(
  '/:id/resend-invitation',
  validateRequest({ params: employeeIdParamSchema }),
  employeeController.resendInvitation
);

// DELETE /api/employees/:id — permanently delete employee account
router.delete(
  '/:id',
  validateRequest({ params: employeeIdParamSchema }),
  employeeController.deleteEmployee
);

export default router;
