import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';

/**
 * List employees with search, pagination, and workload metrics
 */
export async function getEmployees({ search, page = 1, limit = 10 }) {
  const query = { role: 'EMPLOYEE' };

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const skip = (page - 1) * limit;
  const [total, employees] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  // Aggregate current task counts for each employee
  const employeeIds = employees.map((e) => e._id);
  const taskCounts = await Task.aggregate([
    { $match: { assignedEmployee: { $in: employeeIds } } },
    {
      $group: {
        _id: '$assignedEmployee',
        totalTasks: { $sum: 1 },
        notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
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

/**
 * Get single employee details with all their assigned tasks and statistics
 */
export async function getEmployeeById(employeeId) {
  const employee = await User.findOne({ _id: employeeId, role: 'EMPLOYEE' })
    .select('name email role isActive createdAt')
    .lean();

  if (!employee) {
    throw ApiError.notFound('Employee not found.');
  }

  const [taskStats, recentTasks] = await Promise.all([
    Task.aggregate([
      { $match: { assignedEmployee: employee._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          notStarted: { $sum: { $cond: [{ $eq: ['$status', 'NOT_STARTED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
        },
      },
    ]),
    Task.find({ assignedEmployee: employee._id })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  const stats = taskStats[0] || { total: 0, notStarted: 0, pending: 0, inProgress: 0, completed: 0 };

  return {
    employee,
    stats: {
      total: stats.total,
      notStarted: stats.notStarted,
      pending: stats.pending,
      inProgress: stats.inProgress,
      completed: stats.completed,
    },
    recentTasks,
  };
}
