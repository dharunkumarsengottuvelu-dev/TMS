import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../../services/taskService.js';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import { PriorityBadge } from '../../components/common/PriorityBadge.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { CreateTaskModal } from '../../components/tasks/CreateTaskModal.jsx';
import { Toast } from '../../components/common/Toast.jsx';
import { Search, Plus, Trash2, Eye, RotateCcw } from 'lucide-react';

export function AdminTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Query state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Feedback
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

      const res = await taskService.getTasks(params);
      setTasks(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, priorityFilter, sortBy, order]);

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
    setSortBy('createdAt');
    setOrder('desc');
    setCurrentPage(1);
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

  return (
    <div>
      <Toast
        type="success"
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Central Task Management</h1>
          <p>Create, assign, inspect, and monitor enterprise tasks across the organization.</p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-4)' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, description, or employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Status"
            >
              <option value="">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <select
              className="form-select"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Priority"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [newSort, newOrder] = e.target.value.split('-');
                setSortBy(newSort);
                setOrder(newOrder);
                setCurrentPage(1);
              }}
              aria-label="Sort Order"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="priority-asc">Priority Order</option>
              <option value="status-asc">Status Order</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            Apply
          </button>

          {(searchTerm || statusFilter || priorityFilter || sortBy !== 'createdAt') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              title="Reset all search and filter criteria"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

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
                    <th style={{ minWidth: '240px' }}>Task Specification</th>
                    <th>Assigned Staff</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Updated</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <Link to={`/admin/tasks/${task._id}`} className="table-row-title">
                          {task.title}
                        </Link>
                        <span className="table-row-subtext">
                          {task.description.length > 80 ? `${task.description.slice(0, 80)}...` : task.description}
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

                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {new Date(task.updatedAt).toLocaleDateString('en-US', {
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
                  ))}
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
