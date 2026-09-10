import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskIdParamSchema,
  reassignTaskSchema,
  addCommentSchema,
  addSubtaskSchema,
  toggleSubtaskSchema,
  bulkStatusSchema,
  bulkArchiveSchema,
} from '../validators/taskValidator.js';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Export CSV
router.get('/export/csv', taskController.exportTasksCsv);

// Bulk operations (Admin only)
router.post(
  '/bulk-status',
  requireRole('ADMIN'),
  validateRequest({ body: bulkStatusSchema }),
  taskController.bulkUpdateStatus
);

router.post(
  '/bulk-archive',
  requireRole('ADMIN'),
  validateRequest({ body: bulkArchiveSchema }),
  taskController.bulkArchive
);

// List tasks
router.get(
  '/',
  validateRequest({ query: taskQuerySchema }),
  taskController.getTasks
);

// Create task (Admin only)
router.post(
  '/',
  requireRole('ADMIN'),
  validateRequest({ body: createTaskSchema }),
  taskController.createTask
);

// Get single task
router.get(
  '/:id',
  validateRequest({ params: taskIdParamSchema }),
  taskController.getTaskById
);

// Edit task specifications (Admin only)
router.patch(
  '/:id',
  requireRole('ADMIN'),
  validateRequest({ params: taskIdParamSchema, body: updateTaskSchema }),
  taskController.updateTask
);

// Update status
router.patch(
  '/:id/status',
  validateRequest({ params: taskIdParamSchema, body: updateTaskStatusSchema }),
  taskController.updateTaskStatus
);

// Reassign task (Admin only)
router.patch(
  '/:id/reassign',
  requireRole('ADMIN'),
  validateRequest({ params: taskIdParamSchema, body: reassignTaskSchema }),
  taskController.reassignTask
);

// Subtasks
router.post(
  '/:id/subtasks',
  validateRequest({ params: taskIdParamSchema, body: addSubtaskSchema }),
  taskController.addSubtask
);

router.patch(
  '/:id/subtasks/:subtaskId',
  validateRequest({ body: toggleSubtaskSchema }),
  taskController.toggleSubtask
);

// Activity Timeline
router.get(
  '/:id/activities',
  validateRequest({ params: taskIdParamSchema }),
  taskController.getTaskActivities
);

// Comments
router.get(
  '/:id/comments',
  validateRequest({ params: taskIdParamSchema }),
  taskController.getTaskComments
);

router.post(
  '/:id/comments',
  validateRequest({ params: taskIdParamSchema, body: addCommentSchema }),
  taskController.addComment
);

router.delete('/comments/:commentId', taskController.deleteComment);

// Delete task (Admin only)
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validateRequest({ params: taskIdParamSchema }),
  taskController.deleteTask
);

export default router;
