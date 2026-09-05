import React, { useState, useEffect } from 'react';
import { useAuth }            from '../../context/AuthContext';
import { emailService }       from '../../services/api';
import { useAppointments }    from '../../hooks/useAppointments';
import { useToast }           from '../../hooks/useToast';
import { Alert }              from '../../components/common/Alert';
import { PageHeader }         from '../../components/common/PageHeader';
import { TableSkeleton }      from '../../components/common/LoadingSkeleton';
import { StatusBadge }        from '../../components/StatusBadge';
import { BookAppointmentModal } from '../../components/BookAppointmentModal';
import { patientService }     from '../../services/api';
import {
  Calendar, Clock, User, Stethoscope, Building2, Plus,
  CheckCircle2, XCircle, Filter, AlertCircle, Search, RefreshCw,
} from 'lucide-react';

export const AppointmentsPage = () => {
  const { role, user } = useAuth();
  const toast = useToast();
  const { appointments, loading, error, reload, updateStatus, createAppointment } = useAppointments();

  const [statusFilter,      setStatusFilter]      = useState('ALL');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [showBookModal,     setShowBookModal]     = useState(false);
  const [patients,          setPatients]          = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('');

  const handleStatusUpdate = async (id, newStatus, appt) => {
    const result = await updateStatus(id, newStatus);
    if (result.success) {
      toast.success(`Appointment marked as ${newStatus.toLowerCase()}.`);
      // Send email notification for cancellation
      if (newStatus === 'CANCELLED' && appt?.patientEmail) {
        emailService.sendAppointmentCancellation(
          appt.patientEmail,
          appt.patientName || 'Patient',
          { date: appt.appointmentDate, doctorName: appt.doctorName }
        ).catch(() => {});
      }
    } else {
      toast.error(result.error || `Failed to update appointment status.`);
    }
  };

  const handleOpenBookModal = async () => {
    try {
      const res = await patientService.getAll();
      if (res.data.success && res.data.data.content) {
        setPatients(res.data.data.content);
        if (res.data.data.content.length > 0) {
          const first = res.data.data.content[0];
          setSelectedPatientId(first.id);
          setSelectedPatientName(`${first.firstName} ${first.lastName}`);
        }
      }
      setShowBookModal(true);
    } catch (err) {
      alert('Failed to load patient list for scheduling');
    }
  };

  const canBook = ['RECEPTIONIST', 'DOCTOR', 'ADMIN'].includes(role);
  const canComplete = ['DOCTOR', 'ADMIN'].includes(role);
  const canCancel = ['RECEPTIONIST', 'PATIENT', 'ADMIN'].includes(role);

  // Filter & Search
  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      (a.patientName && a.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.doctorName && a.doctorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.department && a.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.reason && a.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const scheduledCount = appointments.filter(a => a.status === 'SCHEDULED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter(a => a.status === 'CANCELLED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Doctor Appointments & Consultations</h1>
              <span className="badge badge-emerald">Hospital Care Desk</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Receptionist scheduling desk, doctor clinical sessions, and patient appointment tracking
            </p>
          </div>

          {canBook && (
            <button
              onClick={handleOpenBookModal}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}
            >
              <Plus size={16} />
              <span>Schedule New Appointment</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: 700, marginBottom: '6px' }}>
            Total Consultations
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)' }}>
            {appointments.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#10b981', fontWeight: 700, marginBottom: '6px' }}>
            Scheduled / Upcoming
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
            {scheduledCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px' }}>
            Completed Sessions
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>
            {completedCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#f87171', fontWeight: 700, marginBottom: '6px' }}>
            Cancelled
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f87171' }}>
            {cancelledCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by patient, attending doctor, department, or reason..."
            className="glass-input"
            style={{ width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={15} color="var(--text-muted)" />
          {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: 'none',
                border: '1px solid',
                borderColor: statusFilter === st ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: statusFilter === st ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: statusFilter === st ? '#ffffff' : 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Appointments List / Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(16, 185, 129, 0.2)',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px auto',
          }} />
          Retrieving appointment schedules from hospital database...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={44} style={{ margin: '0 auto 14px auto', opacity: 0.4 }} />
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            No appointments found
          </div>
          <p style={{ fontSize: '13px' }}>
            {appointments.length === 0 
              ? 'There are no active or past appointments registered in the system.' 
              : 'No appointments match the current filter or search criteria.'}
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Attending Doctor</th>
                  <th>Department</th>
                  <th>Schedule Date & Time</th>
                  <th>Clinical Reason</th>
                  <th>Appointed By</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{a.patientName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>ID: {a.patientId}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--primary)' }}>
                        <Stethoscope size={14} />
                        <span>{a.doctorName}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-muted)',
                      }}>
                        {a.department}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <Clock size={13} color="var(--primary)" />
                        <span>{a.appointmentDate ? a.appointmentDate.replace('T', ' ') : 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', maxWidth: '220px', lineHeight: 1.4 }}>
                        {a.reason}
                      </div>
                      {a.notes && (
                        <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '2px' }}>
                          Note: {a.notes}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {a.appointedByName}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {a.status === 'SCHEDULED' && (
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          {canComplete && (
                            <button
                              onClick={() => handleStatusUpdate(a.id, 'COMPLETED')}
                              className="btn-primary"
                              style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                height: 'auto',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderColor: '#10b981',
                              }}
                              title="Mark session as completed"
                            >
                              <CheckCircle2 size={13} />
                              <span>Complete</span>
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => handleStatusUpdate(a.id, 'CANCELLED')}
                              className="btn-danger"
                              style={{ padding: '4px 10px', fontSize: '11px', height: 'auto' }}
                              title="Cancel this appointment"
                            >
                              <XCircle size={13} />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      )}
                      {a.status !== 'SCHEDULED' && (
                        <span style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Select Patient
              </label>
              <select
                className="glass-input"
                value={selectedPatientId}
                onChange={(e) => {
                  const pid = e.target.value;
                  setSelectedPatientId(pid);
                  const p = patients.find(pt => pt.id === pid);
                  if (p) setSelectedPatientName(`${p.firstName} ${p.lastName}`);
                }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#0f172a' }}>
                    {p.firstName} {p.lastName} ({p.patientIdentifier})
                  </option>
                ))}
              </select>
            </div>

            {selectedPatientId && (
              <BookAppointmentModal
                patientId={selectedPatientId}
                patientName={selectedPatientName}
                onClose={() => setShowBookModal(false)}
                onAppointmentCreated={() => {
                  setShowBookModal(false);
                  loadAppointments();
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
