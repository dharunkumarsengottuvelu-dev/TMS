import * as taskService from '../services/taskService.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * POST /api/tasks - Create task (Admin only)
 */
export async function createTask(req, res, next) {
  try {
    const result = await taskService.createTask({
      ...req.body,
      assignedBy: req.user.id,
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
 * PATCH /api/tasks/:id/status - Update task status
 */
export async function updateTaskStatus(req, res, next) {
  try {
    const result = await taskService.updateTaskStatus({
      taskId: req.params.id,
      status: req.body.status,
      user: req.user,
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
 * DELETE /api/tasks/:id - Delete task (Admin only)
 */
export async function deleteTask(req, res, next) {
  try {
    const result = await taskService.deleteTask(req.params.id);
    return sendSuccess(res, result, 'Task deleted successfully', 200);
  } catch (error) {
    next(error);
  }
}
