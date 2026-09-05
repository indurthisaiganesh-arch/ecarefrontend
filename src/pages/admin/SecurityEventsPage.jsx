/**
 * ─── SecurityEventsPage ───────────────────────────────────────────────────────
 * Admin: AI Security & Anomaly Monitor
 * Data: useSecurityEvents() hook — no API calls in this component
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { useSecurityEvents } from '../../hooks/useAuditLogs';
import { Alert }              from '../../components/common/Alert';
import { PageHeader }         from '../../components/common/PageHeader';
import { TableSkeleton }      from '../../components/common/LoadingSkeleton';
import { StatusBadge }        from '../../components/StatusBadge';
import { formatDateTime }     from '../../utils/formatters';
import { RefreshCw, Zap }     from 'lucide-react';

export const SecurityEventsPage = () => {
  const { events, loading, error, reload } = useSecurityEvents({ size: 25 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <PageHeader
        title="AI Security & Anomaly Monitor"
        subtitle="Real-time heuristic anomaly detection assessing access patterns, temporal anomalies, and privilege deviations"
        badge={{ label: 'Zero-Trust Engine', className: 'badge-amber' }}
        actions={
          <button onClick={reload} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /><span>Refresh</span>
          </button>
        }
      />

      <Alert type="error" message={error} />

      <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Risk Score</th>
                <th>Severity</th>
                <th>Decision</th>
                <th>Heuristic Analysis Reasons</th>
                <th>Target Endpoint</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={8} cols={7} />
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No security anomaly events recorded. System telemetry is within nominal parameters.
                  </td>
                </tr>
              ) : events.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDateTime(ev.timestamp)}
                  </td>
                  <td style={{ fontWeight: 600 }}>{ev.eventType}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '60px', height: '8px', borderRadius: '4px',
                        backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${Math.min(ev.riskScore || 0, 100)}%`,
                          height: '100%',
                          backgroundColor: ev.riskScore > 60 ? '#ef4444' : ev.riskScore > 30 ? '#f59e0b' : '#10b981',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>
                        {ev.riskScore ? ev.riskScore.toFixed(0) : 0}%
                      </span>
                    </div>
                  </td>
                  <td><StatusBadge status={ev.riskLevel || 'LOW'} /></td>
                  <td>
                    <span className={`badge ${ev.decision === 'ALLOW' ? 'badge-green' : 'badge-red'}`}>
                      {ev.decision}
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', maxWidth: '300px' }}>
                    {ev.reasons || 'Nominal clearance verification'}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {ev.endpoint}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
