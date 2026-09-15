import { z } from 'zod';
import { objectIdSchema } from './taskValidator.js';

export const employeeQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'all']).optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE', 'all']).optional(),
  department: z.string().trim().optional(),
});

export const employeeIdParamSchema = z.object({
  id: objectIdSchema,
});

export const createEmployeeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Please provide a valid email address').toLowerCase(),
  role: z.enum(['ADMIN', 'EMPLOYEE'], { message: 'Role must be ADMIN or EMPLOYEE' }).optional().default('EMPLOYEE'),
  department: z.string().trim().max(100).optional().nullable(),
  designation: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  joiningDate: z.string().optional().nullable(),
  employeeId: z.string().trim().optional().nullable(),
  password: z.string().trim().min(6, 'Password must be at least 6 characters').optional().nullable(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().max(100).optional().nullable(),
  designation: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
  joiningDate: z.string().optional().nullable(),
});

export const employeeStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive boolean is required' }),
});

export const testEmailSchema = z.object({
  recipient: z.string().trim().email('Please provide a valid recipient email address').optional(),
});
