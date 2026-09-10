import * as employeeService from '../services/employeeService.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * GET /api/employees - List employees (Admin only)
 */
export async function getEmployees(req, res, next) {
  try {
    const result = await employeeService.getEmployees(req.query);
    return sendSuccess(res, result.employees, 'Employees retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/employees/:id - Get employee profile with workload & recent tasks (Admin only)
 */
export async function getEmployeeById(req, res, next) {
  try {
    const result = await employeeService.getEmployeeById(req.params.id);
    return sendSuccess(res, result, 'Employee details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
}
