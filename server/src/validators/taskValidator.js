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
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], {
    errorMap: () => ({ message: "Status must be one of: 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'" }),
  }),
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
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  employee: z.string().trim().optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'title', 'priority', 'status']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const taskIdParamSchema = z.object({
  id: objectIdSchema,
});
