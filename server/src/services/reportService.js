import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

export async function getExecutiveReport() {
  const now = new Date();

  const [statusStats, priorityStats, overdueCount, totalTasks, activeEmployees] =
    await Promise.all([
      Task.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { isArchived: { $ne: true } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        isArchived: { $ne: true },
        dueDate: { $lt: now },
        status: { $ne: 'COMPLETED' },
      }),
      Task.countDocuments({ isArchived: { $ne: true } }),
      User.countDocuments({ role: 'EMPLOYEE', isActive: true }),
    ]);

  const statusMap = {
    NOT_STARTED: 0,
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  };
  statusStats.forEach((s) => {
    if (s._id) statusMap[s._id] = s.count;
  });

  const priorityMap = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };
  priorityStats.forEach((p) => {
    if (p._id) priorityMap[p._id] = p.count;
  });

  return {
    totalTasks,
    activeEmployees,
    overdueTasks: overdueCount,
    statusBreakdown: statusMap,
    priorityBreakdown: priorityMap,
  };
}

export async function getEmployeePerformanceReport() {
  const now = new Date();

  const employees = await User.find({ role: 'EMPLOYEE', isActive: true })
    .select('name email')
    .lean();

  const performance = await Promise.all(
    employees.map(async (emp) => {
      const [total, completed, inProgress, pending, notStarted, overdue] =
        await Promise.all([
          Task.countDocuments({ assignedEmployee: emp._id, isArchived: { $ne: true } }),
          Task.countDocuments({
            assignedEmployee: emp._id,
            status: 'COMPLETED',
            isArchived: { $ne: true },
          }),
          Task.countDocuments({
            assignedEmployee: emp._id,
            status: 'IN_PROGRESS',
            isArchived: { $ne: true },
          }),
          Task.countDocuments({
            assignedEmployee: emp._id,
            status: 'PENDING',
            isArchived: { $ne: true },
          }),
          Task.countDocuments({
            assignedEmployee: emp._id,
            status: 'NOT_STARTED',
            isArchived: { $ne: true },
          }),
          Task.countDocuments({
            assignedEmployee: emp._id,
            dueDate: { $lt: now },
            status: { $ne: 'COMPLETED' },
            isArchived: { $ne: true },
          }),
        ]);

      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        id: emp._id,
        name: emp.name,
        email: emp.email,
        totalAssigned: total,
        completed,
        inProgress,
        pending,
        notStarted,
        overdue,
        completionRate, // %
      };
    })
  );

  return performance;
}

export async function exportTasksCsv({ user }) {
  const query = { isArchived: { $ne: true } };
  if (user.role === 'EMPLOYEE') {
    query.assignedEmployee = user.id;
  }

  const tasks = await Task.find(query)
    .populate('assignedEmployee', 'name email')
    .populate('assignedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const headers = [
    'Task ID',
    'Title',
    'Description',
    'Assigned Employee',
    'Employee Email',
    'Priority',
    'Status',
    'Due Date',
    'Overdue',
    'Created Date',
    'Updated Date',
  ];

  const rows = tasks.map((t) => {
    const isOverdue =
      t.dueDate && t.status !== 'COMPLETED' && new Date() > new Date(t.dueDate);
    return [
      `"${t._id}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${t.assignedEmployee?.name || 'Unassigned'}"`,
      `"${t.assignedEmployee?.email || ''}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : 'N/A'}"`,
      `"${isOverdue ? 'YES' : 'NO'}"`,
      `"${new Date(t.createdAt).toISOString()}"`,
      `"${new Date(t.updatedAt).toISOString()}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
