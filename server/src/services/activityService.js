import { Activity } from '../models/Activity.js';

export async function logActivity({ task, actor, action, previousValue = null, newValue = null, notes = '' }) {
  try {
    return await Activity.create({
      task,
      actor,
      action,
      previousValue,
      newValue,
      notes,
    });
  } catch (error) {
    console.error('⚠️ [ActivityService] Failed to record activity log:', error.message);
    return null;
  }
}

export async function getTaskActivities(taskId) {
  return Activity.find({ task: taskId })
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 })
    .lean();
}
