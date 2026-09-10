import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';
import { logActivity } from './activityService.js';
import { createNotification } from './notificationService.js';

export async function addComment({ taskId, authorId, content, userRole }) {
  const task = await Task.findById(taskId);
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  // Employee can only comment on tasks assigned to them
  if (userRole === 'EMPLOYEE' && task.assignedEmployee.toString() !== authorId.toString()) {
    throw ApiError.forbidden('Access denied. You can only comment on tasks assigned to you.');
  }

  const comment = await Comment.create({
    task: taskId,
    author: authorId,
    content,
  });

  await comment.populate('author', 'name email role');

  // Log activity
  await logActivity({
    task: taskId,
    actor: authorId,
    action: 'COMMENT_ADDED',
    newValue: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
  });

  // Notify the other party (if employee commented, notify admin; if admin commented, notify assigned employee)
  const notifyRecipient =
    userRole === 'EMPLOYEE' ? task.assignedBy : task.assignedEmployee;

  if (notifyRecipient && notifyRecipient.toString() !== authorId.toString()) {
    await createNotification({
      recipient: notifyRecipient,
      sender: authorId,
      type: 'COMMENT_ADDED',
      title: 'New Comment on Task',
      message: `A new comment was added to "${task.title}".`,
      relatedTask: task._id,
    });
  }

  return comment;
}

export async function getTaskComments(taskId, user) {
  const task = await Task.findById(taskId);
  if (!task) {
    throw ApiError.notFound('Task not found');
  }

  if (user.role === 'EMPLOYEE' && task.assignedEmployee.toString() !== user.id.toString()) {
    throw ApiError.forbidden('Access denied. You can only view comments on your assigned tasks.');
  }

  return Comment.find({ task: taskId })
    .populate('author', 'name email role')
    .sort({ createdAt: 1 })
    .lean();
}

export async function deleteComment(commentId, user) {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw ApiError.notFound('Comment not found');
  }

  // Only comment author or admin can delete
  if (user.role !== 'ADMIN' && comment.author.toString() !== user.id.toString()) {
    throw ApiError.forbidden('You can only delete your own comments');
  }

  await Comment.findByIdAndDelete(commentId);
  return { id: commentId, deleted: true };
}
