import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendTaskAssignedEmail, sendTaskStatusUpdatedEmail } from './emailService.js';
import { logActivity } from './activityService.js';
import { recordAudit } from './auditService.js';
import { createNotification } from './notificationService.js';

/**
 * Create a new task (Admin only)
 */
export async function createTask({
  title,
  description,
  assignedEmployee,
  priority,
  status = 'NOT_STARTED',
  startDate = null,
  dueDate = null,
  subtasks = [],
  assignedBy,
  ip = '127.0.0.1',
}) {
  const employee = await User.findById(assignedEmployee);
  if (!employee) {
    throw ApiError.notFound(`Employee with ID '${assignedEmployee}' does not exist.`);
  }

  if (employee.role !== 'EMPLOYEE') {
    throw ApiError.badRequest('Tasks can only be assigned to users with the EMPLOYEE role.');
  }

  if (employee.isActive === false) {
    throw ApiError.badRequest('Cannot assign task to a deactivated employee.');
  }

  const formattedSubtasks = (subtasks || []).map((st) => ({
    title: st.title,
    isCompleted: false,
    completedAt: null,
  }));

  const task = await Task.create({
    title,
    description,
    assignedEmployee: employee._id,
    assignedBy,
    priority: priority || 'MEDIUM',
    status: status || 'NOT_STARTED',
    startDate: startDate ? new Date(startDate) : null,
    dueDate: dueDate ? new Date(dueDate) : null,
    completedAt: status === 'COMPLETED' ? new Date() : null,
    subtasks: formattedSubtasks,
    isArchived: false,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignedEmployee', 'name email role isActive')
    .populate('assignedBy', 'name email')
    .lean();

  // Log Activity Timeline
  await logActivity({
    task: task._id,
    actor: assignedBy,
    action: 'TASK_CREATED',
    newValue: { title: task.title, priority: task.priority, status: task.status },
  });

  // Record Immutable Audit Log
  await recordAudit({
    actor: assignedBy,
    role: 'ADMIN',
    action: 'CREATE_TASK',
    entity: 'TASK',
    entityId: task._id,
    details: { title: task.title, assignedTo: employee.email, priority: task.priority },
    ip,
  });

  // Create In-App Notification for Employee
  await createNotification({
    recipient: employee._id,
    sender: assignedBy,
    type: 'TASK_ASSIGNED',
    title: 'New Task Assigned',
    message: `You have been assigned: "${task.title}" with priority ${task.priority}.`,
    relatedTask: task._id,
  });

  // Trigger email notification (non-blocking)
  const assigner = await User.findById(assignedBy).lean();
  const emailResult = await sendTaskAssignedEmail({
    employeeName: employee.name,
    employeeEmail: employee.email,
    taskTitle: task.title,
    taskDescription: task.description,
    priority: task.priority,
    status: task.status,
    assignedByName: assigner?.name || 'Administrator',
    assignedDate: task.createdAt,
  });

  return {
    task: populatedTask,
    emailNotificationSent: emailResult.success,
  };
}

/**
 * List tasks with backend search, filtering, due date / overdue filters, and pagination
 */
export async function getTasks({
  user,
  search,
  status,
  priority,
  employee,
  filter,
  isArchived = false,
  sort = 'createdAt',
  order = 'desc',
  page = 1,
  limit = 10,
}) {
  const query = {};

  // Archive state handling
  if (filter === 'archived' || isArchived === true) {
    query.isArchived = true;
  } else {
    query.isArchived = { $ne: true };
  }

  // Strict resource access: Employees only see tasks assigned to them
  if (user.role === 'EMPLOYEE') {
    query.assignedEmployee = new mongoose.Types.ObjectId(user.id);
  } else if (employee) {
    if (mongoose.Types.ObjectId.isValid(employee)) {
      query.assignedEmployee = new mongoose.Types.ObjectId(employee);
    }
  }

  // Filter by status
  if (status) {
    query.status = status;
  }

  // Filter by priority
  if (priority) {
    query.priority = priority;
  }

  // Professional filters: overdue, dueToday, dueSoon, completed
  const now = new Date();
  if (filter === 'overdue') {
    query.dueDate = { $lt: now };
    query.status = { $ne: 'COMPLETED' };
  } else if (filter === 'dueToday') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    query.status = { $ne: 'COMPLETED' };
  } else if (filter === 'dueSoon') {
    const threeDaysOut = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    query.dueDate = { $gte: now, $lte: threeDaysOut };
    query.status = { $ne: 'COMPLETED' };
  } else if (filter === 'completed') {
    query.status = 'COMPLETED';
  }

  // Backend search across title, description, and employee
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');

    if (user.role === 'ADMIN') {
      const matchingEmployees = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const employeeIds = matchingEmployees.map((e) => e._id);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { assignedEmployee: { $in: employeeIds } },
      ];
    } else {
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
  }

  const sortDirection = order === 'asc' ? 1 : -1;
  const sortObj = { [sort]: sortDirection };

  const skip = (page - 1) * limit;
  const [total, tasks] = await Promise.all([
    Task.countDocuments(query),
    Task.find(query)
      .populate('assignedEmployee', 'name email role isActive')
      .populate('assignedBy', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  // Augment with isOverdue
  const augmentedTasks = tasks.map((t) => ({
    ...t,
    isOverdue: t.dueDate && t.status !== 'COMPLETED' && new Date() > new Date(t.dueDate),
  }));

  return {
    tasks: augmentedTasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Get single task by ID with authorization checks
 */
export async function getTaskById(taskId, user) {
  const task = await Task.findById(taskId)
    .populate('assignedEmployee', 'name email role isActive')
    .populate('assignedBy', 'name email')
    .lean();

  if (!task) {
    throw ApiError.notFound('Task not found.');
  }

  if (user.role === 'EMPLOYEE' && task.assignedEmployee._id.toString() !== user.id) {
    throw ApiError.forbidden('Access denied. You do not have permission to view this task.');
  }

  return {
    ...task,
    isOverdue: task.dueDate && task.status !== 'COMPLETED' && new Date() > new Date(task.dueDate),
  };
}

/**
 * Update task specifications (Admin only)
 */
export async function updateTask({ taskId, updates, actor, ip = '127.0.0.1' }) {
  const task = await Task.findById(taskId);
  if (!task) {
    throw ApiError.notFound('Task not found.');
  }

  const oldValues = {};
  const newValues = {};

  // If reassigning employee, verify new employee
  if (updates.assignedEmployee && updates.assignedEmployee.toString() !== task.assignedEmployee.toString()) {
    const newEmp = await User.findById(updates.assignedEmployee);
    if (!newEmp || newEmp.role !== 'EMPLOYEE') {
      throw ApiError.badRequest('Assigned employee is invalid.');
    }
    if (newEmp.isActive === false) {
      throw ApiError.badRequest('Cannot assign task to a deactivated employee.');
    }
    oldValues.assignedEmployee = task.assignedEmployee;
    task.assignedEmployee = newEmp._id;
    newValues.assignedEmployee = newEmp._id;

    try {
      await sendTaskAssignedEmail({
        employeeEmail: newEmp.email,
        employeeName: newEmp.name,
        taskTitle: updates.title || task.title,
        taskDescription: updates.description || task.description,
        priority: updates.priority || task.priority,
        dueDate: updates.dueDate !== undefined ? updates.dueDate : task.dueDate,
        assignedBy: actor.name || 'Admin',
      });
    } catch (_) {}
  }

  const fields = ['title', 'description', 'priority', 'status', 'dueDate', 'startDate'];
  fields.forEach((field) => {
    if (updates[field] !== undefined) {
      oldValues[field] = task[field];
      task[field] = updates[field];
      newValues[field] = updates[field];
    }
  });

  await task.save();

  // Activity log
  await logActivity({
    task: task._id,
    actor: actor.id,
    action: 'UPDATED',
    details: 'Task specifications updated by admin',
  });

  // Record Audit Log
  await recordAudit({
    actor: actor.id,
    role: actor.role || 'ADMIN',
    action: 'UPDATE_TASK',
    entity: 'TASK',
    entityId: task._id,
    details: { oldValues, newValues },
    ip,
  });

  return await Task.findById(task._id)
    .populate('assignedEmployee', 'name email role isActive')
    .populate('assignedBy', 'name email')
    .lean();
}

/**
 * Update task status with ownership and role enforcement
 */
export async function updateTaskStatus({ taskId, status, user, ip = '127.0.0.1' }) {
  const task = await Task.findById(taskId);

  if (!task) {
    throw ApiError.notFound('Task not found.');
  }

  if (user.role === 'EMPLOYEE' && task.assignedEmployee.toString() !== user.id) {
    throw ApiError.forbidden('Access denied. You can only update tasks assigned to you.');
  }

  const previousStatus = task.status;
  task.status = status;
  if (status === 'COMPLETED') {
    task.completedAt = new Date();
  } else {
    task.completedAt = null;
  }
  await task.save();

  // Log Activity Timeline
  await logActivity({
    task: task._id,
    actor: user.id,
    action: 'STATUS_CHANGED',
    previousValue: previousStatus,
    newValue: status,
  });

  // Record Audit Log
  await recordAudit({
    actor: user.id,
    role: user.role,
    action: 'UPDATE_TASK_STATUS',
    entity: 'TASK',
    entityId: task._id,
    details: { taskTitle: task.title, from: previousStatus, to: status },
    ip,
  });

  // Send in-app notification to Admin if Employee updated
  if (user.role === 'EMPLOYEE') {
    await createNotification({
      recipient: task.assignedBy,
      sender: user.id,
      type: 'STATUS_UPDATED',
      title: 'Task Status Updated',
      message: `${user.name} updated "${task.title}" to ${status}.`,
      relatedTask: task._id,
    });
  }

  const populatedTask = await Task.findById(task._id)
    .populate('assignedEmployee', 'name email role isActive')
    .populate('assignedBy', 'name email')
    .lean();

  // Send status update email notification to Admin
  let emailNotificationSent = false;
  if (user.role === 'EMPLOYEE') {
    const admin = await User.findById(task.assignedBy).lean();
    if (admin && admin.email) {
      const emailResult = await sendTaskStatusUpdatedEmail({
        adminEmail: admin.email,
        adminName: admin.name,
        employeeName: user.name,
        taskTitle: task.title,
        previousStatus,
        newStatus: status,
        updatedDate: task.updatedAt,
      });
      emailNotificationSent = emailResult.success;
    }
  }

  return {
    task: populatedTask,
    emailNotificationSent,
  };
}

/**
 * Reassign task to a different employee (Admin only)
 */
export async function reassignTask({ taskId, newEmployeeId, actor, ip = '127.0.0.1' }) {
  const task = await Task.findById(taskId).populate('assignedEmployee', 'name email');
  if (!task) {
    throw ApiError.notFound('Task not found.');
  }

  const newEmployee = await User.findById(newEmployeeId);
  if (!newEmployee || newEmployee.role !== 'EMPLOYEE') {
    throw ApiError.badRequest('Target employee is invalid or inactive.');
  }

  const previousEmployee = task.assignedEmployee;
  task.assignedEmployee = newEmployee._id;
  await task.save();

  // Log Activity Timeline
  await logActivity({
    task: task._id,
    actor: actor.id,
    action: 'REASSIGNED',
    previousValue: previousEmployee?.name || 'Previous Employee',
    newValue: newEmployee.name,
  });

  // Record Audit Log
  await recordAudit({
    actor: actor.id,
    role: 'ADMIN',
    action: 'REASSIGN_TASK',
    entity: 'TASK',
    entityId: task._id,
    details: { from: previousEmployee?.email, to: newEmployee.email },
    ip,
  });

  // Notify new employee (in-app + email)
  await createNotification({
    recipient: newEmployee._id,
    sender: actor.id,
    type: 'TASK_REASSIGNED',
    title: 'Task Reassigned to You',
    message: `You have been reassigned the task: "${task.title}".`,
    relatedTask: task._id,
  });

  await sendTaskAssignedEmail({
    employeeName: newEmployee.name,
    employeeEmail: newEmployee.email,
    taskTitle: task.title,
    taskDescription: task.description,
    priority: task.priority,
    status: task.status,
    assignedByName: actor.name,
    assignedDate: new Date(),
  });

  return Task.findById(task._id)
    .populate('assignedEmployee', 'name email role isActive')
    .populate('assignedBy', 'name email')
    .lean();
}

/**
 * Add a subtask
 */
export async function addSubtask({ taskId, title, user }) {
  const task = await Task.findById(taskId);
  if (!task) {
    throw ApiError.notFound('Task not found.');
  }

  if (user.role === 'EMPLOYEE' && task.assignedEmployee.toString() !== user.id) {
    throw ApiError.forbidden('Access denied.');
  }

  task.subtasks.push({
    title,
    isCompleted: false,
    completedAt: null,
  });
  await task.save();

  await logActivity({
    task: task._id,
    actor: user.id,
    action: 'SUBTASK_ADDED',
    newValue: title,
  });

  return task.subtasks;
}

/**
 * Toggle a subtask completion
 */
export async function toggleSubtask({ taskId, subtaskId, isCompleted, user }) {
  const task = await Task.findById(taskId);
  if (!task) {
    throw ApiError.notFound('Task not found.');
  }

  if (user.role === 'EMPLOYEE' && task.assignedEmployee.toString() !== user.id) {
    throw ApiError.forbidden('Access denied.');
  }

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) {
    throw ApiError.notFound('Subtask not found.');
  }

  subtask.isCompleted = isCompleted;
  subtask.completedAt = isCompleted ? new Date() : null;
  await task.save();

  await logActivity({
    task: task._id,
    actor: user.id,
    action: 'SUBTASK_TOGGLED',
    newValue: `${subtask.title}: ${isCompleted ? 'Completed' : 'Reopened'}`,
  });

  return task.subtasks;
}

/**
 * Bulk update task status (Admin only)
 */
export async function bulkUpdateStatus({ taskIds, status, actor, ip = '127.0.0.1' }) {
  const result = await Task.updateMany(
    { _id: { $in: taskIds } },
    {
      $set: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    }
  );

  await recordAudit({
    actor: actor.id,
    role: 'ADMIN',
    action: 'BULK_UPDATE_STATUS',
    entity: 'TASK',
    details: { count: result.modifiedCount, targetStatus: status, taskIds },
    ip,
  });

  return { modifiedCount: result.modifiedCount };
}

/**
 * Bulk archive tasks (Admin only)
 */
export async function bulkArchive({ taskIds, isArchived = true, actor, ip = '127.0.0.1' }) {
  const result = await Task.updateMany(
    { _id: { $in: taskIds } },
    { $set: { isArchived } }
  );

  await recordAudit({
    actor: actor.id,
    role: 'ADMIN',
    action: isArchived ? 'BULK_ARCHIVE' : 'BULK_RESTORE',
    entity: 'TASK',
    details: { count: result.modifiedCount, taskIds },
    ip,
  });

  return { modifiedCount: result.modifiedCount };
}

/**
 * Delete a task (Admin only)
 */
export async function deleteTask(taskId, actor, ip = '127.0.0.1') {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw ApiError.notFound('Task not found or already deleted.');
  }

  if (actor) {
    await recordAudit({
      actor: actor.id,
      role: 'ADMIN',
      action: 'DELETE_TASK',
      entity: 'TASK',
      entityId: taskId,
      details: { title: task.title },
      ip,
    });
  }

  return { id: taskId };
}
