import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { Search, RotateCcw, ArrowRight, Code, ChevronDown, ChevronUp, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../../services/api.js';

function AuditStatusCell({ log }) {
  const channel = log.role === 'ADMIN' ? 'Admin Portal' : 'Employee Portal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', whiteSpace: 'nowrap' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '2px 9px',
          borderRadius: '9999px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          fontSize: '0.73rem',
          fontWeight: 600,
          width: 'fit-content',
        }}
      >
        <CheckCircle size={12} style={{ color: '#10b981' }} />
        Success
      </span>
      <span
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          paddingLeft: '2px',
        }}
      >
        <ShieldCheck size={11} style={{ color: '#64748b' }} />
        {channel}
      </span>
    </div>
  );
}

function OperationDetailsCell({ details }) {
  const [showRaw, setShowRaw] = useState(false);

  if (!details || (typeof details === 'object' && Object.keys(details).length === 0)) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>&mdash;</span>;
  }

  if (typeof details !== 'object') {
    return <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{String(details)}</span>;
  }

  // 1. Status change (User Active/Inactive or Task status)
  if (details.previousStatus !== undefined && details.newStatus !== undefined) {
    const isBool = typeof details.previousStatus === 'boolean' || typeof details.newStatus === 'boolean';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Status:</span>
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: isBool ? (details.previousStatus ? '#dcfce7' : '#fee2e2') : '#f1f5f9',
            color: isBool ? (details.previousStatus ? '#166534' : '#991b1b') : '#475569',
          }}
        >
          {isBool ? (details.previousStatus ? 'Active' : 'Inactive') : String(details.previousStatus)}
        </span>
        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: '4px',
            backgroundColor: isBool ? (details.newStatus ? '#dcfce7' : '#fee2e2') : '#e0e7ff',
            color: isBool ? (details.newStatus ? '#166534' : '#991b1b') : '#3730a3',
          }}
        >
          {isBool ? (details.newStatus ? 'Active' : 'Inactive') : String(details.newStatus)}
        </span>

        {details.activeTasksAtDeactivation !== undefined && (
          <span
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
              padding: '1px 6px',
              borderRadius: '4px',
            }}
          >
            {details.activeTasksAtDeactivation} active tasks
          </span>
        )}
      </div>
    );
  }

  // 2. Field updates (e.g. employee profile edit)
  if (details.oldValues && details.newValues) {
    const updatedKeys = Object.keys(details.newValues);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {updatedKeys.map((key) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'capitalize' }}>
              {key}:
            </span>
            <span style={{ textDecoration: 'line-through', color: '#94a3b8' }}>
              {String(details.oldValues?.[key] || 'empty')}
            </span>
            <ArrowRight size={11} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: 600, color: 'var(--primary-700, #0f766e)' }}>
              {String(details.newValues[key])}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // 3. Employee Creation / Onboarding
  if (details.name && details.email) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
        {details.employeeId && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '4px',
              backgroundColor: '#e0e7ff',
              color: '#3730a3',
            }}
          >
            {details.employeeId}
          </span>
        )}
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{details.name}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({details.email})</span>
        {details.department && (
          <span
            style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle, #f1f5f9)',
              color: 'var(--text-secondary, #475569)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
            }}
          >
            {details.department}
          </span>
        )}
        {details.role && (
          <span
            style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              fontWeight: 600,
            }}
          >
            {details.role}
          </span>
        )}
      </div>
    );
  }

  // 4. Bulk Task Status Update
  if (details.count !== undefined && details.targetStatus) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {details.count} Task{details.count !== 1 ? 's' : ''} Updated
        </span>
        <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
          }}
        >
          {details.targetStatus}
        </span>
      </div>
    );
  }

  // 5. Reassignment
  if (details.from && details.to) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>Reassigned:</span>
        <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{details.from}</span>
        <ArrowRight size={11} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontWeight: 600, color: 'var(--primary-700, #1d4ed8)' }}>{details.to}</span>
      </div>
    );
  }

  // 6. Generic task info
  if (details.title) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>&ldquo;{details.title}&rdquo;</span>
        {details.priority && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: '#fef3c7',
              color: '#92400e',
            }}
          >
            {details.priority}
          </span>
        )}
      </div>
    );
  }

  // Fallback: clean key-value tags + optional JSON inspection toggle
  const keys = Object.keys(details);
  return (
    <div style={{ fontSize: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {keys.map((k) => (
          <span
            key={k}
            style={{
              display: 'inline-flex',
              gap: '4px',
              fontSize: '0.75rem',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-subtle, #f8fafc)',
              border: '1px solid var(--border-subtle, #e2e8f0)',
            }}
          >
            <strong style={{ color: 'var(--text-muted)' }}>{k}:</strong>
            <span style={{ color: 'var(--text-primary)' }}>
              {typeof details[k] === 'object' ? JSON.stringify(details[k]) : String(details[k])}
            </span>
          </span>
        ))}

        <button
          type="button"
          onClick={() => setShowRaw(!showRaw)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 4px',
            color: 'var(--text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '0.7rem',
          }}
          title="Toggle raw JSON"
        >
          <Code size={11} />
          {showRaw ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {showRaw && (
        <pre
          style={{
            marginTop: '6px',
            fontSize: '0.72rem',
            backgroundColor: 'var(--bg-muted, #f1f5f9)',
            padding: '6px 8px',
            borderRadius: '4px',
            overflowX: 'auto',
            maxHeight: '120px',
          }}
        >
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

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
              placeholder="Filter by action or keyword..."
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
                    <th>Status & Channel</th>
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

                      <td>
                        <OperationDetailsCell details={log.details} />
                      </td>

                      <td>
                        <AuditStatusCell log={log} />
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

