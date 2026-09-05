/**
 * ─── useUsers ────────────────────────────────────────────────────────────────
 * Encapsulates admin user management: listing, status toggling, MFA toggling.
 *
 * Usage:
 *   const { users, loading, error, toggleStatus, toggleMfa, createUser, reload } = useUsers();
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { userService, authService, getErrorMessage } from '../services/api';

export const useUsers = () => {
  const [users,      setUsers]     = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState('');
  const [mfaLoading, setMfaLoading] = useState({}); // { [userId]: boolean }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userService.getAllUsers();
      if (res.data.success) setUsers(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load user list.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /**
   * Toggle a user's active status.
   * @param {string} userId
   * @param {boolean} currentActive
   * @returns {{ success: boolean, error?: string }}
   */
  const toggleStatus = async (userId, currentActive) => {
    try {
      await userService.toggleStatus(userId, !currentActive);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to update user status.') };
    }
  };

  /**
   * Toggle a user's MFA setting (optimistic update for snappier UI).
   * @param {string} userId
   * @param {boolean} currentMfa
   * @returns {{ success: boolean, error?: string }}
   */
  const toggleMfa = async (userId, currentMfa) => {
    setMfaLoading((p) => ({ ...p, [userId]: true }));
    try {
      await userService.toggleMfa(userId, !currentMfa);
      // Optimistic update — flip the flag locally
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, mfaEnabled: !currentMfa } : u)
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to update 2FA setting.') };
    } finally {
      setMfaLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  /**
   * Create a new user account (staff-created, bypasses approval queue).
   * @param {Object} formData
   * @returns {{ success: boolean, data?: Object, error?: string }}
   */
  const createUser = async (formData) => {
    try {
      const res = await authService.register(formData);
      if (res.data.success) {
        await fetchUsers();
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to create account. Email/username may already exist.') };
    }
  };

  /**
   * Activate a user account (approve pending registration).
   * @param {string} userId
   */
  const activateUser = async (userId) => {
    try {
      await userService.toggleStatus(userId, true);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to activate user.') };
    }
  };

  /**
   * Deactivate a user account (reject / suspend).
   * @param {string} userId
   */
  const deactivateUser = async (userId) => {
    try {
      await userService.toggleStatus(userId, false);
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to deactivate user.') };
    }
  };

  return {
    users,
    loading,
    error,
    mfaLoading,
    reload: fetchUsers,
    toggleStatus,
    toggleMfa,
    createUser,
    activateUser,
    deactivateUser,
  };
};
