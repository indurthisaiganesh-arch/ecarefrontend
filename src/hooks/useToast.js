/**
 * ─── useToast ────────────────────────────────────────────────────────────────
 * Hook to access the global toast notification system.
 * Must be used inside <ToastProvider>.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Patient created successfully');
 *   toast.error('Failed to load records');
 *   toast.info('Session will expire in 5 minutes');
 *   toast.warning('This action cannot be undone');
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
