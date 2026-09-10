import * as employeeService from '../services/employeeService.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * GET /api/employees — List employees with filters, search, pagination (Admin only)
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
 * GET /api/employees/departments — Get distinct department list (Admin only)
 */
export async function getDepartments(req, res, next) {
  try {
    const departments = await employeeService.getDepartments();
    return sendSuccess(res, departments, 'Departments retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/employees/:id — Get employee profile with workload & recent tasks (Admin only)
 */
export async function getEmployeeById(req, res, next) {
  try {
    const result = await employeeService.getEmployeeById(req.params.id);
    return sendSuccess(res, result, 'Employee details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/employees — Create new employee account (Admin only)
 */
export async function createEmployee(req, res, next) {
  try {
    const result = await employeeService.createEmployee({
      ...req.body,
      actorId: req.user.id,
      actorRole: req.user.role,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });

    const message = result.emailNotificationSent
      ? 'Employee account created and welcome email sent successfully.'
      : 'Employee account created successfully (welcome email could not be delivered).';

    return sendSuccess(res, result.employee, message, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/employees/:id — Update employee profile (Admin only)
 */
export async function updateEmployee(req, res, next) {
  try {
    const employee = await employeeService.updateEmployee({
      employeeId: req.params.id,
      updates: req.body,
      actorId: req.user.id,
      actorRole: req.user.role,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });
    return sendSuccess(res, employee, 'Employee profile updated successfully', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/employees/:id/status — Activate or deactivate employee (Admin only)
 */
export async function updateEmployeeStatus(req, res, next) {
  try {
    const result = await employeeService.updateEmployeeStatus({
      employeeId: req.params.id,
      isActive: req.body.isActive,
      actorId: req.user.id,
      actorRole: req.user.role,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });

    const action = result.employee.isActive ? 'activated' : 'deactivated';
    return sendSuccess(res, result, `Employee account ${action} successfully`, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/employees/:id/resend-invitation — Resend onboarding invitation (Admin only)
 */
export async function resendInvitation(req, res, next) {
  try {
    const result = await employeeService.resendInvitation({
      employeeId: req.params.id,
      actorId: req.user.id,
      actorRole: req.user.role,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });

    const message = result.emailNotificationSent
      ? 'Invitation email resent successfully.'
      : 'Invitation resend attempted but email delivery failed.';

    return sendSuccess(res, null, message, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/employees/:id — Permanently delete employee account (Admin only)
 */
export async function deleteEmployee(req, res, next) {
  try {
    const result = await employeeService.deleteEmployee({
      employeeId: req.params.id,
      actorId: req.user.id,
      actorRole: req.user.role,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });
    return sendSuccess(res, result, `Employee "${result.snapshot.name}" has been permanently deleted.`, 200);
  } catch (error) {
    next(error);
  }
}
