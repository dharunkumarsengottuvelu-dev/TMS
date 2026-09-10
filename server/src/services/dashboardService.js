import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

/**
 * Get Admin Dashboard Metrics
 * Real data aggregated directly from MongoDB collections.
 */
export async function getAdminMetrics() {
  const [totalEmployees, taskMetrics, recentTasks] = await Promise.all([
    User.countDocuments({ role: 'EMPLOYEE', isActive: true }),
    Task.aggregate([
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        },
      },
    ]),
    Task.find()
      .populate('assignedEmployee', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const metrics = taskMetrics[0] || {
    totalTasks: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
  };

  return {
    totalEmployees,
    totalTasks: metrics.totalTasks,
    notStarted: metrics.notStarted,
    inProgress: metrics.inProgress,
    completed: metrics.completed,
    recentTasks,
  };
}

/**
 * Get Employee Dashboard Metrics
 * Strictly scoped to the authenticated employee's tasks.
 */
export async function getEmployeeMetrics(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [taskMetrics, recentTasks] = await Promise.all([
    Task.aggregate([
      { $match: { assignedEmployee: userObjectId } },
      {
        $group: {
          _id: null,
          assignedTasks: { $sum: 1 },
          notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        },
      },
    ]),
    Task.find({ assignedEmployee: userObjectId })
      .populate('assignedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
  ]);

  const metrics = taskMetrics[0] || {
    assignedTasks: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
  };

  return {
    assignedTasks: metrics.assignedTasks,
    notStarted: metrics.notStarted,
    inProgress: metrics.inProgress,
    completed: metrics.completed,
    recentTasks,
  };
}
