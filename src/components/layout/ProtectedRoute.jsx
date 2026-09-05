/**
 * ─── ProtectedRoute (Layout) ──────────────────────────────────────────────────
 * Authentication guard + app shell wrapper.
 *
 * - Redirects to /login if user is not authenticated
 * - Redirects to /dashboard if authenticated but missing a required role
 * - Renders Navbar + Sidebar + main content area for authenticated users
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar }   from './Navbar';
import { Sidebar }  from './Sidebar';

/**
 * @param {{ allowedRoles?: string[] }} props
 */
export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  // ── Auth loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight:       '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: 'var(--bg-main)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width:        '44px',
            height:       '44px',
            border:       '3px solid rgba(6, 182, 212, 0.2)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation:    'spin 0.8s linear infinite',
            margin:       '0 auto 16px auto',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Authenticating Session...
          </div>
        </div>
      </div>
    );
  }

  // ── Not authenticated → redirect to login ─────────────────────────────────
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ── Wrong role → redirect to dashboard ───────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ── Authenticated — render app shell ─────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{
          flex:      1,
          padding:   '32px 36px',
          overflowY: 'auto',
          maxWidth:  '1600px',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
