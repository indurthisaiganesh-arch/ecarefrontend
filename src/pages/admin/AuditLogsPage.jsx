/**
 * ─── AuditLogsPage ────────────────────────────────────────────────────────────
 * Admin: Immutable Audit Trail
 * Data: useAuditLogs() hook — no API calls in this component
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState } from 'react';
import { useAuditLogs }   from '../../hooks/useAuditLogs';
import { Alert }           from '../../components/common/Alert';
import { PageHeader }      from '../../components/common/PageHeader';
import { TableSkeleton }   from '../../components/common/LoadingSkeleton';
import { StatusBadge }     from '../../components/StatusBadge';
import { formatDateTime }  from '../../utils/formatters';
import { History, RefreshCw, ShieldCheck } from 'lucide-react';

export const AuditLogsPage = () => {
  const [page, setPage] = useState(0);
  const { logs, loading, error, totalPages, reload } = useAuditLogs({ page, size: 25 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <PageHeader
        title="Immutable Audit Trail"
        subtitle="Cryptographically sealed audit log recording all access attempts, consultations, and clearance changes"
        badge={{ label: 'Append-Only Tamper-Proof', className: 'badge-green' }}
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
                <th>Operator</th>
                <th>Role</th>
                <th>Action Vector</th>
                <th>Target Resource</th>
                <th>Source IP</th>
                <th>Outcome</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeleton rows={8} cols={7} />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.username || 'System Engine'}</td>
                  <td>
                    <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                      {log.role || 'GUEST'}
                    </span>
                  </td>
                  <td>
                    <code style={{
                      padding: '3px 8px', borderRadius: '4px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-color)', fontSize: '12px',
                    }}>
                      {log.action}
                    </code>
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    <span>{log.resource}</span>
                    {log.resourceId && (
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                        ID: {String(log.resourceId).substring(0, 10)}…
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td><StatusBadge status={log.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '8px',
            padding: '16px', borderTop: '1px solid var(--border-color)',
          }}>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>← Prev</button>
            <span style={{ padding: '6px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Page {page + 1} of {totalPages}
            </span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};
