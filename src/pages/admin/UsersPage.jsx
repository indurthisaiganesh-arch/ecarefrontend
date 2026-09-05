/**
 * ─── UsersPage ────────────────────────────────────────────────────────────────
 * Admin: System User Directory
 *
 * Features:
 *  - Pending self-registration approval queue
 *  - All system accounts table with activate/deactivate + 2FA toggle
 *  - Staff-created user modal (bypasses approval queue)
 *  - Email notifications on approve/reject/create (via emailService)
 *
 * Data: useUsers() hook — no API calls in this component
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useUsers }     from '../../hooks/useUsers';
import { useToast }     from '../../hooks/useToast';
import { emailService } from '../../services/api';
import { Alert }          from '../../components/common/Alert';
import { PageHeader }     from '../../components/common/PageHeader';
import { Modal }          from '../../components/common/Modal';
import { TableSkeleton }  from '../../components/common/LoadingSkeleton';
import { RoleBadge, StatusBadge } from '../../components/StatusBadge';
import { STAFF_CREATE_ROLES }     from '../../constants/roles';
import { formatDateTime }         from '../../utils/formatters';
import {
  RefreshCw, Check, Ban, Shield, ShieldOff,
  Clock, UserCheck, UserX, UserPlus, Users, ClipboardList,
} from 'lucide-react';

// ─── localStorage helpers (pending self-registrations) ───────────────────────
const PENDING_KEY = 'ecare_pending_registrations';
const getPending    = () => { try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); } catch { return []; } };
const removePending = (email) => {
  try {
    const filtered = getPending().filter((e) => e.email !== email);
    localStorage.setItem(PENDING_KEY, JSON.stringify(filtered));
  } catch {/* */}
};
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', username: '',
  password: '', phoneNumber: '', role: 'NURSE',
};

export const UsersPage = () => {
  const toast = useToast();
  const {
    users, loading, error,
    mfaLoading, reload,
    toggleStatus, toggleMfa,
    createUser, activateUser, deactivateUser,
  } = useUsers();

  const [pendingList,     setPendingList]     = useState([]);
  const [approvalLoading, setApprovalLoading] = useState({}); // { [email]: 'approve'|'reject'|null }

  // Create-user modal
  const [showModal,   setShowModal]   = useState(false);
  const [formData,    setFormData]    = useState(EMPTY_FORM);
  const [formError,   setFormError]   = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const refreshPending = () => setPendingList(getPending());

  useEffect(() => { refreshPending(); }, []);

  // ── Approve pending registration ──────────────────────────────────────────
  const handleApprove = async (p) => {
    setApprovalLoading((prev) => ({ ...prev, [p.email]: 'approve' }));
    try {
      const matched = users.find((u) => u.email === p.email);
      if (matched && !matched.active) {
        const result = await activateUser(matched.id);
        if (!result.success) { toast.error(result.error); return; }
      }
      // Notify the user by email
      emailService.sendApprovalEmail(p.email, p.fullName).catch(() => {/* non-blocking */});

      removePending(p.email);
      refreshPending();
      reload();
      toast.success(`${p.fullName}'s account has been approved.`);
    } catch (err) {
      toast.error('Failed to approve registration.');
    } finally {
      setApprovalLoading((prev) => ({ ...prev, [p.email]: null }));
    }
  };

  // ── Reject pending registration ───────────────────────────────────────────
  const handleReject = async (p) => {
    if (!window.confirm(`Reject registration for ${p.fullName} (${p.email})?`)) return;
    setApprovalLoading((prev) => ({ ...prev, [p.email]: 'reject' }));
    try {
      const matched = users.find((u) => u.email === p.email);
      if (matched && matched.active) {
        const result = await deactivateUser(matched.id);
        if (!result.success) { toast.error(result.error); return; }
      }
      // Notify the user by email
      emailService.sendRejectionEmail(p.email, p.fullName).catch(() => {/* non-blocking */});

      removePending(p.email);
      refreshPending();
      reload();
      toast.warning(`${p.fullName}'s registration has been rejected.`);
    } catch {
      toast.error('Failed to reject registration.');
    } finally {
      setApprovalLoading((prev) => ({ ...prev, [p.email]: null }));
    }
  };

  // ── Toggle active status ──────────────────────────────────────────────────
  const handleToggleStatus = async (userId, currentActive, userName) => {
    const result = await toggleStatus(userId, currentActive);
    if (result.success) {
      toast.success(`${userName} has been ${currentActive ? 'deactivated' : 'activated'}.`);
    } else {
      toast.error(result.error);
    }
  };

  // ── Toggle 2FA ────────────────────────────────────────────────────────────
  const handleToggleMfa = async (userId, currentMfa, userName) => {
    const result = await toggleMfa(userId, currentMfa);
    if (result.success) {
      toast.info(`2FA ${currentMfa ? 'disabled' : 'enabled'} for ${userName}.`);
    } else {
      toast.error(result.error);
    }
  };

  // ── Create staff user ─────────────────────────────────────────────────────
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      const result = await createUser(formData);
      if (result.success) {
        // Send welcome email (non-blocking)
        emailService.sendWelcomeEmail(
          formData.email,
          `${formData.firstName} ${formData.lastName}`,
          formData.role
        ).catch(() => {/* SMTP may not be configured yet */});

        toast.success(`Account for ${formData.firstName} ${formData.lastName} created successfully.`);
        setFormData(EMPTY_FORM);
        setTimeout(() => setShowModal(false), 400);
      } else {
        setFormError(result.error);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // ── Computed values ───────────────────────────────────────────────────────
  const pendingEmails = new Set(pendingList.map((p) => p.email));
  const activeUsers   = users.filter((u) => !pendingEmails.has(u.email));

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="System User Directory"
        subtitle="Manage all registered accounts and review self-registration requests"
        badges={[
          { label: `${activeUsers.length} Accounts`, className: 'badge-cyan' },
          ...(pendingList.length > 0 ? [{ label: `${pendingList.length} Pending Approval`, className: 'badge-amber' }] : []),
        ]}
        actions={
          <>
            <button
              onClick={() => { reload(); refreshPending(); }}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} /><span>Refresh</span>
            </button>
            <button
              onClick={() => { setShowModal(true); setFormError(''); setFormData(EMPTY_FORM); }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={14} /><span>Create User</span>
            </button>
          </>
        }
      />

      {/* ── Error Alert ───────────────────────────────────────────────────── */}
      <Alert type="error" message={error} />

      {/* ══════════════════════════════════════════════════════════════════════
          TABLE 1: Pending Self-Registrations (approval required)
         ══════════════════════════════════════════════════════════════════════ */}
      <section aria-label="Pending registration approvals">
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock size={15} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>
              Pending Registration Approvals
              {pendingList.length > 0 && (
                <span style={{
                  marginLeft: '8px', padding: '2px 8px', borderRadius: '10px',
                  background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: '11px', fontWeight: 700,
                }}>{pendingList.length}</span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Users who self-registered via the public form — require admin approval
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{
          padding: 0, overflow: 'hidden',
          border: pendingList.length > 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border-color)',
        }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Requested Role</th>
                  <th>Phone</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'center' }}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={28} color="var(--text-subtle)" />
                        <span style={{ fontSize: '13px' }}>No pending registration requests</span>
                      </div>
                    </td>
                  </tr>
                ) : pendingList.map((p) => (
                  <tr key={p.email} style={{ background: 'rgba(245,158,11,0.03)' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(251,191,36,0.12))',
                          border: '1px solid rgba(245,158,11,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700, color: '#f59e0b',
                        }}>
                          {p.fullName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.fullName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>@{p.username}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.email}</td>
                    <td><RoleBadge role={p.role} /></td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.phone || '—'}</td>
                    <td style={{ fontSize: '11px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(p.registeredAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          id={`approve-${p.email}`}
                          onClick={() => handleApprove(p)}
                          disabled={!!approvalLoading[p.email]}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(16,185,129,0.5)', background: 'rgba(16,185,129,0.12)',
                            color: '#34d399', fontSize: '12px', fontWeight: 600,
                            cursor: approvalLoading[p.email] ? 'not-allowed' : 'pointer',
                            opacity: approvalLoading[p.email] ? 0.6 : 1, transition: 'var(--transition)',
                          }}
                        >
                          <UserCheck size={13} />
                          {approvalLoading[p.email] === 'approve' ? 'Approving…' : 'Approve'}
                        </button>
                        <button
                          id={`reject-${p.email}`}
                          onClick={() => handleReject(p)}
                          disabled={!!approvalLoading[p.email]}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.10)',
                            color: '#f87171', fontSize: '12px', fontWeight: 600,
                            cursor: approvalLoading[p.email] ? 'not-allowed' : 'pointer',
                            opacity: approvalLoading[p.email] ? 0.6 : 1, transition: 'var(--transition)',
                          }}
                        >
                          <UserX size={13} />
                          {approvalLoading[p.email] === 'reject' ? 'Rejecting…' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TABLE 2: All System Accounts
         ══════════════════════════════════════════════════════════════════════ */}
      <section aria-label="All system accounts">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={15} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>
              All System Accounts
              <span style={{
                marginLeft: '8px', padding: '2px 8px', borderRadius: '10px',
                background: 'rgba(6,182,212,0.15)', color: 'var(--primary)', fontSize: '11px', fontWeight: 700,
              }}>{activeUsers.length}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Staff-created & approved accounts — active in the system
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Assigned Role</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Lockout</th>
                  <th>Registered</th>
                  <th>2-Step Verification</th>
                  <th>Administrator Control</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableSkeleton rows={6} cols={8} />
                ) : activeUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No accounts yet. Use "Create User" to add one.
                    </td>
                  </tr>
                ) : activeUsers.map((u) => {
                  const name = u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{name || u.username}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{u.email}</div>
                      </td>
                      <td><RoleBadge role={u.role} /></td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.phoneNumber || 'Not provided'}</td>
                      <td><StatusBadge status={u.active ? 'ACTIVE' : 'DEACTIVATED'} /></td>
                      <td>
                        {u.locked
                          ? <span className="badge badge-red">LOCKED</span>
                          : <span className="badge badge-green">UNLOCKED</span>}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDateTime(u.createdAt)}
                      </td>
                      <td>
                        <button
                          id={`2fa-toggle-${u.id}`}
                          onClick={() => handleToggleMfa(u.id, u.mfaEnabled, name)}
                          disabled={!!mfaLoading[u.id]}
                          title={u.mfaEnabled ? 'Disable 2-Step Verification' : 'Enable 2-Step Verification'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '5px 11px', borderRadius: 'var(--radius-sm)',
                            border: u.mfaEnabled ? '1px solid rgba(6,182,212,0.5)' : '1px solid rgba(245,158,11,0.5)',
                            background: u.mfaEnabled ? 'rgba(6,182,212,0.12)' : 'rgba(245,158,11,0.10)',
                            color: u.mfaEnabled ? 'var(--primary)' : '#f59e0b',
                            fontSize: '11px', fontWeight: 600,
                            cursor: mfaLoading[u.id] ? 'not-allowed' : 'pointer',
                            opacity: mfaLoading[u.id] ? 0.6 : 1,
                            whiteSpace: 'nowrap', transition: 'var(--transition)',
                          }}
                        >
                          {u.mfaEnabled ? <><Shield size={12} /><span>OTP ON</span></> : <><ShieldOff size={12} /><span>OTP OFF</span></>}
                        </button>
                      </td>
                      <td>
                        <button
                          id={`status-toggle-${u.id}`}
                          onClick={() => handleToggleStatus(u.id, u.active, name)}
                          className={u.active ? 'btn-danger' : 'btn-secondary'}
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {u.active ? <Ban size={13} /> : <Check size={13} />}
                          <span>{u.active ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: Create Staff Account
         ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Staff Account"
        subtitle="Staff-created accounts are active immediately — no approval required"
        icon={<UserPlus size={20} color="#fff" />}
        maxWidth="520px"
      >
        {/* Error */}
        <Alert type="error" message={formError} style={{ marginBottom: '16px' }} />

        {/* Info Banner */}
        <div style={{
          padding: '9px 13px', borderRadius: 'var(--radius-sm)', marginBottom: '18px',
          background: 'rgba(6,182,212,0.07)', border: '1px solid rgba(6,182,212,0.25)',
          color: 'var(--primary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '7px',
        }}>
          <Shield size={13} />
          <span>Account will be <strong>active immediately</strong> — bypasses approval queue. Welcome email will be sent.</span>
        </div>

        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>First Name *</label>
              <input type="text" required className="glass-input" placeholder="Jane"
                value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Last Name *</label>
              <input type="text" required className="glass-input" placeholder="Doe"
                value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Email Address *</label>
              <input type="email" required className="glass-input" placeholder="jane@ecare.com"
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Username *</label>
              <input type="text" required className="glass-input" placeholder="janedoe"
                value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Password * (min 8 chars)</label>
            <input type="password" required minLength={8} className="glass-input" placeholder="••••••••••••"
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Phone Number</label>
              <input type="tel" className="glass-input" placeholder="+1-555-0199"
                value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>System Role *</label>
              <select className="glass-input" style={{ cursor: 'pointer' }}
                value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                {STAFF_CREATE_ROLES.map((r) => (
                  <option key={r} value={r} style={{ background: '#0f172a' }}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary"
              style={{ flex: 1, height: '44px' }}>Cancel</button>
            <button type="submit" disabled={formLoading} className="btn-primary"
              style={{ flex: 2, height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <UserPlus size={15} />
              {formLoading ? 'Creating Account…' : 'Create Account Instantly'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
