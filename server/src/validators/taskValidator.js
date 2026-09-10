import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z
  .string()
  .trim()
  .refine((val) => objectIdRegex.test(val) && mongoose.Types.ObjectId.isValid(val), {
    message: 'Must be a valid 24-character hexadecimal MongoDB ObjectId',
  });

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string({ required_error: 'Task description is required' })
    .trim()
    .min(1, 'Description cannot be empty')
    .max(2000, 'Description cannot exceed 2000 characters'),
  assignedEmployee: objectIdSchema,
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => ({ message: "Priority must be one of: 'HIGH', 'MEDIUM', 'LOW'" }),
  }),
  status: z
    .enum(['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'], {
      errorMap: () => ({
        message: "Status must be one of: 'NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'",
      }),
    })
    .default('NOT_STARTED')
    .optional(),
  startDate: z.string().datetime().or(z.string().date()).nullable().optional(),
  dueDate: z.string().datetime().or(z.string().date()).nullable().optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().trim().min(1, 'Subtask title cannot be empty').max(200),
      })
    )
    .optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'], {
    errorMap: () => ({
      message: "Status must be one of: 'NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'",
    }),
  }),
});

export const reassignTaskSchema = z.object({
  newEmployeeId: objectIdSchema,
});

export const addCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment cannot exceed 2000 characters'),
});

export const addSubtaskSchema = z.object({
  title: z
    .string({ required_error: 'Subtask title is required' })
    .trim()
    .min(1, 'Subtask title cannot be empty')
    .max(200, 'Subtask title cannot exceed 200 characters'),
});

export const toggleSubtaskSchema = z.object({
  isCompleted: z.boolean(),
});

export const bulkStatusSchema = z.object({
  taskIds: z
    .array(objectIdSchema)
    .min(1, 'At least one task must be selected')
    .max(100, 'Cannot perform bulk action on more than 100 tasks at once'),
  status: z.enum(['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'], {
    errorMap: () => ({
      message: "Status must be one of: 'NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'",
    }),
  }),
});

export const bulkArchiveSchema = z.object({
  taskIds: z
    .array(objectIdSchema)
    .min(1, 'At least one task must be selected')
    .max(100, 'Cannot perform bulk action on more than 100 tasks at once'),
  isArchived: z.boolean().default(true),
});

export const taskQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  status: z.enum(['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  employee: z.string().trim().optional(),
  filter: z.enum(['all', 'overdue', 'dueToday', 'dueSoon', 'completed', 'archived']).optional(),
  isArchived: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  sort: z
    .enum(['createdAt', 'updatedAt', 'title', 'priority', 'status', 'dueDate'])
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const taskIdParamSchema = z.object({
  id: objectIdSchema,
});
