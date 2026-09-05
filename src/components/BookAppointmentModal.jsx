import React, { useState, useEffect } from 'react';
import { appointmentService, patientService, staffService } from '../services/api';
import { Calendar, X, Clock, Stethoscope, User, AlertCircle } from 'lucide-react';

export const BookAppointmentModal = ({ isOpen, onClose, onAppointmentBooked, preselectedPatientId = null }) => {
  const [patientId, setPatientId] = useState(preselectedPatientId || '');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [department, setDepartment] = useState('General Internal Medicine');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      try {
        if (!preselectedPatientId) {
          const pRes = await patientService.getAll({ size: 50 });
          if (pRes.data.success) {
            setPatients(pRes.data.data.content || []);
            if (pRes.data.data.content?.length > 0) {
              setPatientId(pRes.data.data.content[0].id);
            }
          }
        }

        const staffRes = await staffService.getHospitalStaff();
        if (staffRes.data.success) {
          const docList = (staffRes.data.data || []).filter(u => u.role === 'DOCTOR');
          setDoctors(docList);
          if (docList.length > 0) {
            setDoctorId(docList[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load doctor/patient options for appointment', err);
      }
    };

    loadOptions();

    // Default appointment date: tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setAppointmentDate(tomorrow.toISOString().slice(0, 16));
  }, [isOpen, preselectedPatientId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId || !doctorId || !appointmentDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await appointmentService.create({
        patientId,
        doctorId,
        appointmentDate,
        department,
        reason,
        notes,
      });

      if (res.data.success) {
        onAppointmentBooked();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Appoint Doctor / Schedule Visit</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '12px',
            marginBottom: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!preselectedPatientId && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Select Patient</label>
              <select
                className="glass-input"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id} style={{ background: '#0f172a' }}>
                    {p.firstName} {p.lastName} ({p.patientIdentifier})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Attending Physician</label>
              <select
                className="glass-input"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id} style={{ background: '#0f172a' }}>
                    {d.fullName || d.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Hospital Department</label>
              <select
                className="glass-input"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="General Internal Medicine" style={{ background: '#0f172a' }}>General Internal Medicine</option>
                <option value="Cardiology" style={{ background: '#0f172a' }}>Cardiology</option>
                <option value="Radiology & Imaging" style={{ background: '#0f172a' }}>Radiology & Imaging</option>
                <option value="Endocrinology" style={{ background: '#0f172a' }}>Endocrinology</option>
                <option value="Neurology" style={{ background: '#0f172a' }}>Neurology</option>
                <option value="Pediatrics" style={{ background: '#0f172a' }}>Pediatrics</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Date & Time</label>
            <input
              type="datetime-local"
              required
              className="glass-input"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Reason for Consultation *</label>
            <input
              type="text"
              required
              placeholder="e.g. Follow-up consultation for hypertension management"
              className="glass-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Frontdesk / Reception Notes</label>
            <textarea
              rows={2}
              placeholder="Insurance pre-verification, patient special requests..."
              className="glass-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ height: '44px', marginTop: '6px' }}
          >
            {loading ? 'Booking & Assigning Doctor...' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};
