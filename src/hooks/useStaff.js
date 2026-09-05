/**
 * ─── useStaff ────────────────────────────────────────────────────────────────
 * Encapsulates hospital staff data and recruitment mutations.
 *
 * Usage:
 *   const { staffList, loading, error, appointStaff, reload } = useStaff();
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { staffService, getErrorMessage } from '../services/api';

export const useStaff = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await staffService.getHospitalStaff();
      if (res.data.success) setStaffList(res.data.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load staff list.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  /**
   * Appoint (recruit) a new staff member.
   * @param {Object} formData  { fullName, email, password, role, department, specialization, licenseNumber, phoneNumber }
   * @returns {{ success: boolean, data?: Object, error?: string }}
   */
  const appointStaff = async (formData) => {
    try {
      const res = await staffService.appointStaff(formData);
      if (res.data.success) {
        await fetchStaff();
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message || 'Failed to appoint staff member.' };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to appoint staff. Email may already exist.') };
    }
  };

  return {
    staffList,
    loading,
    error,
    reload: fetchStaff,
    appointStaff,
  };
};
