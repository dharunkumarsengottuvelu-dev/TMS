import * as taskService from '../services/taskService.js';
import * as activityService from '../services/activityService.js';
import * as commentService from '../services/commentService.js';
import * as reportService from '../services/reportService.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * POST /api/tasks - Create task (Admin only)
 */
export async function createTask(req, res, next) {
  try {
    const result = await taskService.createTask({
      ...req.body,
      assignedBy: req.user.id,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });

    const message = result.emailNotificationSent
      ? 'Task created and assignment email sent successfully'
      : 'Task created successfully (email notification could not be delivered)';

    return sendSuccess(res, result.task, message, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks - List tasks with search, filter, pagination
 */
export async function getTasks(req, res, next) {
  try {
    const result = await taskService.getTasks({
      user: req.user,
      ...req.query,
    });

    return sendSuccess(res, result.tasks, 'Tasks retrieved successfully', 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/:id - Get single task
 */
export async function getTaskById(req, res, next) {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user);
    return sendSuccess(res, task, 'Task details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tasks/:id - Update task specifications (Admin only)
 */
export async function updateTask(req, res, next) {
  try {
    const task = await taskService.updateTask({
      taskId: req.params.id,
      updates: req.body,
      actor: req.user,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });
    return sendSuccess(res, task, 'Task specifications updated successfully', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tasks/:id/status - Update task status
 */
export async function updateTaskStatus(req, res, next) {
  try {
    const result = await taskService.updateTaskStatus({
      taskId: req.params.id,
      status: req.body.status,
      user: req.user,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });

    const message = result.emailNotificationSent
      ? 'Task status updated and notification sent to administrator'
      : 'Task status updated successfully';

    return sendSuccess(res, result.task, message, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tasks/:id/reassign - Reassign task (Admin only)
 */
export async function reassignTask(req, res, next) {
  try {
    const task = await taskService.reassignTask({
      taskId: req.params.id,
      newEmployeeId: req.body.newEmployeeId,
      actor: req.user,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });

    return sendSuccess(res, task, 'Task successfully reassigned to new employee', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks/:id/subtasks - Add subtask
 */
export async function addSubtask(req, res, next) {
  try {
    const subtasks = await taskService.addSubtask({
      taskId: req.params.id,
      title: req.body.title,
      user: req.user,
    });
    return sendSuccess(res, subtasks, 'Subtask added successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/tasks/:id/subtasks/:subtaskId - Toggle subtask completion
 */
export async function toggleSubtask(req, res, next) {
  try {
    const subtasks = await taskService.toggleSubtask({
      taskId: req.params.id,
      subtaskId: req.params.subtaskId,
      isCompleted: req.body.isCompleted,
      user: req.user,
    });
    return sendSuccess(res, subtasks, 'Subtask status updated', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/:id/activities - Get task activity timeline
 */
export async function getTaskActivities(req, res, next) {
  try {
    // Check permission to view task
    await taskService.getTaskById(req.params.id, req.user);
    const activities = await activityService.getTaskActivities(req.params.id);
    return sendSuccess(res, activities, 'Task activities retrieved', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/:id/comments - Get comments
 */
export async function getTaskComments(req, res, next) {
  try {
    const comments = await commentService.getTaskComments(req.params.id, req.user);
    return sendSuccess(res, comments, 'Comments retrieved', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks/:id/comments - Add comment
 */
export async function addComment(req, res, next) {
  try {
    const comment = await commentService.addComment({
      taskId: req.params.id,
      authorId: req.user.id,
      content: req.body.content,
      userRole: req.user.role,
    });
    return sendSuccess(res, comment, 'Comment added successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tasks/comments/:commentId - Delete comment
 */
export async function deleteComment(req, res, next) {
  try {
    const result = await commentService.deleteComment(req.params.commentId, req.user);
    return sendSuccess(res, result, 'Comment deleted successfully', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks/bulk-status - Bulk status update (Admin only)
 */
export async function bulkUpdateStatus(req, res, next) {
  try {
    const result = await taskService.bulkUpdateStatus({
      taskIds: req.body.taskIds,
      status: req.body.status,
      actor: req.user,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });
    return sendSuccess(res, result, 'Bulk status update completed', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/tasks/bulk-archive - Bulk archive/restore (Admin only)
 */
export async function bulkArchive(req, res, next) {
  try {
    const result = await taskService.bulkArchive({
      taskIds: req.body.taskIds,
      isArchived: req.body.isArchived,
      actor: req.user,
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
    });
    return sendSuccess(res, result, 'Bulk archive updated', 200);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/tasks/export/csv - Export tasks as CSV
 */
export async function exportTasksCsv(req, res, next) {
  try {
    const csvContent = await reportService.exportTasksCsv({ user: req.user });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks-export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/tasks/:id - Delete task (Admin only)
 */
export async function deleteTask(req, res, next) {
  try {
    const result = await taskService.deleteTask(
      req.params.id,
      req.user,
      req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
    );
    return sendSuccess(res, result, 'Task deleted successfully', 200);
  } catch (error) {
    next(error);
  }
}
