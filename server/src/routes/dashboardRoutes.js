import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = Router();

// All dashboard endpoints require authentication
router.use(authenticate);

// Admin dashboard
router.get('/admin', requireRole('ADMIN'), dashboardController.getAdminDashboard);

// Employee dashboard
router.get('/employee', requireRole('EMPLOYEE'), dashboardController.getEmployeeDashboard);

export default router;
