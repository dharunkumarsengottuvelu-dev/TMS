import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';

/**
 * Get Admin Dashboard Metrics
 * Real data aggregated directly from MongoDB collections.
 */
export async function getAdminMetrics() {
  const now = new Date();

  const [employeeMetrics, taskMetrics, recentTasks, overdueTasks, recentActivities] =
    await Promise.all([
      User.aggregate([
        { $match: { role: 'EMPLOYEE' } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          },
        },
      ]),
      Task.aggregate([
        { $match: { isArchived: { $ne: true } } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          },
        },
      ]),
      Task.find({ isArchived: { $ne: true } })
        .populate('assignedEmployee', 'name email employeeId')
        .populate('assignedBy', 'name email')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      Task.countDocuments({
        isArchived: { $ne: true },
        dueDate: { $lt: now },
        status: { $ne: 'COMPLETED' },
      }),
      Activity.find()
        .populate('actor', 'name email role')
        .populate('task', 'title priority')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

  // Count employees with at least one overdue task
  const employeesWithOverdue = await Task.distinct('assignedEmployee', {
    isArchived: { $ne: true },
    dueDate: { $lt: now },
    status: { $ne: 'COMPLETED' },
  });

  const empStats = employeeMetrics[0] || { total: 0, active: 0, inactive: 0 };
  const metrics = taskMetrics[0] || {
    totalTasks: 0, notStarted: 0, pending: 0, inProgress: 0, completed: 0,
  };

  return {
    totalEmployees: empStats.total,
    activeEmployees: empStats.active,
    inactiveEmployees: empStats.inactive,
    employeesWithOverdue: employeesWithOverdue.length,
    totalTasks: metrics.totalTasks,
    notStarted: metrics.notStarted,
    pending: metrics.pending,
    inProgress: metrics.inProgress,
    completed: metrics.completed,
    overdueTasks,
    recentTasks: recentTasks.map((t) => ({
      ...t,
      isOverdue: t.dueDate && t.status !== 'COMPLETED' && new Date() > new Date(t.dueDate),
    })),
    recentActivities,
  };
}

/**
 * Get Employee Dashboard Metrics
 * Strictly scoped to the authenticated employee's tasks.
 */
export async function getEmployeeMetrics(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  const [taskMetrics, recentTasks, overdueTasks] = await Promise.all([
    Task.aggregate([
      { $match: { assignedEmployee: userObjectId, isArchived: { $ne: true } } },
      {
        $group: {
          _id: null,
          assignedTasks: { $sum: 1 },
          notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        },
      },
    ]),
    Task.find({ assignedEmployee: userObjectId, isArchived: { $ne: true } })
      .populate('assignedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
    Task.countDocuments({
      assignedEmployee: userObjectId,
      isArchived: { $ne: true },
      dueDate: { $lt: now },
      status: { $ne: 'COMPLETED' },
    }),
  ]);

  const metrics = taskMetrics[0] || {
    assignedTasks: 0,
    notStarted: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  return {
    assignedTasks: metrics.assignedTasks,
    notStarted: metrics.notStarted,
    pending: metrics.pending,
    inProgress: metrics.inProgress,
    completed: metrics.completed,
    overdueTasks,
    recentTasks: recentTasks.map((t) => ({
      ...t,
      isOverdue: t.dueDate && t.status !== 'COMPLETED' && new Date() > new Date(t.dueDate),
    })),
  };
}
