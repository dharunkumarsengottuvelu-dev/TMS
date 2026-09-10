import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  createTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskIdParamSchema,
} from '../validators/taskValidator.js';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get(
  '/',
  validateRequest({ query: taskQuerySchema }),
  taskController.getTasks
);

router.post(
  '/',
  requireRole('ADMIN'),
  validateRequest({ body: createTaskSchema }),
  taskController.createTask
);

router.get(
  '/:id',
  validateRequest({ params: taskIdParamSchema }),
  taskController.getTaskById
);

router.patch(
  '/:id/status',
  validateRequest({ params: taskIdParamSchema, body: updateTaskStatusSchema }),
  taskController.updateTaskStatus
);

router.delete(
  '/:id',
  requireRole('ADMIN'),
  validateRequest({ params: taskIdParamSchema }),
  taskController.deleteTask
);

export default router;
