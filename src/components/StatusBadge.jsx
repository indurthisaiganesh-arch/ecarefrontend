import React from 'react';
import { ShieldCheck, Lock, UserCheck, AlertTriangle } from 'lucide-react';

export const RoleBadge = ({ role }) => {
  if (!role) return null;

  const config = {
    ADMIN: { label: 'System Admin', className: 'badge-cyan' },
    DOCTOR: { label: 'Doctor / Physician', className: 'badge-green' },
    NURSE: { label: 'Care Staff / Nurse', className: 'badge-violet' },
    PATIENT: { label: 'Patient Portal', className: 'badge-cyan' },
    RESEARCHER: { label: 'Clinical Researcher', className: 'badge-amber' },
    INSURANCE: { label: 'Insurance Adjuster', className: 'badge-violet' },
    HEAD_RECRUITER: { label: 'Head Recruiter / HR', className: 'badge-amber' },
    RECEPTIONIST: { label: 'Frontdesk / Appointer', className: 'badge-cyan' },
    LAB_TECHNICIAN: { label: 'Lab Diagnostics Specialist', className: 'badge-violet' },
    RADIOLOGIST: { label: 'Radiology / Imaging Specialist', className: 'badge-green' },
  };

  const item = config[role] || { label: role, className: 'badge-cyan' };

  return (
    <span className={`badge ${item.className}`}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
      {item.label}
    </span>
  );
};

export const EncryptionBadge = ({ label = 'AES-256-GCM Secured' }) => (
  <span className="badge badge-green" title="Encrypted at rest with AES-256-GCM authenticated cipher">
    <Lock size={11} />
    {label}
  </span>
);

export const StatusBadge = ({ status }) => {
  const isGood = status === 'ACTIVE' || status === 'SUCCESS' || status === 'ALLOW' || status === 'UP';
  const isWarn = status === 'WARN' || status === 'EXPIRED' || status === 'MEDIUM';
  const isBad = status === 'REVOKED' || status === 'FAILURE' || status === 'LOCKED' || status === 'HIGH' || status === 'CRITICAL';

  let cls = 'badge-cyan';
  if (isGood) cls = 'badge-green';
  else if (isWarn) cls = 'badge-amber';
  else if (isBad) cls = 'badge-red';

  return (
    <span className={`badge ${cls}`}>
      {status}
    </span>
  );
};
