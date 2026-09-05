/**
 * ─── CENTRALIZED API SERVICE ─────────────────────────────────────────────────
 * All HTTP calls in one place. Import the specific service object you need.
 *
 * Usage:
 *   import { patientService, emailService } from '../services/api';
 *
 * Services:
 *   authService        — login, OTP, register, logout
 *   patientService     — CRUD for patients
 *   medicalRecordService
 *   permissionService
 *   adminService       — stats, security events, audit logs
 *   userService        — profile, user management, toggle 2FA/status
 *   patientMediaService
 *   appointmentService
 *   staffService
 *   emailService       — send transactional emails (welcome, OTP, etc.)
 *   notificationService — in-app notification triggers
 *   healthService
 * ─────────────────────────────────────────────────────────────────────────────
 */

import axios from 'axios';

// ─── Axios Instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: ${API_URL}+'/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor: Attach JWT Bearer Token ────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecare_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 Unauthorized ──────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/verify-otp');
      if (!isAuthEndpoint) {
        localStorage.removeItem('ecare_access_token');
        localStorage.removeItem('ecare_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Error Normalizer ────────────────────────────────────────────────────────

/**
 * Extract a human-readable error message from an axios error.
 * @param {Error} err  Axios error object
 * @param {string} fallback  Default message if nothing found
 * @returns {string}
 */
export const getErrorMessage = (err, fallback = 'An unexpected error occurred.') =>
  err?.response?.data?.message || err?.message || fallback;

// ─────────────────────────────────────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const authService = {
  /** Initiate login with email + password. Returns { requiresOtp, tempOtp? } */
  login: (credentials) => api.post('/auth/login', credentials),

  /** Verify 6-digit OTP code sent to user's email */
  verifyOtp: (data) => api.post('/auth/verify-otp', data),

  /** Trigger OTP send for a given purpose: LOGIN | REGISTER | FORGOT_PASSWORD */
  sendOtp: (email, purpose = 'LOGIN') =>
    api.post(`/auth/send-otp?email=${encodeURIComponent(email)}&purpose=${purpose}`),

  /** Register a new account (self-registration — goes into approval queue) */
  register: (data) => api.post('/auth/register', data),

  /** Invalidate server-side session */
  logout: () => api.post('/auth/logout'),
};

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const patientService = {
  /** List patients with optional pagination/filter params */
  getAll: (params) => api.get('/patients', { params }),

  /** Get a single patient by ID */
  getById: (id) => api.get(`/patients/${id}`),

  /** Create a new patient record */
  create: (data) => api.post('/patients', data),

  /** Update an existing patient record */
  update: (id, data) => api.put(`/patients/${id}`, data),

  /** Soft-delete a patient record */
  delete: (id) => api.delete(`/patients/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// MEDICAL RECORD SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const medicalRecordService = {
  /** Get all medical records for a patient */
  getByPatient: (patientId) => api.get(`/medical-records/patient/${patientId}`),

  /** Get a single medical record by ID */
  getById: (id) => api.get(`/medical-records/${id}`),

  /** Create a new medical record */
  create: (data) => api.post('/medical-records', data),

  /** Delete a medical record */
  delete: (id) => api.delete(`/medical-records/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// PERMISSION SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const permissionService = {
  /** Grant access permission */
  grant: (data) => api.post('/permissions', data),

  /** Revoke an existing permission */
  revoke: (id) => api.put(`/permissions/${id}/revoke`),

  /** Get all permissions for a patient */
  getByPatient: (patientId) => api.get(`/permissions/patient/${patientId}`),

  /** Get all permissions (admin view) */
  getAll: () => api.get('/permissions'),
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const adminService = {
  /** Get system-wide statistics (admin dashboard) */
  getStats: () => api.get('/admin/stats'),

  /** Get security events with optional filters */
  getSecurityEvents: (params) => api.get('/admin/security-events', { params }),

  /** Get audit log entries with optional filters */
  getAuditLogs: (params) => api.get('/audit-logs', { params }),
};

// ─────────────────────────────────────────────────────────────────────────────
// USER SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const userService = {
  /** Get the authenticated user's profile */
  getProfile: () => api.get('/users/profile'),

  /** Update profile fields */
  updateProfile: (data) => api.put('/users/profile', data),

  /** Change password */
  changePassword: (data) => api.post('/users/change-password', data),

  /** List all system users (admin only) */
  getAllUsers: () => api.get('/users'),

  /** Enable or disable a user account */
  toggleStatus: (id, active) => api.put(`/users/${id}/status?active=${active}`),

  /** Enable or disable multi-factor authentication for a user */
  toggleMfa: (id, enabled) => api.put(`/users/${id}/2fa?enabled=${enabled}`),

  /** Delete a user account (admin only) */
  deleteUser: (id) => api.delete(`/users/${id}`),

  /** Reset a user's login failure counter and unlock account */
  unlockUser: (id) => api.put(`/users/${id}/unlock`),
};

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT MEDIA SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const patientMediaService = {
  /** Upload a media file for a patient */
  upload: (data) => api.post('/patient-media', data),

  /** Get all media items for a patient */
  getByPatient: (patientId) => api.get(`/patient-media/patient/${patientId}`),

  /** Get a single media item by ID */
  getById: (id) => api.get(`/patient-media/${id}`),

  /** Delete a media item */
  delete: (id) => api.delete(`/patient-media/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// APPOINTMENT SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const appointmentService = {
  /** Book a new appointment */
  create: (data) => api.post('/appointments', data),

  /** Get all appointments (filtered by role on the backend) */
  getAll: () => api.get('/appointments'),

  /** Update appointment status: SCHEDULED | COMPLETED | CANCELLED */
  updateStatus: (id, status) => api.put(`/appointments/${id}/status?status=${status}`),

  /** Cancel an appointment */
  cancel: (id) => api.put(`/appointments/${id}/status?status=CANCELLED`),

  /** Get appointments for a specific patient */
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// STAFF SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const staffService = {
  /** Appoint (create) a new staff member with clinical credentials */
  appointStaff: (data) => api.post('/staff/appoint', data),

  /** Get all hospital staff members */
  getHospitalStaff: () => api.get('/staff'),

  /** Get staff members by department */
  getByDepartment: (department) => api.get('/staff', { params: { department } }),
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SERVICE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Transactional email service.
 * All emails are sent via the backend /api/notifications/email endpoint.
 * The backend handles SMTP delivery (configure SMTP in application.properties).
 *
 * In development: backend logs the email content to console.
 * In production: configure SMTP credentials → real emails are delivered.
 */

export const emailService = {
  /**
   * Send a welcome email to a newly created staff user.
   * @param {string} recipientEmail
   * @param {string} recipientName   Full name of the new user
   * @param {string} role            The assigned system role
   * @param {string} [tempPassword]  Optional temporary password
   */
  sendWelcomeEmail: (recipientEmail, recipientName, role, tempPassword) =>
    api.post('/notifications/email', {
      type:      'WELCOME',
      to:        recipientEmail,
      subject:   'Welcome to E-Care Digital — Your Account is Ready',
      templateData: {
        name:        recipientName,
        role,
        loginUrl:    `${window.location.origin}/login`,
        tempPassword: tempPassword || null,
        supportEmail: 'support@ecare.digital',
      },
    }),

  /**
   * Notify a self-registered user that their account was approved.
   * @param {string} recipientEmail
   * @param {string} recipientName
   */
  sendApprovalEmail: (recipientEmail, recipientName) =>
    api.post('/notifications/email', {
      type:    'ACCOUNT_APPROVED',
      to:      recipientEmail,
      subject: 'Your E-Care Digital Account Has Been Approved',
      templateData: {
        name:     recipientName,
        loginUrl: `${window.location.origin}/login`,
      },
    }),

  /**
   * Notify a self-registered user that their account was rejected.
   * @param {string} recipientEmail
   * @param {string} recipientName
   * @param {string} [reason]  Optional rejection reason
   */
  sendRejectionEmail: (recipientEmail, recipientName, reason) =>
    api.post('/notifications/email', {
      type:    'ACCOUNT_REJECTED',
      to:      recipientEmail,
      subject: 'E-Care Digital — Account Registration Update',
      templateData: {
        name:         recipientName,
        reason:       reason || 'Your registration did not meet the current access requirements.',
        contactEmail: 'support@ecare.digital',
      },
    }),

  /**
   * Send appointment confirmation to a patient.
   * @param {string} recipientEmail
   * @param {string} recipientName
   * @param {Object} appointment  { date, time, doctorName, department, notes }
   */
  sendAppointmentConfirmation: (recipientEmail, recipientName, appointment) =>
    api.post('/notifications/email', {
      type:    'APPOINTMENT_CONFIRMED',
      to:      recipientEmail,
      subject: 'Appointment Confirmed — E-Care Digital',
      templateData: {
        patientName:  recipientName,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        doctorName:   appointment.doctorName,
        department:   appointment.department,
        notes:        appointment.notes || '',
        portalUrl:    `${window.location.origin}/appointments`,
      },
    }),

  /**
   * Send appointment cancellation notice.
   * @param {string} recipientEmail
   * @param {string} recipientName
   * @param {Object} appointment
   */
  sendAppointmentCancellation: (recipientEmail, recipientName, appointment) =>
    api.post('/notifications/email', {
      type:    'APPOINTMENT_CANCELLED',
      to:      recipientEmail,
      subject: 'Appointment Cancelled — E-Care Digital',
      templateData: {
        patientName:     recipientName,
        appointmentDate: appointment.date,
        doctorName:      appointment.doctorName,
        rebookUrl:       `${window.location.origin}/appointments`,
      },
    }),

  /**
   * Send an OTP code via email (backup when backend SMTP is configured).
   * @param {string} recipientEmail
   * @param {string} otpCode  The 6-digit OTP
   * @param {string} purpose  'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'
   */
  sendOtpEmail: (recipientEmail, otpCode, purpose = 'LOGIN') =>
    api.post('/notifications/email', {
      type:    'OTP_CODE',
      to:      recipientEmail,
      subject: 'Your E-Care Digital Verification Code',
      templateData: {
        otpCode,
        purpose,
        expiresInMinutes: 10,
      },
    }),

  /**
   * Send password reset link email.
   * @param {string} recipientEmail
   * @param {string} recipientName
   * @param {string} resetToken
   */
  sendPasswordResetEmail: (recipientEmail, recipientName, resetToken) =>
    api.post('/notifications/email', {
      type:    'PASSWORD_RESET',
      to:      recipientEmail,
      subject: 'Reset Your E-Care Digital Password',
      templateData: {
        name:     recipientName,
        resetUrl: `${window.location.origin}/reset-password?token=${resetToken}`,
        expiresInHours: 1,
      },
    }),

  /**
   * Send a generic alert/notice email (admin use).
   * @param {string} recipientEmail
   * @param {string} subject
   * @param {string} message
   */
  sendAdminNotice: (recipientEmail, subject, message) =>
    api.post('/notifications/email', {
      type:    'ADMIN_NOTICE',
      to:      recipientEmail,
      subject,
      templateData: { message },
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION SERVICE (in-app)
// ─────────────────────────────────────────────────────────────────────────────

export const notificationService = {
  /** Get unread notifications for the current user */
  getUnread: () => api.get('/notifications?read=false'),

  /** Mark a notification as read */
  markRead: (id) => api.put(`/notifications/${id}/read`),

  /** Mark all notifications as read */
  markAllRead: () => api.put('/notifications/read-all'),
};

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export const healthService = {
  /** Check backend health */
  check: () => api.get('/health'),
};

// ─────────────────────────────────────────────────────────────────────────────

export default api;
