import { randomBytes } from 'crypto';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';
import { recordAudit } from './auditService.js';
import { sendWelcomeEmail, sendEmployeeProfileUpdatedEmail, sendEmployeeStatusChangedEmail } from './emailService.js';
import { env } from '../config/env.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Auto-generate the next sequential Employee ID (EMP-1001, EMP-1002, …)
 */
async function generateEmployeeId() {
  const last = await User.findOne({ employeeId: { $ne: null } })
    .sort({ employeeId: -1 })
    .select('employeeId')
    .lean();

  if (!last || !last.employeeId) {
    return 'EMP-1001';
  }
  const num = parseInt(last.employeeId.replace('EMP-', ''), 10) || 1000;
  return `EMP-${num + 1}`;
}

/**
 * Build query filters for employee listing
 */
function buildEmployeeQuery({ search, status, role, department }) {
  const query = {};

  // Role filter (default to EMPLOYEE only if no role filter specified)
  if (role && role !== 'all') {
    query.role = role;
  } else if (!role || role === 'all') {
    // Show both ADMIN and EMPLOYEE by default in management view
    query.role = { $in: ['ADMIN', 'EMPLOYEE'] };
  }

  // Status filter
  if (status && status !== 'all') {
    query.isActive = status === 'ACTIVE';
  }

  // Department filter
  if (department && department.trim()) {
    query.department = new RegExp(department.trim(), 'i');
  }

  // Full-text search
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex },
      { department: searchRegex },
      { designation: searchRegex },
    ];
  }

  return query;
}

// ---------------------------------------------------------------------------
// List employees
// ---------------------------------------------------------------------------
export async function getEmployees({ search, page = 1, limit = 10, status, role, department } = {}) {
  const query = buildEmployeeQuery({ search, status, role, department });
  const skip = (page - 1) * limit;

  const now = new Date();

  const [total, employees] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select('name email role isActive employeeId department designation phone joiningDate onboardingStatus createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  // Aggregate task counts including overdue
  const employeeIds = employees.map((e) => e._id);
  const taskCounts = await Task.aggregate([
    { $match: { assignedEmployee: { $in: employeeIds }, isArchived: { $ne: true } } },
    {
      $group: {
        _id: '$assignedEmployee',
        totalTasks: { $sum: 1 },
        notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'COMPLETED'] },
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', now] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const taskCountMap = {};
  taskCounts.forEach((c) => {
    taskCountMap[c._id.toString()] = c;
  });

  const enrichedEmployees = employees.map((emp) => ({
    ...emp,
    taskStats: taskCountMap[emp._id.toString()] || {
      totalTasks: 0,
      notStarted: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
    },
  }));

  return {
    employees: enrichedEmployees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

// ---------------------------------------------------------------------------
// Get single employee details
// ---------------------------------------------------------------------------
export async function getEmployeeById(employeeId) {
  const employee = await User.findById(employeeId)
    .select('name email role isActive employeeId department designation phone joiningDate onboardingStatus createdAt updatedAt')
    .lean();

  if (!employee) {
    throw ApiError.notFound('Employee not found.');
  }

  const now = new Date();

  const [taskStats, recentTasks] = await Promise.all([
    Task.aggregate([
      { $match: { assignedEmployee: employee._id, isArchived: { $ne: true } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'COMPLETED'] },
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', now] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Task.find({ assignedEmployee: employee._id, isArchived: { $ne: true } })
      .populate('assignedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(15)
      .lean(),
  ]);

  const stats = taskStats[0] || { total: 0, notStarted: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return {
    employee,
    stats: { ...stats, completionRate },
    recentTasks: recentTasks.map((t) => ({
      ...t,
      isOverdue: t.dueDate && t.status !== 'COMPLETED' && new Date() > new Date(t.dueDate),
    })),
  };
}

// ---------------------------------------------------------------------------
// Create employee (Admin action — uses Better Auth's own user creation)
// ---------------------------------------------------------------------------
export async function createEmployee({ name, email, role = 'EMPLOYEE', department, designation, phone, joiningDate, employeeId: customEmployeeId, password, actorId, actorRole, ip }) {
  const { auth } = await import('../auth/auth.js');

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Duplicate email check
  const existingEmail = await User.findOne({ email: normalizedEmail });
  if (existingEmail) {
    throw ApiError.conflict('An account with this email address already exists.');
  }

  // Resolve employeeId
  let resolvedEmployeeId = customEmployeeId ? customEmployeeId.trim() : null;
  if (resolvedEmployeeId) {
    const existingId = await User.findOne({ employeeId: resolvedEmployeeId });
    if (existingId) {
      throw ApiError.conflict(`Employee ID "${resolvedEmployeeId}" is already in use.`);
    }
  } else {
    resolvedEmployeeId = await generateEmployeeId();
  }

  // Generate a strong random temporary password if none is provided
  const actualPassword = password && password.trim() ? password.trim() : randomBytes(12).toString('base64').replace(/[/+=]/g, 'A') + '!7Kx';

  // Use Better Auth's signUpEmail to create the auth account (handles all hashing internally)
  try {
    await auth.api.signUpEmail({
      body: {
        name: name.trim(),
        email: normalizedEmail,
        password: actualPassword,
      },
      headers: new globalThis.Headers({
        'x-internal-create': 'true',
        origin: env.CLIENT_URL || 'http://localhost:5173',
      }),
    });
  } catch (authErr) {
    console.error('❌ [createEmployee] Error in auth.api.signUpEmail:', authErr);
    const message =
      authErr?.body?.message ||
      authErr?.message ||
      'Failed to create employee authentication account. Please try again.';
    throw ApiError.badRequest(message);
  }

  // Update the newly created user record with employee-specific fields
  const newUser = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        role,
        isActive: true,
        employeeId: resolvedEmployeeId,
        department: department || null,
        designation: designation || null,
        phone: phone || null,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
        onboardingStatus: 'INVITED',
        lastInvitationSentAt: new Date(),
      },
    },
    { new: true }
  );

  if (!newUser) {
    throw ApiError.internal('Employee record could not be finalized after account creation.');
  }

  // Send welcome email (non-blocking)
  const loginUrl = env.CLIENT_URL || 'http://localhost:5173';
  const emailResult = await sendWelcomeEmail({
    employeeName: name.trim(),
    employeeEmail: normalizedEmail,
    employeeId: resolvedEmployeeId,
    role,
    department: department || null,
    designation: designation || null,
    password: actualPassword,
    loginUrl,
  });

  // Audit log
  await recordAudit({
    actor: actorId,
    role: actorRole,
    action: 'CREATE_EMPLOYEE',
    entity: 'EMPLOYEE',
    entityId: newUser._id,
    details: {
      name: name.trim(),
      email: normalizedEmail,
      employeeId: resolvedEmployeeId,
      role,
      department: department || null,
    },
    ip,
  });

  return {
    employee: newUser.toObject(),
    emailNotificationSent: emailResult.success,
  };
}

// ---------------------------------------------------------------------------
// Update employee profile (Admin action)
// ---------------------------------------------------------------------------
export async function updateEmployee({ employeeId, updates, actorId, actorRole, ip }) {
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw ApiError.notFound('Employee not found.');
  }

  const allowedFields = ['name', 'department', 'designation', 'phone', 'role', 'joiningDate'];
  const oldValues = {};
  const newValues = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined && updates[field] !== null) {
      oldValues[field] = employee[field];
      if (field === 'joiningDate') {
        employee[field] = updates[field] ? new Date(updates[field]) : null;
      } else {
        employee[field] = updates[field];
      }
      newValues[field] = employee[field];
    }
  }

  await employee.save();

  await recordAudit({
    actor: actorId,
    role: actorRole,
    action: 'UPDATE_EMPLOYEE',
    entity: 'EMPLOYEE',
    entityId: employee._id,
    details: { oldValues, newValues },
    ip,
  });

  // Dispatch profile update email notification (non-blocking)
  try {
    const adminActor = await User.findById(actorId).lean();
    await sendEmployeeProfileUpdatedEmail({
      employeeName: employee.name,
      employeeEmail: employee.email,
      employeeId: employee.employeeId,
      updatedFields: newValues,
      updatedByName: adminActor?.name || 'Administrator',
    });
  } catch (emailErr) {
    console.warn('⚠️ [EmployeeService] Profile update email notification notice:', emailErr.message);
  }

  return employee.toObject();
}

// ---------------------------------------------------------------------------
// Activate / Deactivate employee (Admin action)
// ---------------------------------------------------------------------------
export async function updateEmployeeStatus({ employeeId, isActive, actorId, actorRole, ip }) {
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw ApiError.notFound('Employee not found.');
  }

  if (employee.isActive === isActive) {
    const state = isActive ? 'active' : 'inactive';
    throw ApiError.conflict(`Employee is already ${state}.`);
  }

  // Count active tasks before deactivation
  let activeTaskCount = 0;
  let overdueTaskCount = 0;
  if (!isActive) {
    const now = new Date();
    [activeTaskCount, overdueTaskCount] = await Promise.all([
      Task.countDocuments({
        assignedEmployee: employee._id,
        status: { $in: ['NOT_STARTED', 'PENDING', 'IN_PROGRESS'] },
        isArchived: { $ne: true },
      }),
      Task.countDocuments({
        assignedEmployee: employee._id,
        status: { $nin: ['COMPLETED'] },
        dueDate: { $lt: now },
        isArchived: { $ne: true },
      }),
    ]);
  }

  const previousStatus = employee.isActive;
  employee.isActive = isActive;
  employee.onboardingStatus = isActive ? 'ACTIVE' : 'INACTIVE';
  await employee.save();

  await recordAudit({
    actor: actorId,
    role: actorRole,
    action: isActive ? 'ACTIVATE_EMPLOYEE' : 'DEACTIVATE_EMPLOYEE',
    entity: 'EMPLOYEE',
    entityId: employee._id,
    details: {
      previousStatus,
      newStatus: isActive,
      activeTasksAtDeactivation: !isActive ? activeTaskCount : undefined,
    },
    ip,
  });

  // Dispatch account activation/deactivation email notification (non-blocking)
  try {
    const adminActor = await User.findById(actorId).lean();
    await sendEmployeeStatusChangedEmail({
      employeeName: employee.name,
      employeeEmail: employee.email,
      isActive,
      updatedByName: adminActor?.name || 'Administrator',
    });
  } catch (emailErr) {
    console.warn('⚠️ [EmployeeService] Account status email notification notice:', emailErr.message);
  }

  return {
    employee: employee.toObject(),
    activeTaskCount,
    overdueTaskCount,
  };
}

// ---------------------------------------------------------------------------
// Resend invitation email (rate-limited to once per 5 minutes)
// ---------------------------------------------------------------------------
export async function resendInvitation({ employeeId, actorId, actorRole, ip }) {
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw ApiError.notFound('Employee not found.');
  }

  if (!employee.isActive) {
    throw ApiError.badRequest('Cannot resend invitation to a deactivated employee.');
  }

  // Rate limit: 5 minutes between resends
  const RATE_LIMIT_MS = 5 * 60 * 1000;
  if (employee.lastInvitationSentAt) {
    const elapsed = Date.now() - new Date(employee.lastInvitationSentAt).getTime();
    if (elapsed < RATE_LIMIT_MS) {
      const waitSec = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
      throw ApiError.tooManyRequests(`Invitation recently sent. Please wait ${waitSec} seconds before resending.`);
    }
  }

  const loginUrl = env.CLIENT_URL || 'http://localhost:5173';
  const emailResult = await sendWelcomeEmail({
    employeeName: employee.name,
    employeeEmail: employee.email,
    employeeId: employee.employeeId,
    role: employee.role,
    department: employee.department,
    designation: employee.designation,
    loginUrl,
  });

  employee.lastInvitationSentAt = new Date();
  employee.onboardingStatus = 'INVITED';
  await employee.save();

  await recordAudit({
    actor: actorId,
    role: actorRole,
    action: 'RESEND_INVITATION',
    entity: 'EMPLOYEE',
    entityId: employee._id,
    details: { email: employee.email, employeeId: employee.employeeId },
    ip,
  });

  return { emailNotificationSent: emailResult.success };
}

// ---------------------------------------------------------------------------
// Get distinct departments for filter dropdown
// ---------------------------------------------------------------------------
export async function getDepartments() {
  const departments = await User.distinct('department', { department: { $ne: null } });
  return departments.filter(Boolean).sort();
}

// ---------------------------------------------------------------------------
// Delete employee (Admin action — permanent, hard delete)
// ---------------------------------------------------------------------------
export async function deleteEmployee({ employeeId, actorId, actorRole, ip }) {
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw ApiError.notFound('Employee not found.');
  }

  // Unassign any open tasks from this employee
  await Task.updateMany(
    { assignedEmployee: employee._id, status: { $nin: ['COMPLETED'] } },
    { $unset: { assignedEmployee: '' } }
  );

  const snapshot = {
    name: employee.name,
    email: employee.email,
    employeeId: employee.employeeId,
    role: employee.role,
    department: employee.department,
  };

  await User.deleteOne({ _id: employeeId });

  await recordAudit({
    actor: actorId,
    role: actorRole,
    action: 'DELETE_EMPLOYEE',
    entity: 'EMPLOYEE',
    entityId: employeeId,
    details: { deletedSnapshot: snapshot },
    ip,
  });

  return { deleted: true, snapshot };
}
