/**
 * ─── useAppointments ─────────────────────────────────────────────────────────
 * Encapsulates appointment data fetching and status mutations.
 *
 * Usage:
 *   const { appointments, loading, error, updateStatus, createAppointment, reload } = useAppointments();
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { appointmentService, getErrorMessage } from '../services/api';

/**
 * @param {Object} [options]
 * @param {string} [options.patientId]  If set, fetches only appointments for that patient
 */
export const useAppointments = (options = {}) => {
  const { patientId } = options;

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = patientId
        ? await appointmentService.getByPatient(patientId)
        : await appointmentService.getAll();
      if (res.data.success) {
        setAppointments(res.data.data || []);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load appointments.'));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  /**
   * Create a new appointment.
   * @param {Object} data
   * @returns {{ success: boolean, data?: Object, error?: string }}
   */
  const createAppointment = async (data) => {
    try {
      const res = await appointmentService.create(data);
      if (res.data.success) {
        await fetchAppointments();
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message || 'Failed to book appointment.' };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to book appointment.') };
    }
  };

  /**
   * Update appointment status.
   * @param {string} id
   * @param {'SCHEDULED'|'COMPLETED'|'CANCELLED'} status
   * @returns {{ success: boolean, error?: string }}
   */
  const updateStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      await fetchAppointments();
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, `Failed to mark appointment as ${status}.`) };
    }
  };

  /**
   * Cancel an appointment.
   * @param {string} id
   */
  const cancelAppointment = async (id) => updateStatus(id, 'CANCELLED');

  /**
   * Complete an appointment.
   * @param {string} id
   */
  const completeAppointment = async (id) => updateStatus(id, 'COMPLETED');

  return {
    appointments,
    loading,
    error,
    reload: fetchAppointments,
    createAppointment,
    updateStatus,
    cancelAppointment,
    completeAppointment,
  };
};
