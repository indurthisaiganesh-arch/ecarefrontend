import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientService, medicalRecordService, permissionService, userService, patientMediaService } from '../../services/api';
import { RoleBadge, EncryptionBadge, StatusBadge } from '../../components/StatusBadge';
import { MediaGallery } from '../../components/MediaGallery';
import { UploadMediaModal } from '../../components/UploadMediaModal';
import { BookAppointmentModal } from '../../components/BookAppointmentModal';
import { 
  HeartPulse, 
  FileLock2, 
  Lock, 
  ShieldCheck, 
  Key, 
  Plus, 
  X, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Hash,
  Stethoscope,
  Pill,
  ClipboardList,
  History,
  UploadCloud,
  CalendarPlus,
  FileImage
} from 'lucide-react';

export const PatientDetailPage = () => {
  const { id } = useParams();
  const { role, user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('RECORDS'); // 'RECORDS' | 'MEDIA' | 'CONSENTS'

  // Modal: Add Medical Record (DOCTOR / ADMIN)
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordForm, setRecordForm] = useState({
    recordType: 'CONSULTATION',
    diagnosis: '',
    treatment: '',
    prescriptions: '',
    clinicalNotes: '',
    medicalHistory: '',
  });
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState('');

  // Modal: Upload Media (LAB_TECHNICIAN, RADIOLOGIST, DOCTOR, ADMIN)
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Modal: Book Appointment (RECEPTIONIST, DOCTOR, ADMIN)
  const [showAppointModal, setShowAppointModal] = useState(false);

  // Modal: Grant Consent / Permission
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [systemUsers, setSystemUsers] = useState([]);
  const [consentForm, setConsentForm] = useState({
    userId: '',
    resourceType: 'MEDICAL_RECORD',
    action: 'READ',
    expiresInHours: 72,
    reason: 'Clinical trial observational research',
  });
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentError, setConsentError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientRes, recordsRes, permissionsRes, mediaRes] = await Promise.all([
        patientService.getById(id),
        medicalRecordService.getByPatient(id),
        permissionService.getByPatient(id),
        patientMediaService.getByPatient(id),
      ]);

      if (patientRes.data.success) setPatient(patientRes.data.data);
      if (recordsRes.data.success) setRecords(recordsRes.data.data || []);
      if (permissionsRes.data.success) setPermissions(permissionsRes.data.data || []);
      if (mediaRes.data.success) setMediaList(mediaRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient records or unauthorized access');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setRecordError('');
    setRecordLoading(true);

    try {
      const res = await medicalRecordService.create({
        patientId: id,
        ...recordForm,
      });

      if (res.data.success) {
        setShowRecordModal(false);
        setRecordForm({
          recordType: 'CONSULTATION',
          diagnosis: '',
          treatment: '',
          prescriptions: '',
          clinicalNotes: '',
          medicalHistory: '',
        });
        loadData();
      }
    } catch (err) {
      setRecordError(err.response?.data?.message || 'Failed to save encrypted record');
    } finally {
      setRecordLoading(false);
    }
  };

  const openConsentModal = async () => {
    setShowConsentModal(true);
    setConsentError('');
    try {
      const res = await userService.getAllUsers();
      if (res.data.success) {
        // Filter researchers and insurance agents
        const filtered = (res.data.data || []).filter(u => ['RESEARCHER', 'INSURANCE', 'DOCTOR'].includes(u.role));
        setSystemUsers(filtered);
        if (filtered.length > 0) {
          setConsentForm(prev => ({ ...prev, userId: filtered[0].id }));
        }
      }
    } catch (e) {
      console.warn('Could not load user list for consent assignment');
    }
  };

  const handleGrantConsent = async (e) => {
    e.preventDefault();
    setConsentError('');
    setConsentLoading(true);

    try {
      const res = await permissionService.grant({
        patientId: id,
        ...consentForm,
      });

      if (res.data.success) {
        setShowConsentModal(false);
        loadData();
      }
    } catch (err) {
      setConsentError(err.response?.data?.message || 'Failed to grant consent clearance');
    } finally {
      setConsentLoading(false);
    }
  };

  const handleRevokeConsent = async (permissionId) => {
    if (!window.confirm('Are you sure you want to revoke this access clearance?')) return;
    try {
      await permissionService.revoke(permissionId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to revoke clearance');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(6, 182, 212, 0.2)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px auto',
        }} />
        Decrypting Patient Records from Database with AES-256-GCM...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <AlertCircle size={40} color="#ef4444" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Access Prohibited or Record Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>{error || 'Patient not found'}</p>
        <Link to="/patients" className="btn-secondary">Return to Registry</Link>
      </div>
    );
  }

  const canAddRecord = ['DOCTOR', 'ADMIN'].includes(role);
  const canManageConsent = ['PATIENT', 'ADMIN', 'DOCTOR'].includes(role);
  const canUploadMedia = ['LAB_TECHNICIAN', 'RADIOLOGIST', 'DOCTOR', 'ADMIN'].includes(role);
  const canAppointDoctor = ['RECEPTIONIST', 'DOCTOR', 'ADMIN'].includes(role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Patient Header Card */}
      <div className="glass-panel" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>
                {patient.firstName} {patient.lastName}
              </h1>
              <code style={{
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '13px',
              }}>
                {patient.patientIdentifier}
              </code>
              <span className="badge badge-violet">{patient.bloodGroup || 'O+'}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> Born: {patient.dateOfBirth} ({patient.gender})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={14} /> {patient.contactPhone}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> {patient.contactEmail}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> {patient.address}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {canAppointDoctor && (
              <button
                onClick={() => setShowAppointModal(true)}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}
              >
                <CalendarPlus size={16} />
                <span>Appoint Doctor</span>
              </button>
            )}

            {canUploadMedia && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderColor: '#8b5cf6' }}
              >
                <UploadCloud size={16} />
                <span>Upload Scan / Lab Report</span>
              </button>
            )}

            {canAddRecord && (
              <button
                onClick={() => setShowRecordModal(true)}
                className="btn-primary"
              >
                <Plus size={16} />
                <span>New Encrypted Record</span>
              </button>
            )}

            {canManageConsent && (
              <button
                onClick={openConsentModal}
                className="btn-secondary"
              >
                <Key size={16} />
                <span>Grant Access Consent</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('RECORDS')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            color: activeTab === 'RECORDS' ? '#ffffff' : 'var(--text-muted)',
            backgroundColor: activeTab === 'RECORDS' ? 'rgba(6, 182, 212, 0.14)' : 'transparent',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileLock2 size={16} color={activeTab === 'RECORDS' ? 'var(--primary)' : 'currentColor'} />
          <span>Decrypted Medical Records ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MEDIA')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            color: activeTab === 'MEDIA' ? '#ffffff' : 'var(--text-muted)',
            backgroundColor: activeTab === 'MEDIA' ? 'rgba(139, 92, 246, 0.14)' : 'transparent',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileImage size={16} color={activeTab === 'MEDIA' ? 'var(--secondary)' : 'currentColor'} />
          <span>Medical Scans & Lab Media ({mediaList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CONSENTS')}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            color: activeTab === 'CONSENTS' ? '#ffffff' : 'var(--text-muted)',
            backgroundColor: activeTab === 'CONSENTS' ? 'rgba(16, 185, 129, 0.14)' : 'transparent',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Key size={16} color={activeTab === 'CONSENTS' ? '#10b981' : 'currentColor'} />
          <span>Access Clearances & Consents ({permissions.length})</span>
        </button>
      </div>

      {/* Tab 2: Medical Media Scans & Lab Reports */}
      {activeTab === 'MEDIA' && (
        <MediaGallery
          mediaList={mediaList}
          onMediaDeleted={loadData}
          canDelete={['DOCTOR', 'ADMIN'].includes(role)}
        />
      )}

      {/* Tab 1: Medical Records */}
      {activeTab === 'RECORDS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {records.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No medical records registered for this patient yet.
            </div>
          ) : (
            records.map((r) => (
              <div key={r.id} className="glass-panel" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-cyan">{r.recordType}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {r.recordDate ? r.recordDate.replace('T', ' ') : 'Recent'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Stethoscope size={14} /> Attending: {r.doctorName || 'Dr. Sarah Jenkins'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EncryptionBadge label={`AES-256-GCM (${r.keyVersion})`} />
                    <span style={{ fontSize: '11px', color: 'var(--text-subtle)', fontFamily: 'monospace' }} title="Tamper-evident record hash">
                      # {r.recordHash ? r.recordHash.substring(0, 12) : 'HASH'}...
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
                      Diagnosis
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{r.diagnosis || 'None specified'}</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#34d399', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
                      Treatment & Plan
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{r.treatment || 'None specified'}</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#c084fc', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>
                      Prescriptions
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{r.prescriptions || 'None'}</div>
                  </div>
                </div>

                {r.clinicalNotes && (
                  <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: 700, marginBottom: '4px' }}>
                      Clinical Notes (Physician Confidential)
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.clinicalNotes}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Access Consents & Clearances */}
      {activeTab === 'CONSENTS' && (
        <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Authorized Party</th>
                  <th>Role</th>
                  <th>Resource Scope</th>
                  <th>Action</th>
                  <th>Expires</th>
                  <th>Purpose / Reason</th>
                  <th>Status</th>
                  <th>Revocation</th>
                </tr>
              </thead>
              <tbody>
                {permissions.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No third-party permissions or research consents have been granted for this patient.
                    </td>
                  </tr>
                ) : (
                  permissions.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.userName}</td>
                      <td><RoleBadge role={p.userRole} /></td>
                      <td><code>{p.resourceType}</code></td>
                      <td><span className="badge badge-cyan">{p.action}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {p.expiresAt ? p.expiresAt.replace('T', ' ') : 'Indefinite'}
                      </td>
                      <td style={{ fontSize: '13px', maxWidth: '200px' }}>{p.reason}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>
                        {p.status === 'ACTIVE' && canManageConsent && (
                          <button
                            onClick={() => handleRevokeConsent(p.id)}
                            className="btn-danger"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Encrypted Record */}
      {showRecordModal && (
        <div className="modal-overlay" onClick={() => setShowRecordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={20} color="var(--primary)" />
                <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Create Encrypted Medical Record</h2>
              </div>
              <button onClick={() => setShowRecordModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {recordError && (
              <div style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '12px',
                marginBottom: '14px',
              }}>
                {recordError}
              </div>
            )}

            <form onSubmit={handleCreateRecord} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Record Consultation Type</label>
                <select
                  className="glass-input"
                  value={recordForm.recordType}
                  onChange={(e) => setRecordForm({ ...recordForm, recordType: e.target.value })}
                >
                  <option value="CONSULTATION" style={{ background: '#0f172a' }}>Consultation & Physical Exam</option>
                  <option value="LAB_RESULT" style={{ background: '#0f172a' }}>Laboratory & Diagnostic Report</option>
                  <option value="ANNUAL_CHECKUP" style={{ background: '#0f172a' }}>Annual Wellness Examination</option>
                  <option value="SURGERY" style={{ background: '#0f172a' }}>Surgical Procedure Record</option>
                  <option value="PRESCRIPTION" style={{ background: '#0f172a' }}>Pharmacological Prescription</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Diagnosis (AES-256-GCM Encrypted) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                  className="glass-input"
                  value={recordForm.diagnosis}
                  onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Treatment Plan</label>
                <textarea
                  rows={2}
                  placeholder="Clinical treatment steps and patient directives..."
                  className="glass-input"
                  value={recordForm.treatment}
                  onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Prescriptions</label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg TID for 7 days"
                  className="glass-input"
                  value={recordForm.prescriptions}
                  onChange={(e) => setRecordForm({ ...recordForm, prescriptions: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Physician Clinical Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detailed confidential clinical observations and notes..."
                  className="glass-input"
                  value={recordForm.clinicalNotes}
                  onChange={(e) => setRecordForm({ ...recordForm, clinicalNotes: e.target.value })}
                />
              </div>

              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}>
                All fields are encrypted on the backend with AES-256-GCM before writing to MySQL. An immutable audit record with SHA-256 integrity hash is automatically sealed.
              </div>

              <button
                type="submit"
                disabled={recordLoading}
                className="btn-primary"
                style={{ height: '44px' }}
              >
                {recordLoading ? 'Encrypting with AES-256-GCM...' : 'Encrypt & Save Medical Record'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Grant Access Consent */}
      {showConsentModal && (
        <div className="modal-overlay" onClick={() => setShowConsentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={20} color="var(--secondary)" />
                <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Grant Medical Access Consent</h2>
              </div>
              <button onClick={() => setShowConsentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {consentError && (
              <div style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '12px',
                marginBottom: '14px',
              }}>
                {consentError}
              </div>
            )}

            <form onSubmit={handleGrantConsent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Authorized Professional</label>
                <select
                  className="glass-input"
                  value={consentForm.userId}
                  onChange={(e) => setConsentForm({ ...consentForm, userId: e.target.value })}
                >
                  {systemUsers.map(u => (
                    <option key={u.id} value={u.id} style={{ background: '#0f172a' }}>
                      {u.fullName} ({u.role} - {u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Action Permitted</label>
                  <select
                    className="glass-input"
                    value={consentForm.action}
                    onChange={(e) => setConsentForm({ ...consentForm, action: e.target.value })}
                  >
                    <option value="READ" style={{ background: '#0f172a' }}>READ (Decrypted View)</option>
                    <option value="EXPORT" style={{ background: '#0f172a' }}>EXPORT (Anonymized Data)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Clearance Expiry</label>
                  <select
                    className="glass-input"
                    value={consentForm.expiresInHours}
                    onChange={(e) => setConsentForm({ ...consentForm, expiresInHours: parseInt(e.target.value) })}
                  >
                    <option value={24} style={{ background: '#0f172a' }}>24 Hours</option>
                    <option value={72} style={{ background: '#0f172a' }}>3 Days (72 Hours)</option>
                    <option value={168} style={{ background: '#0f172a' }}>7 Days (1 Week)</option>
                    <option value={720} style={{ background: '#0f172a' }}>30 Days (1 Month)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Purpose / Reason for Access</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Clinical cardiology observational trial"
                  className="glass-input"
                  value={consentForm.reason}
                  onChange={(e) => setConsentForm({ ...consentForm, reason: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={consentLoading}
                className="btn-primary"
                style={{ height: '44px', marginTop: '8px' }}
              >
                {consentLoading ? 'Sealing Consent Certificate...' : 'Grant Temporary Access'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Diagnostic Scan & Lab Media */}
      <UploadMediaModal
        isOpen={showUploadModal}
        patientId={id}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={loadData}
      />

      {/* Modal: Appoint Doctor */}
      <BookAppointmentModal
        isOpen={showAppointModal}
        preselectedPatientId={id}
        onClose={() => setShowAppointModal(false)}
        onAppointmentBooked={loadData}
      />
    </div>
  );
};
