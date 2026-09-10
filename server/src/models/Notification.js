import mongoose from 'mongoose';

export const NOTIFICATION_TYPES = [
  'TASK_ASSIGNED',
  'TASK_REASSIGNED',
  'STATUS_UPDATED',
  'COMMENT_ADDED',
  'DUE_SOON',
  'TASK_OVERDUE',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'notifications',
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
