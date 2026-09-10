import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { taskService } from '../../services/taskService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { StatusUpdateModal } from '../../components/tasks/StatusUpdateModal.jsx';
import { Toast } from '../../components/common/Toast.jsx';
import {
  ArrowLeft,
  Edit3,
  Calendar,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckSquare,
  Square,
  Plus,
  MessageSquare,
  Activity as ActivityIcon,
  Send,
  Trash2,
} from 'lucide-react';
import api from '../../services/api.js';

export function EmployeeTaskDetailsPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Subtasks state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Activity Timeline
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('subtasks');

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTaskById(id);
      setTask(data);

      const [commentsRes, activitiesRes] = await Promise.all([
        api.get(`/tasks/${id}/comments`),
        api.get(`/tasks/${id}/activities`),
      ]);
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
    } catch (err) {
      setError(err.message || 'Access denied or task not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleStatusUpdated = () => {
    setToastMessage('Task status updated! Management has been notified.');
    fetchTaskDetails();
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      setAddingSubtask(true);
      const res = await api.post(`/tasks/${task._id}/subtasks`, { title: newSubtaskTitle.trim() });
      setTask((prev) => ({ ...prev, subtasks: Array.isArray(res.data) ? res.data : [] }));
      setNewSubtaskTitle('');
      api.get(`/tasks/${id}/activities`).then((r) => setActivities(Array.isArray(r.data) ? r.data : []));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add subtask.');
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    try {
      const res = await api.patch(`/tasks/${task._id}/subtasks/${subtaskId}`, {
        isCompleted: !currentStatus,
      });
      setTask((prev) => ({ ...prev, subtasks: Array.isArray(res.data) ? res.data : [] }));
      api.get(`/tasks/${id}/activities`).then((r) => setActivities(Array.isArray(r.data) ? r.data : []));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update subtask.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      setPostingComment(true);
      const res = await api.post(`/tasks/${task._id}/comments`, { content: newComment.trim() });
      if (res.data) setComments((prev) => [...prev, res.data]);
      setNewComment('');
      api.get(`/tasks/${id}/activities`).then((r) => setActivities(Array.isArray(r.data) ? r.data : []));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/tasks/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving task record..." />;
  }

  if (error || !task) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3>Task Inaccessible</h3>
        <p style={{ marginTop: 8 }}>{error || 'This task does not belong to your account or does not exist.'}</p>
        <Link to="/employee/tasks" className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
          <ArrowLeft size={14} />
          <span>Return to My Tasks</span>
        </Link>
      </div>
    );
  }

  const completedSubtasksCount = (task.subtasks || []).filter((s) => s.isCompleted).length;
  const totalSubtasks = (task.subtasks || []).length;
  const subtaskProgressPct = totalSubtasks > 0 ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

  return (
    <div>
      <Toast
        type="success"
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <Link to="/employee/tasks" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to My Tasks</span>
        </Link>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setIsUpdateModalOpen(true)}
        >
          <Edit3 size={15} />
          <span>Update Progress Status</span>
        </button>
      </div>

      {/* Task Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Left Column: Scope, Description & Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
              {task.isOverdue && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#b91c1c',
                    backgroundColor: '#fee2e2',
                    borderRadius: '9999px',
                    padding: '2px 8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <AlertTriangle size={12} /> OVERDUE
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.45rem', marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
              {task.title}
            </h1>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                Detailed Scope & Deliverables
              </h4>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {task.description}
              </p>
            </div>
          </div>

          {/* Subtasks, Comments & Timeline Tabs */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-muted)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('subtasks')}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  border: 'none',
                  background: activeTab === 'subtasks' ? 'var(--bg-surface)' : 'transparent',
                  borderBottom: activeTab === 'subtasks' ? '2px solid var(--primary-600)' : 'none',
                  fontWeight: activeTab === 'subtasks' ? 600 : 500,
                  color: activeTab === 'subtasks' ? 'var(--primary-700)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.88rem',
                }}
              >
                <CheckSquare size={16} />
                <span>Subtasks ({completedSubtasksCount}/{totalSubtasks})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  border: 'none',
                  background: activeTab === 'comments' ? 'var(--bg-surface)' : 'transparent',
                  borderBottom: activeTab === 'comments' ? '2px solid var(--primary-600)' : 'none',
                  fontWeight: activeTab === 'comments' ? 600 : 500,
                  color: activeTab === 'comments' ? 'var(--primary-700)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.88rem',
                }}
              >
                <MessageSquare size={16} />
                <span>Discussion ({comments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  border: 'none',
                  background: activeTab === 'timeline' ? 'var(--bg-surface)' : 'transparent',
                  borderBottom: activeTab === 'timeline' ? '2px solid var(--primary-600)' : 'none',
                  fontWeight: activeTab === 'timeline' ? 600 : 500,
                  color: activeTab === 'timeline' ? 'var(--primary-700)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.88rem',
                }}
              >
                <ActivityIcon size={16} />
                <span>Timeline</span>
              </button>
            </div>

            {/* Subtasks Tab */}
            {activeTab === 'subtasks' && (
              <div style={{ padding: 'var(--space-5)' }}>
                {totalSubtasks > 0 && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>Checklist Completion</span>
                      <span style={{ color: 'var(--text-muted)' }}>{subtaskProgressPct}%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, backgroundColor: 'var(--bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${subtaskProgressPct}%`,
                          height: '100%',
                          backgroundColor: subtaskProgressPct === 100 ? 'var(--success-500)' : 'var(--primary-600)',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {(task.subtasks || []).map((subtask) => (
                    <div
                      key={subtask._id}
                      onClick={() => handleToggleSubtask(subtask._id, subtask.isCompleted)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: subtask.isCompleted ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      {subtask.isCompleted ? (
                        <CheckSquare size={18} color="var(--success-600)" />
                      ) : (
                        <Square size={18} color="var(--text-muted)" />
                      )}
                      <span
                        style={{
                          fontSize: '0.9rem',
                          textDecoration: subtask.isCompleted ? 'line-through' : 'none',
                          color: subtask.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                        }}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddSubtask} style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Add personal subtask / action item..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm" disabled={addingSubtask}>
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </form>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div style={{ padding: 'var(--space-5)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: 300, overflowY: 'auto' }}>
                  {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No comments yet. Update management or post notes below.
                    </div>
                  ) : (
                    comments.filter(Boolean).map((c) => (
                      <div
                        key={c._id}
                        style={{
                          padding: '10px 14px',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.author?.name || 'User'}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({c.author?.role})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(c.createdAt).toLocaleDateString()} at{' '}
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(c._id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                              title="Delete comment"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                          {c.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write a status update, question or blocker..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={postingComment}>
                    <Send size={14} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div style={{ padding: 'var(--space-5)' }}>
                {activities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No recorded activity yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {activities.map((a) => (
                      <div
                        key={a._id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 'var(--space-3)',
                          fontSize: '0.85rem',
                          borderLeft: '2px solid var(--primary-400)',
                          paddingLeft: 'var(--space-3)',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600 }}>{a.actor?.name || 'System'}</span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {a.action === 'TASK_CREATED' && 'created this task'}
                            {a.action === 'STATUS_CHANGED' && `changed status from ${a.previousValue} to ${a.newValue}`}
                            {a.action === 'REASSIGNED' && `reassigned staff from ${a.previousValue} to ${a.newValue}`}
                            {a.action === 'SUBTASK_ADDED' && `added subtask: "${a.newValue}"`}
                            {a.action === 'SUBTASK_TOGGLED' && a.newValue}
                            {a.action === 'COMMENT_ADDED' && 'commented on task'}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                            {new Date(a.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Deadlines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Timeline & Due Dates Card */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              Schedules & Deadlines
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={16} color={task.isOverdue ? '#b91c1c' : 'var(--text-muted)'} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Target Due Date</div>
                  <div style={{ fontWeight: 600, color: task.isOverdue ? '#b91c1c' : 'var(--text-primary)' }}>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'No deadline set'}
                  </div>
                </div>
              </div>

              {task.startDate && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <Calendar size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Start Date</div>
                    <div style={{ fontWeight: 500 }}>
                      {new Date(task.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              )}

              {task.completedAt && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckSquare size={16} color="var(--success-600)" style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Completed Date</div>
                    <div style={{ fontWeight: 500, color: 'var(--success-700)' }}>
                      {new Date(task.completedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Metadata */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              Assignment Information
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ShieldCheck size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Assigned By (Manager)</div>
                  <div style={{ fontWeight: 500 }}>{task.assignedBy?.name || 'Administrator'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{task.assignedBy?.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Calendar size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Assigned On</div>
                  <div style={{ fontWeight: 500 }}>
                    {new Date(task.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Calendar size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Last Status Update</div>
                  <div style={{ fontWeight: 500 }}>
                    {new Date(task.updatedAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        task={task}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}
