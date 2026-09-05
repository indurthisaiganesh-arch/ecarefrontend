/**
 * ─── Sidebar (Layout) ─────────────────────────────────────────────────────────
 * Role-based navigation sidebar.
 * Part of the app shell (rendered inside ProtectedRoute for authenticated pages).
 *
 * Each role sees only the nav items relevant to their permissions.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, ShieldAlert, Key,
  UserCheck, History, FileLock2, Settings, Calendar,
  UserPlus, UploadCloud, FileImage, Stethoscope,
} from 'lucide-react';

// ── Nav item definitions per role ─────────────────────────────────────────────

const BASE_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
];

const ROLE_NAV = {
  ADMIN: [
    { path: '/patients',               label: 'Patients Directory',    icon: <Users size={18} /> },
    { path: '/appointments',           label: 'Doctor Appointments',   icon: <Calendar size={18} /> },
    { path: '/staff-recruitment',      label: 'Staff Recruitment',     icon: <UserPlus size={18} /> },
    { path: '/admin/users',            label: 'User Directory',        icon: <UserCheck size={18} /> },
    { path: '/admin/audit-logs',       label: 'Audit Trail',           icon: <History size={18} /> },
    { path: '/admin/security-events',  label: 'Security Monitor',      icon: <ShieldAlert size={18} /> },
    { path: '/permissions',            label: 'Consent & Policies',    icon: <Key size={18} /> },
  ],
  DOCTOR: [
    { path: '/patients',    label: 'Patient Registry',                 icon: <Users size={18} /> },
    { path: '/appointments',label: 'Appointments & Consultations',     icon: <Calendar size={18} /> },
    { path: '/permissions', label: 'Access Permissions',               icon: <Key size={18} /> },
  ],
  NURSE: [
    { path: '/patients',    label: 'Patient Registry',   icon: <Users size={18} /> },
    { path: '/appointments',label: 'Doctor Schedules',   icon: <Calendar size={18} /> },
    { path: '/permissions', label: 'Access Permissions', icon: <Key size={18} /> },
  ],
  HEAD_RECRUITER: [
    { path: '/staff-recruitment', label: 'Staff Recruitment & Roster', icon: <UserPlus size={18} /> },
    { path: '/admin/users',       label: 'Personnel Accounts',         icon: <UserCheck size={18} /> },
  ],
  RECEPTIONIST: [
    { path: '/appointments', label: 'Doctor Appointments Desk', icon: <Calendar size={18} /> },
    { path: '/patients',     label: 'Patient Admissions',        icon: <Users size={18} /> },
  ],
  LAB_TECHNICIAN: [
    { path: '/patients', label: 'Diagnostic Lab Reports', icon: <UploadCloud size={18} /> },
  ],
  RADIOLOGIST: [
    { path: '/patients', label: 'Imaging & Diagnostic Scans', icon: <FileImage size={18} /> },
  ],
  PATIENT: [
    { path: '/my-records',  label: 'My Health Records',  icon: <FileLock2 size={18} /> },
    { path: '/appointments',label: 'My Appointments',     icon: <Calendar size={18} /> },
    { path: '/permissions', label: 'Consent Management',  icon: <Key size={18} /> },
  ],
  RESEARCHER: [
    { path: '/patients',    label: 'Research Cohorts',   icon: <Users size={18} /> },
    { path: '/permissions', label: 'Study Clearances',   icon: <Key size={18} /> },
  ],
  INSURANCE: [
    { path: '/patients',    label: 'Policy Claimants',           icon: <Users size={18} /> },
    { path: '/permissions', label: 'Verification Clearances',    icon: <Key size={18} /> },
  ],
};

const TAIL_ITEMS = [
  { path: '/profile', label: 'Security Settings', icon: <Settings size={18} /> },
];

// ─────────────────────────────────────────────────────────────────────────────

export const Sidebar = () => {
  const { role } = useAuth();

  const navItems = [
    ...BASE_ITEMS,
    ...(ROLE_NAV[role] || []),
    ...TAIL_ITEMS,
  ];

  return (
    <aside style={{
      width:           '260px',
      borderRight:     '1px solid var(--border-color)',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter:  'blur(16px)',
      display:         'flex',
      flexDirection:   'column',
      padding:         '24px 16px',
      gap:             '8px',
      minHeight:       'calc(100vh - 70px)',
    }}>
      {/* Label */}
      <div style={{
        fontSize:      '11px',
        fontWeight:    700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color:         'var(--text-subtle)',
        padding:       '0 12px 8px 12px',
      }}>
        Navigation Console
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display:         'flex',
              alignItems:      'center',
              gap:             '12px',
              padding:         '10px 14px',
              borderRadius:    'var(--radius-md)',
              fontSize:        '13.5px',
              fontWeight:      isActive ? 600 : 500,
              color:           isActive ? '#ffffff' : 'var(--text-muted)',
              backgroundColor: isActive ? 'rgba(6, 182, 212, 0.14)' : 'transparent',
              border:          isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
              textDecoration:  'none',
              transition:      'var(--transition)',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.style.backgroundColor.includes('0.14')) {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom security badge */}
      <div style={{
        marginTop:       'auto',
        padding:         '14px',
        borderRadius:    'var(--radius-md)',
        backgroundColor: 'rgba(6, 182, 212, 0.06)',
        border:          '1px solid rgba(6, 182, 212, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <FileLock2 size={16} color="var(--primary)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>Zero-Trust Engine</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-subtle)', lineHeight: 1.4 }}>
          AES-256-GCM hardware accelerated cipher with ECC key exchange.
        </p>
      </div>
    </aside>
  );
};
