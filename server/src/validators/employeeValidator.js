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
});

export const employeeIdParamSchema = z.object({
  id: objectIdSchema,
});
