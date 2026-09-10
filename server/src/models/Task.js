import mongoose from 'mongoose';

export const TASK_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
export const TASK_STATUSES = ['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters'],
      maxlength: [120, 'Task title cannot exceed 120 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: [2000, 'Task description cannot exceed 2000 characters'],
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned employee is required'],
      index: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigning user (Admin) is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: '{VALUE} is not a valid task priority',
      },
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: '{VALUE} is not a valid task status',
      },
      default: 'NOT_STARTED',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'tasks',
  }
);

// Search and compound performance indexes
taskSchema.index({ title: 'text', description: 'text' });
taskSchema.index({ assignedEmployee: 1, status: 1 });
taskSchema.index({ status: 1, priority: 1, createdAt: -1 });
taskSchema.index({ createdAt: -1 });

export const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
