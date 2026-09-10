import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { sendTaskAssignedEmail, sendTaskStatusUpdatedEmail } from './emailService.js';

/**
 * Create a new task (Admin only)
 */
export async function createTask({ title, description, assignedEmployee, priority, assignedBy }) {
  // Validate that the assigned employee exists and is an active employee
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

  const task = await Task.create({
    title,
    description,
    assignedEmployee: employee._id,
    assignedBy,
    priority: priority || 'MEDIUM',
    status: 'NOT_STARTED',
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignedEmployee', 'name email role isActive')
    .populate('assignedBy', 'name email')
    .lean();

  // Trigger email notification (non-blocking for database persistence)
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
 * List tasks with backend search, filtering, and pagination
 */
export async function getTasks({ user, search, status, priority, employee, sort = 'createdAt', order = 'desc', page = 1, limit = 10 }) {
  const query = {};

  // Strict resource access: Employees only see tasks assigned to them
  if (user.role === 'EMPLOYEE') {
    query.assignedEmployee = new mongoose.Types.ObjectId(user.id);
  } else if (employee) {
    // Admin filtering by specific employee
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

  // Backend search across title, description, and employee name/email
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');

    if (user.role === 'ADMIN') {
      // Find matching employees first
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
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }
  }

  // Sorting
  const sortDirection = order === 'asc' ? 1 : -1;
  const sortObj = { [sort]: sortDirection };

  // Calculate pagination
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

  return {
    tasks,
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

  // Strict ownership check: Employee cannot access tasks assigned to others
  if (user.role === 'EMPLOYEE' && task.assignedEmployee._id.toString() !== user.id) {
    throw ApiError.forbidden('Access denied. You do not have permission to view this task.');
  }

  return task;
}

/**
 * Update task status with ownership and role enforcement
 */
export async function updateTaskStatus({ taskId, status, user }) {
  const task = await Task.findById(taskId);

  if (!task) {
    throw ApiError.notFound('Task not found.');
  }

  // Strict ownership check: Employee can only update their own assigned task
  if (user.role === 'EMPLOYEE' && task.assignedEmployee.toString() !== user.id) {
    throw ApiError.forbidden('Access denied. You can only update tasks assigned to you.');
  }

  const previousStatus = task.status;
  task.status = status;
  await task.save();

  const populatedTask = await Task.findById(task._id)
    .populate('assignedEmployee', 'name email role isActive')
    .populate('assignedBy', 'name email')
    .lean();

  // Send status update notification to the Admin who assigned it
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
 * Delete a task (Admin only)
 */
export async function deleteTask(taskId) {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw ApiError.notFound('Task not found or already deleted.');
  }
  return { id: taskId };
}
