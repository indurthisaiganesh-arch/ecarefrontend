/**
 * ─── useAuditLogs ────────────────────────────────────────────────────────────
 * Encapsulates audit log and security event data fetching.
 *
 * Usage:
 *   const { logs, loading, error, reload } = useAuditLogs({ page: 0, size: 20 });
 *   const { events, loading, error } = useSecurityEvents({ severity: 'HIGH' });
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { adminService, getErrorMessage } from '../services/api';

/**
 * Hook for audit log entries.
 * @param {Object} [params]  Query params: { page, size, action, userId, startDate, endDate }
 */
export const useAuditLogs = (params = {}) => {
  const [logs,          setLogs]          = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getAuditLogs(params);
      if (res.data.success) {
        const data = res.data.data;
        if (data?.content) {
          setLogs(data.content);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else {
          setLogs(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load audit logs.'));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return { logs, loading, error, totalPages, totalElements, reload: fetchLogs };
};

/**
 * Hook for security event entries.
 * @param {Object} [params]  Query params: { page, size, severity, type }
 */
export const useSecurityEvents = (params = {}) => {
  const [events,        setEvents]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getSecurityEvents(params);
      if (res.data.success) {
        const data = res.data.data;
        if (data?.content) {
          setEvents(data.content);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else {
          setEvents(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load security events.'));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  return { events, loading, error, totalPages, totalElements, reload: fetchEvents };
};
