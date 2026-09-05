import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { permissionService, patientService } from '../../services/api';
import { RoleBadge, StatusBadge } from '../../components/StatusBadge';
import { Key, ShieldCheck, UserCheck, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export const PermissionsPage = () => {
  const { role, user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError('');

      if (role === 'ADMIN') {
        const res = await permissionService.getAll();
        if (res.data.success) setPermissions(res.data.data || []);
      } else if (role === 'PATIENT') {
        // Find patient ID first
        const pRes = await patientService.getAll();
        if (pRes.data.success && pRes.data.data.content && pRes.data.data.content.length > 0) {
          const patientId = pRes.data.data.content[0].id;
          const permRes = await permissionService.getByPatient(patientId);
          if (permRes.data.success) setPermissions(permRes.data.data || []);
        }
      } else {
        // For other roles, try to fetch all or patient permissions
        try {
          const res = await permissionService.getAll();
          if (res.data.success) setPermissions(res.data.data || []);
        } catch (e) {
          setPermissions([]);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch access permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [role]);

  const handleRevoke = async (permissionId) => {
    if (!window.confirm('Are you sure you want to revoke this consent clearance immediately?')) return;

    try {
      await permissionService.revoke(permissionId);
      loadPermissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke permission');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Consent & Access Clearances</h1>
            <span className="badge badge-violet">
              <Key size={12} />
              Policy Matrix
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Zero-trust explicit patient consent and third-party research authorization
          </p>
        </div>

        <button onClick={loadPermissions} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Target User / Entity</th>
                <th>Role</th>
                <th>Patient Subject</th>
                <th>Scope</th>
                <th>Action Permitted</th>
                <th>Status</th>
                <th>Clearance Expiry</th>
                <th>Research / Business Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading active consent policies...
                  </td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No permissions or clearances active.
                  </td>
                </tr>
              ) : (
                permissions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.userName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{p.userEmail}</div>
                    </td>
                    <td><RoleBadge role={p.userRole} /></td>
                    <td style={{ fontWeight: 500 }}>{p.patientName}</td>
                    <td><code>{p.resourceType}</code></td>
                    <td><span className="badge badge-cyan">{p.action}</span></td>
                    <td><StatusBadge status={p.status} /></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {p.expiresAt ? p.expiresAt.replace('T', ' ') : 'Permanent'}
                    </td>
                    <td style={{ fontSize: '13px', maxWidth: '220px' }}>{p.reason}</td>
                    <td>
                      {p.status === 'ACTIVE' && (role === 'PATIENT' || role === 'ADMIN') && (
                        <button
                          onClick={() => handleRevoke(p.id)}
                          className="btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <XCircle size={14} />
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
