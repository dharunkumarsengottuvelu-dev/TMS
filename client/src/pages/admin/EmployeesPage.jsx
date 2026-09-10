import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { employeeService } from '../../services/employeeService.js';
import { Pagination } from '../../components/common/Pagination.jsx';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { Search, User, Eye, RotateCcw } from 'lucide-react';

export function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: 8,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await employeeService.getEmployees(params);
      setEmployees(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees();
  };

  const handleReset = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h1>Employee Directory & Workload</h1>
          <p>Inspect active personnel, workload distribution, and individual task progress.</p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="card" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-4)' }}>
        <form onSubmit={handleSearchSubmit} className="filter-bar" style={{ marginBottom: 0 }}>
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by employee name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>

          {searchTerm && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* Employees Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading employee directory..." />
        ) : error ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
            <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={fetchEmployees}>
              Retry
            </button>
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees found"
            description="No employee records match your search criteria."
          />
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Email Address</th>
                    <th>Status</th>
                    <th>Total Tasks</th>
                    <th>In Progress</th>
                    <th>Completed</th>
                    <th style={{ textAlign: 'right' }}>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: '#e0e7ff',
                              color: 'var(--primary-600)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <User size={16} />
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {emp.name}
                          </span>
                        </div>
                      </td>

                      <td style={{ color: 'var(--text-secondary)' }}>{emp.email}</td>

                      <td>
                        <span className="badge" style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
                          Active
                        </span>
                      </td>

                      <td>
                        <strong>{emp.taskStats?.totalTasks || 0}</strong>
                      </td>

                      <td>
                        <span style={{ color: 'var(--color-info)', fontWeight: 600 }}>
                          {emp.taskStats?.inProgress || 0}
                        </span>
                      </td>

                      <td>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          {emp.taskStats?.completed || 0}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/admin/employees/${emp._id}`} className="btn btn-secondary btn-sm">
                          <Eye size={14} />
                          <span>View Profile</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(p) => setCurrentPage(p)} />
          </>
        )}
      </div>
    </div>
  );
}
