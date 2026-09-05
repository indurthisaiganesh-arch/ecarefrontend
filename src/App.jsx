/**
 * ─── App.jsx ──────────────────────────────────────────────────────────────────
 * Root application component.
 * Providers: AuthProvider → ToastProvider → BrowserRouter → Routes
 *
 * Route structure:
 *  Public:     /login, /register
 *  Protected:  /dashboard, /patients, /appointments, /my-records, /permissions, /profile
 *  Staff:      /staff-recruitment, /admin/users  (ADMIN | HEAD_RECRUITER)
 *  Admin only: /admin/audit-logs, /admin/security-events
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }      from './context/AuthContext';
import { ToastProvider }     from './context/ToastContext';
import { ProtectedRoute }    from './components/layout/ProtectedRoute';

// ── Auth Pages ──────────────────────────────────────────────────────────────
import { LoginPage }    from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// ── Core Application Pages ──────────────────────────────────────────────────
import { DashboardPage }       from './pages/dashboard/DashboardPage';
import { PatientListPage }     from './pages/patients/PatientListPage';
import { PatientDetailPage }   from './pages/patients/PatientDetailPage';
import { MyRecordsPage }       from './pages/records/MyRecordsPage';
import { PermissionsPage }     from './pages/permissions/PermissionsPage';
import { ProfilePage }         from './pages/profile/ProfilePage';
import { AppointmentsPage }    from './pages/appointments/AppointmentsPage';

// ── Staff & Admin Pages ─────────────────────────────────────────────────────
import { StaffRecruitmentPage }  from './pages/staff/StaffRecruitmentPage';
import { UsersPage }             from './pages/admin/UsersPage';
import { AuditLogsPage }         from './pages/admin/AuditLogsPage';
import { SecurityEventsPage }    from './pages/admin/SecurityEventsPage';

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Public Auth Routes ───────────────────────────────────────── */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Protected: All Authenticated Users ──────────────────────── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/"            element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"   element={<DashboardPage />} />
              <Route path="/patients"    element={<PatientListPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/my-records"  element={<MyRecordsPage />} />
              <Route path="/permissions" element={<PermissionsPage />} />
              <Route path="/profile"     element={<ProfilePage />} />
            </Route>

            {/* ── Protected: Head Recruiter + Admin ────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HEAD_RECRUITER']} />}>
              <Route path="/staff-recruitment" element={<StaffRecruitmentPage />} />
              <Route path="/admin/users"        element={<UsersPage />} />
            </Route>

            {/* ── Protected: Admin Only ────────────────────────────────────── */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/audit-logs"      element={<AuditLogsPage />} />
              <Route path="/admin/security-events" element={<SecurityEventsPage />} />
            </Route>

            {/* ── Fallback ─────────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
