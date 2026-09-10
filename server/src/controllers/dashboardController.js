import * as dashboardService from '../services/dashboardService.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * GET /api/dashboard/admin - Admin Dashboard Metrics
 */
export async function getAdminDashboard(_req, res, next) {
  try {
    const data = await dashboardService.getAdminMetrics();
    return sendSuccess(res, data, 'Admin dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/dashboard/employee - Employee Dashboard Metrics
 */
export async function getEmployeeDashboard(req, res, next) {
  try {
    const data = await dashboardService.getEmployeeMetrics(req.user.id);
    return sendSuccess(res, data, 'Employee dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
}
