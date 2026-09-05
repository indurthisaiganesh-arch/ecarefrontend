/**
 * ─── Navbar (Layout) ──────────────────────────────────────────────────────────
 * Top navigation bar — sticky header with brand, role badge, user profile, logout.
 * Part of the app shell (rendered by ProtectedRoute for all authenticated pages).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../StatusBadge';
import { ShieldCheck, LogOut, User } from 'lucide-react';
import { getInitials } from '../../utils/formatters';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email;

  return (
    <header style={{
      height:          '70px',
      borderBottom:    '1px solid var(--border-color)',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter:  'blur(16px)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      padding:         '0 28px',
      position:        'sticky',
      top:             0,
      zIndex:          100,
    }}>
      {/* ── Brand ─────────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width:          '40px',
          height:         '40px',
          borderRadius:   '10px',
          background:     'var(--primary-gradient)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          boxShadow:      '0 0 16px var(--primary-glow)',
        }}>
          <ShieldCheck size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily:             'var(--font-heading)',
              fontWeight:             800,
              fontSize:               '18px',
              letterSpacing:          '-0.02em',
              background:             'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip:   'text',
              WebkitTextFillColor:    'transparent',
            }}>
              E-CARE DIGITAL
            </span>
            <span style={{
              fontSize:         '11px',
              padding:          '2px 6px',
              borderRadius:     '4px',
              backgroundColor:  'rgba(6, 182, 212, 0.15)',
              color:            'var(--primary)',
              fontWeight:       600,
              border:           '1px solid rgba(6, 182, 212, 0.3)',
            }}>
              PROT-V1
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span>AES-256-GCM Cryptographic Shield Active</span>
          </div>
        </div>
      </div>

      {/* ── Right Controls ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Role Badge */}
        {role && <RoleBadge role={role} />}

        {/* User Profile Pill */}
        <Link
          to="/profile"
          title="View profile"
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '10px',
            padding:         '6px 12px',
            borderRadius:    'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border:          '1px solid var(--border-color)',
            color:           'var(--text-main)',
            textDecoration:  'none',
            transition:      'var(--transition)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
        >
          {/* Avatar initials */}
          <div style={{
            width:          '28px',
            height:         '28px',
            borderRadius:   '50%',
            background:     'rgba(6, 182, 212, 0.2)',
            border:         '1px solid rgba(6, 182, 212, 0.3)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '11px',
            fontWeight:     700,
            color:          'var(--primary)',
          }}>
            {displayName ? getInitials(displayName) : <User size={14} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>
              {displayName || 'User'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {user?.email}
            </span>
          </div>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          aria-label="Sign out"
          style={{
            background:     'none',
            border:         'none',
            color:          'var(--text-muted)',
            cursor:         'pointer',
            padding:        '8px',
            borderRadius:   '8px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            transition:     'var(--transition)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
