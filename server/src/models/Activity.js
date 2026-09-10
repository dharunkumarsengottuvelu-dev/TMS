import mongoose from 'mongoose';

export const ACTIVITY_ACTIONS = [
  'TASK_CREATED',
  'STATUS_CHANGED',
  'PRIORITY_CHANGED',
  'REASSIGNED',
  'DUE_DATE_CHANGED',
  'COMMENT_ADDED',
  'SUBTASK_ADDED',
  'SUBTASK_TOGGLED',
  'TASK_ARCHIVED',
  'TASK_RESTORED',
];

const activitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ACTIVITY_ACTIONS,
      required: true,
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'activities',
  }
);

activitySchema.index({ task: 1, createdAt: -1 });

export const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
