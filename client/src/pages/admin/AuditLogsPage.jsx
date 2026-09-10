import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { Search, RotateCcw } from 'lucide-react';
import api from '../../services/api.js';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: 12,
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (entityFilter) params.entity = entityFilter;

      const res = await api.get('/audit-logs', { params });
      setLogs(Array.isArray(res.data) ? res.data : []);
      setPagination(res.pagination || null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve immutable audit records.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, entityFilter]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuditLogs();
  };

  const handleReset = () => {
    setSearchTerm('');
    setEntityFilter('');
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Enterprise Governance & Audit Logs</h1>
          <p className="page-subtitle">
            Immutable, cryptographically anchored audit trail tracking all administrative, security, and task operations.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
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
              placeholder="Filter by action or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ width: 140 }}>
            <select
              className="form-select"
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Entities</option>
              <option value="TASK">Task</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="AUTH">Authentication</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm">
            <span>Filter</span>
          </button>

          {(searchTerm || entityFilter) && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner message="Querying immutable audit logs..." />
        ) : error ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-danger)' }}>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records match the selected criteria.
          </div>
        ) : (
          <>
            <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Operation Details</th>
                    <th>Source IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </td>

                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.actor?.name || 'System Operator'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {log.actor?.email}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: log.role === 'ADMIN' ? '#e0e7ff' : '#f1f5f9',
                            color: log.role === 'ADMIN' ? 'var(--primary-700)' : 'var(--text-secondary)',
                          }}
                        >
                          {log.role}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.action}</span>
                      </td>

                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-subtle)',
                          }}
                        >
                          {log.entity}
                        </span>
                      </td>

                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {typeof log.details === 'object' ? (
                          <code style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-muted)', padding: '2px 6px', borderRadius: 3 }}>
                            {JSON.stringify(log.details)}
                          </code>
                        ) : (
                          String(log.details)
                        )}
                      </td>

                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        {log.ip}
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
    </div>
  );
}
