/**
 * ─── ROLE CONSTANTS ──────────────────────────────────────────────────────────
 * Single source of truth for all user roles in the system.
 * Import from here — never hardcode role strings in components.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** All roles that exist in the system */
export const ROLES = [
  'PATIENT',
  'DOCTOR',
  'NURSE',
  'RESEARCHER',
  'INSURANCE',
  'RECEPTIONIST',
  'LAB_TECHNICIAN',
  'RADIOLOGIST',
  'HEAD_RECRUITER',
  'ADMIN',
];

/** Human-readable labels for each role */
export const ROLE_LABELS = {
  ADMIN:          'System Administrator',
  DOCTOR:         'Doctor / Physician',
  NURSE:          'Care Staff / Nurse',
  PATIENT:        'Patient Portal',
  RESEARCHER:     'Clinical Researcher',
  INSURANCE:      'Insurance Adjuster',
  HEAD_RECRUITER: 'Head Recruiter / HR',
  RECEPTIONIST:   'Frontdesk / Appointer',
  LAB_TECHNICIAN: 'Lab Diagnostics Specialist',
  RADIOLOGIST:    'Radiology / Imaging Specialist',
};

/** Badge CSS class per role (maps to index.css badge-* classes) */
export const ROLE_BADGE_CLASS = {
  ADMIN:          'badge-cyan',
  DOCTOR:         'badge-green',
  NURSE:          'badge-violet',
  PATIENT:        'badge-cyan',
  RESEARCHER:     'badge-amber',
  INSURANCE:      'badge-violet',
  HEAD_RECRUITER: 'badge-amber',
  RECEPTIONIST:   'badge-cyan',
  LAB_TECHNICIAN: 'badge-violet',
  RADIOLOGIST:    'badge-green',
};

/** Roles that can create staff accounts */
export const STAFF_CREATOR_ROLES = ['ADMIN', 'HEAD_RECRUITER'];

/** Roles with access to patient records */
export const CLINICAL_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RESEARCHER', 'INSURANCE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'HEAD_RECRUITER'];

/** Roles that can view admin panels */
export const ADMIN_ROLES = ['ADMIN'];

/** Roles that can view/manage appointments */
export const APPOINTMENT_ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT'];

/** Roles available for self-registration (public form) */
export const SELF_REGISTER_ROLES = ['RESEARCHER', 'INSURANCE'];

/** Roles available for staff-created accounts */
export const STAFF_CREATE_ROLES = ['PATIENT', 'DOCTOR', 'NURSE', 'RESEARCHER', 'INSURANCE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'HEAD_RECRUITER', 'ADMIN'];

/** Get display label for a role (fallback to role string) */
export const getRoleLabel = (role) => ROLE_LABELS[role] || role;

/** Get badge class for a role (fallback to badge-cyan) */
export const getRoleBadgeClass = (role) => ROLE_BADGE_CLASS[role] || 'badge-cyan';
