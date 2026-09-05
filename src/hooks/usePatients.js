/**
 * ─── usePatients ─────────────────────────────────────────────────────────────
 * Encapsulates all patient data fetching and mutations.
 * Pages import this hook and stay thin — no API calls in the page component.
 *
 * Usage:
 *   const { patients, loading, error, createPatient, updatePatient, deletePatient, reload } = usePatients();
 *   const { patient, loading, error } = usePatients({ patientId: '123' });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { patientService, getErrorMessage } from '../services/api';

/**
 * @param {Object} [options]
 * @param {string} [options.patientId]  If provided, fetches a single patient instead of the list
 * @param {Object} [options.params]     Query params for list (page, size, search, etc.)
 */
export const usePatients = (options = {}) => {
  const { patientId, params } = options;

  const [patients,  setPatients]  = useState([]);
  const [patient,   setPatient]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ── Fetch list ──────────────────────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await patientService.getAll(params);
      if (res.data.success) {
        const data = res.data.data;
        // Support both paginated { content, totalPages } and plain array responses
        if (data?.content) {
          setPatients(data.content);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else {
          setPatients(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load patients.'));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  // ── Fetch single ────────────────────────────────────────────────────────────
  const fetchOne = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError('');
    try {
      const res = await patientService.getById(patientId);
      if (res.data.success) setPatient(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load patient.'));
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) fetchOne();
    else           fetchList();
  }, [patientId, fetchList, fetchOne]);

  // ── Mutations ───────────────────────────────────────────────────────────────

  /**
   * Create a new patient. Returns { success, data, error }.
   * @param {Object} data
   */
  const createPatient = async (data) => {
    try {
      const res = await patientService.create(data);
      if (res.data.success) {
        await fetchList();
        return { success: true, data: res.data.data };
      }
      return { success: false, error: res.data.message || 'Failed to create patient.' };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to create patient.') };
    }
  };

  /**
   * Update an existing patient. Returns { success, error }.
   * @param {string} id
   * @param {Object} data
   */
  const updatePatient = async (id, data) => {
    try {
      const res = await patientService.update(id, data);
      if (res.data.success) {
        await (patientId ? fetchOne() : fetchList());
        return { success: true };
      }
      return { success: false, error: res.data.message || 'Failed to update patient.' };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to update patient.') };
    }
  };

  /**
   * Delete a patient. Returns { success, error }.
   * @param {string} id
   */
  const deletePatient = async (id) => {
    try {
      await patientService.delete(id);
      await fetchList();
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, 'Failed to delete patient.') };
    }
  };

  return {
    // List view
    patients,
    totalPages,
    totalElements,
    // Detail view
    patient,
    // Shared
    loading,
    error,
    reload: patientId ? fetchOne : fetchList,
    // Mutations
    createPatient,
    updatePatient,
    deletePatient,
  };
};
