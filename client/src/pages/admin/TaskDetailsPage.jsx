import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../../services/taskService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { employeeService } from '../../services/employeeService.js';
import { EditTaskModal } from '../../components/tasks/EditTaskModal.jsx';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  User,
  ShieldCheck,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckSquare,
  Square,
  Plus,
  MessageSquare,
  Activity as ActivityIcon,
  Send,
  Edit2,
} from 'lucide-react';
import api from '../../services/api.js';

export function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Reassignment Modal state
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedNewEmp, setSelectedNewEmp] = useState('');
  const [reassigning, setReassigning] = useState(false);

  // Subtasks state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Activity Timeline state
  const [activities, setActivities] = useState([]);

  // Active Tab: 'subtasks' | 'comments' | 'timeline'
  const [activeTab, setActiveTab] = useState('subtasks');

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTaskById(id);
      setTask(data);

      // Load comments & activities concurrently
      const [commentsRes, activitiesRes] = await Promise.all([
        api.get(`/tasks/${id}/comments`),
        api.get(`/tasks/${id}/activities`),
      ]);
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load task details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete "${task.title}"?`)) {
      return;
    }

    try {
      setDeleting(true);
      await taskService.deleteTask(task._id);
      navigate('/admin/tasks', { replace: true });
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
      setDeleting(false);
    }
  };

  const openReassignModal = async () => {
    try {
      const res = await employeeService.getEmployees({ limit: 100 });
      setEmployees(res.data || []);
      if (res.data?.length > 0) {
        const others = res.data.filter((e) => e._id !== task.assignedEmployee?._id);
        if (others.length > 0) setSelectedNewEmp(others[0]._id);
      }
      setIsReassignOpen(true);
    } catch {
      alert('Could not load employees for reassignment.');
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedNewEmp) return;
    try {
      setReassigning(true);
      await api.patch(`/tasks/${task._id}/reassign`, { newEmployeeId: selectedNewEmp });
      setIsReassignOpen(false);
      fetchTaskDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reassign task.');
    } finally {
      setReassigning(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    try {
      setAddingSubtask(true);
      const res = await api.post(`/tasks/${task._id}/subtasks`, { title: newSubtaskTitle.trim() });
      setTask((prev) => ({ ...prev, subtasks: Array.isArray(res.data) ? res.data : [] }));
      setNewSubtaskTitle('');
      // Refresh activities
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
        <h3>Error Retrieving Task</h3>
        <p style={{ marginTop: 8 }}>{error || 'Task not found.'}</p>
        <Link to="/admin/tasks" className="btn btn-secondary btn-sm" style={{ marginTop: 16 }}>
          <ArrowLeft size={14} />
          <span>Back to Task List</span>
        </Link>
      </div>
    );
  }

  const completedSubtasksCount = (task.subtasks || []).filter((s) => s.isCompleted).length;
  const totalSubtasks = (task.subtasks || []).length;
  const subtaskProgressPct = totalSubtasks > 0 ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

  return (
    <div>
      {/* Navigation & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <Link to="/admin/tasks" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          <span>Back to All Tasks</span>
        </Link>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowEditModal(true)}
            title="Edit task title, description, priority, or deadline"
          >
            <Edit2 size={14} />
            <span>Edit Task</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={openReassignModal}
            title="Reassign to another staff member"
          >
            <UserCheck size={14} />
            <span>Reassign Staff</span>
          </button>

          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={14} />
            <span>{deleting ? 'Deleting...' : 'Delete Task'}</span>
          </button>
        </div>
      </div>

      {/* Main Task Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Left Column: Scope, Description & Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Main Card */}
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
                Task Description & Deliverables
              </h4>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {task.description}
              </p>
            </div>
          </div>

          {/* Interactive Sections: Subtasks / Comments / Timeline Tabs */}
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
                <span>Activity Timeline</span>
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
                    placeholder="Add a new subtask milestone..."
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
                      No comments posted yet. Start the discussion below.
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
                    placeholder="Write a task comment or update..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={postingComment}>
                    <Send size={14} />
                    <span>Post</span>
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

        {/* Right Column: Personnel & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Assigned Employee Card */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Assigned Employee
              </h4>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                onClick={openReassignModal}
              >
                Reassign
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#e0e7ff',
                  color: 'var(--primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {task.assignedEmployee?.name || 'Unassigned'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {task.assignedEmployee?.email}
                </div>
              </div>
            </div>

            {task.assignedEmployee?._id && (
              <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/admin/employees/${task.assignedEmployee._id}`}
                  style={{ fontSize: '0.85rem', fontWeight: 500 }}
                >
                  View Employee Workload Profile &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Timeline & Due Dates Card */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              Schedules & Deadlines
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={16} color={task.isOverdue ? '#b91c1c' : 'var(--text-muted)'} style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Due Date</div>
                  <div style={{ fontWeight: 600, color: task.isOverdue ? '#b91c1c' : 'var(--text-primary)' }}>
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'No deadline assigned'}
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
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Completion Date</div>
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

          {/* Assignment Metadata Card */}
          <div className="card" style={{ padding: 'var(--space-5)' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
              Audit & Governance
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ShieldCheck size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Assigned By</div>
                  <div style={{ fontWeight: 500 }}>{task.assignedBy?.name || 'Administrator'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{task.assignedBy?.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Calendar size={16} color="var(--text-muted)" style={{ marginTop: 2 }} />
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Creation Timestamp</div>
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
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Last Modified</div>
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

      {/* Reassign Employee Modal */}
      <Modal
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        title="Reassign Task Personnel"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setIsReassignOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleReassignSubmit}
              disabled={reassigning || !selectedNewEmp}
            >
              {reassigning ? 'Reassigning...' : 'Confirm Reassignment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleReassignSubmit}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Select a new staff member to assume operational ownership of <strong>"{task.title}"</strong>. An email notification will be dispatched to the new assignee.
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="new-assignee">
              New Assigned Employee
            </label>
            <select
              id="new-assignee"
              className="form-select"
              value={selectedNewEmp}
              onChange={(e) => setSelectedNewEmp(e.target.value)}
              required
            >
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      {showEditModal && (
        <EditTaskModal
          task={task}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onTaskUpdated={fetchTaskDetails}
        />
      )}
    </div>
  );
}
