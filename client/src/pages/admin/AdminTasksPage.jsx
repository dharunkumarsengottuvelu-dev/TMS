import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { taskService } from '../../services/taskService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { CreateTaskModal } from '../../components/tasks/CreateTaskModal.jsx';
import { Toast } from '../../components/common/Toast.jsx';
import { Search, Plus, Trash2, Eye, RotateCcw, Download, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import api from '../../services/api.js';

export function AdminTasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Query state (synced with URL params for drill-down!)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [timelineFilter, setTimelineFilter] = useState(searchParams.get('filter') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Bulk Selection & Modals
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 8,
        sort: sortBy,
        order,
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (timelineFilter) params.filter = timelineFilter;

      const res = await taskService.getTasks(params);
      setTasks(res.data || []);
      setPagination(res.pagination || null);
      setSelectedTaskIds([]); // Reset selection on page or filter change
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, priorityFilter, timelineFilter, sortBy, order]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTasks();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setTimelineFilter('');
    setSortBy('createdAt');
    setOrder('desc');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete the task "${taskTitle}"?`)) {
      return;
    }

    try {
      setDeletingId(taskId);
      await taskService.deleteTask(taskId);
      setToastMessage(`Task "${taskTitle}" deleted successfully.`);
      fetchTasks();
    } catch (err) {
      alert(`Could not delete task: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await api.get('/tasks/export/csv', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `enterprise-tasks-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToastMessage('CSV Export generated and downloaded successfully.');
    } catch {
      alert('Failed to generate CSV export.');
    }
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map((t) => t._id));
    }
  };

  const handleToggleSelect = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkStatusUpdate = async (status) => {
    if (!status || selectedTaskIds.length === 0) return;
    try {
      setBulkActionLoading(true);
      await api.post('/tasks/bulk-status', {
        taskIds: selectedTaskIds,
        status,
      });
      setToastMessage(`Updated ${selectedTaskIds.length} tasks to ${status}.`);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Bulk status update failed.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div>
      <Toast
        type="success"
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      {/* Header action bar */}
      <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Enterprise Task Management</h1>
          <p className="page-subtitle">
            Centralized operational management, staff assignment, workload monitoring, and audit tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCsv}
            title="Download CSV export"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            <span>Assign New Task</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 36 }}
              placeholder="Search by title, description, employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ width: 140 }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div style={{ width: 130 }}>
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Timeline / Overdue Filter */}
          <div style={{ width: 140 }}>
            <select
              className="form-select"
              value={timelineFilter}
              onChange={(e) => {
                setTimelineFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Deadlines</option>
              <option value="overdue">⚠️ Overdue</option>
              <option value="dueToday">📅 Due Today</option>
              <option value="dueSoon">⏳ Due Soon (3d)</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            <span>Apply</span>
          </button>

          {(searchTerm || statusFilter || priorityFilter || timelineFilter) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* Bulk Action Toolbar (appears when 1+ rows selected) */}
      {selectedTaskIds.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3) var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary-800)' }}>
            {selectedTaskIds.length} {selectedTaskIds.length === 1 ? 'task' : 'tasks'} selected
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Bulk Status:</span>
            <select
              className="form-select"
              style={{ padding: '4px 8px', fontSize: '0.82rem', width: 130 }}
              defaultValue=""
              disabled={bulkActionLoading}
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkStatusUpdate(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="" disabled>
                Select status...
              </option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Table Content */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Querying enterprise tasks..." />
        ) : error ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={fetchTasks}>
              Retry
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks match query parameters"
            description="Adjust your search criteria or create a new enterprise task."
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={14} />
                <span>Create New Task</span>
              </button>
            }
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        title="Select All"
                      >
                        {selectedTaskIds.length === tasks.length ? (
                          <CheckSquare size={16} color="var(--primary-600)" />
                        ) : (
                          <Square size={16} color="var(--text-muted)" />
                        )}
                      </button>
                    </th>
                    <th style={{ minWidth: '220px' }}>Task Specification</th>
                    <th>Assigned Staff</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const isSelected = selectedTaskIds.includes(task._id);
                    return (
                      <tr
                        key={task._id}
                        style={{
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.04)' : undefined,
                        }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(task._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            {isSelected ? (
                              <CheckSquare size={16} color="var(--primary-600)" />
                            ) : (
                              <Square size={16} color="var(--text-muted)" />
                            )}
                          </button>
                        </td>

                        <td>
                          <Link to={`/admin/tasks/${task._id}`} className="table-row-title">
                            {task.title}
                          </Link>
                          <span className="table-row-subtext">
                            {task.description.length > 70 ? `${task.description.slice(0, 70)}...` : task.description}
                          </span>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {task.assignedEmployee?.name || 'Unassigned'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {task.assignedEmployee?.email}
                          </div>
                        </td>

                        <td>
                          <PriorityBadge priority={task.priority} />
                        </td>

                        <td>
                          <StatusBadge status={task.status} />
                        </td>

                        <td>
                          {task.dueDate ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                                {new Date(task.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              {task.isOverdue && (
                                <span
                                  style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    color: '#b91c1c',
                                    backgroundColor: '#fee2e2',
                                    borderRadius: '9999px',
                                    padding: '1px 6px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    width: 'fit-content',
                                  }}
                                >
                                  <AlertTriangle size={10} /> OVERDUE
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No deadline</span>
                          )}
                        </td>

                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {new Date(task.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <Link
                              to={`/admin/tasks/${task._id}`}
                              className="btn btn-secondary btn-sm"
                              title="View Full Specifications"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </Link>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--color-danger)' }}
                              onClick={() => handleDeleteTask(task._id, task.title)}
                              disabled={deletingId === task._id}
                              title="Delete Task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(page) => setCurrentPage(page)} />
          </>
        )}
      </div>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTaskCreated={() => {
          setToastMessage('Task successfully created and notification dispatched!');
          fetchTasks();
        }}
      />
    </div>
  );
}
