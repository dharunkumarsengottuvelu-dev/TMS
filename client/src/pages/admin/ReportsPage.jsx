import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.jsx';
import { Toast } from '../../components/common/Toast.jsx';
import { Download, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../services/api.js';

export function ReportsPage() {
  const [summary, setSummary] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setError(null);
        const [sumRes, perfRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/reports/performance'),
        ]);
        setSummary(sumRes.data);
        setPerformance(Array.isArray(perfRes.data) ? perfRes.data : []);
      } catch (err) {
        setError(err.message || 'Failed to generate operational reports.');
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleExportCsv = async () => {
    try {
      // Use native fetch to bypass Axios interceptor (which would corrupt binary/CSV response)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/export/csv`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `executive-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setToastMessage('Export CSV generated successfully.');
    } catch {
      alert('Failed to generate CSV export.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating executive performance analytics..." />;
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3>Analytics Generation Error</h3>
        <p style={{ marginTop: 8 }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <Toast
        type="success"
        message={toastMessage}
        onDismiss={() => setToastMessage('')}
      />

      <div className="section-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Executive Operations & Staff Performance</h1>
          <p className="page-subtitle">
            Quantitative organizational reports, milestone completion rates, and staff capacity metrics.
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={handleExportCsv}>
          <Download size={15} />
          <span>Export Full CSV</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: 'var(--space-6)' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Tasks</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-secondary)' }}>
              <BarChart2 size={18} />
            </div>
          </div>
          <div className="metric-value">{summary?.totalTasks || 0}</div>
          <div className="metric-desc">Across all work streams</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Completion Rate</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed-text)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-success)' }}>
            {summary?.totalTasks > 0
              ? Math.round(((summary?.statusBreakdown?.COMPLETED || 0) / summary.totalTasks) * 100)
              : 0}
            %
          </div>
          <div className="metric-desc">Overall milestone delivery</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Overdue Deliverables</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#b91c1c' }}>
            {summary?.overdueTasks || 0}
          </div>
          <div className="metric-desc">Past target deadline</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">High Priority Work</span>
            <div className="metric-icon-wrap" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: '#ea580c' }}>
            {summary?.priorityBreakdown?.HIGH || 0}
          </div>
          <div className="metric-desc">Mission critical items</div>
        </div>
      </div>

      {/* Staff Performance Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Employee Performance & Delivery Ratios</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Formula: Completed Tasks / Total Assigned Tasks &times; 100
            </p>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th style={{ textAlign: 'center' }}>Total Assigned</th>
                <th style={{ textAlign: 'center' }}>Completed</th>
                <th style={{ textAlign: 'center' }}>In Progress</th>
                <th style={{ textAlign: 'center' }}>Pending</th>
                <th style={{ textAlign: 'center' }}>Not Started</th>
                <th style={{ textAlign: 'center' }}>Overdue</th>
                <th style={{ minWidth: 160 }}>Completion Ratio</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{emp.totalAssigned}</td>
                  <td style={{ textAlign: 'center', color: 'var(--color-success)', fontWeight: 600 }}>
                    {emp.completed}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--color-info)', fontWeight: 600 }}>
                    {emp.inProgress}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--color-warning)', fontWeight: 600 }}>
                    {emp.pending}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{emp.notStarted}</td>
                  <td style={{ textAlign: 'center', color: emp.overdue > 0 ? '#b91c1c' : 'var(--text-muted)', fontWeight: emp.overdue > 0 ? 700 : 400 }}>
                    {emp.overdue}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, backgroundColor: 'var(--bg-muted)', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${emp.completionRate}%`,
                            height: '100%',
                            backgroundColor:
                              emp.completionRate >= 70
                                ? 'var(--color-success)'
                                : emp.completionRate >= 40
                                ? 'var(--color-warning)'
                                : 'var(--primary-600)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: 36, textAlign: 'right' }}>
                        {emp.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
