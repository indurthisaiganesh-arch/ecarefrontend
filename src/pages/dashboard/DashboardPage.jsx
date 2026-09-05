import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { adminService, patientService, medicalRecordService, appointmentService, staffService } from '../../services/api';
import { RoleBadge, EncryptionBadge, StatusBadge } from '../../components/StatusBadge';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Lock, 
  Activity, 
  AlertTriangle, 
  Key, 
  ArrowUpRight, 
  CheckCircle2, 
  FileLock2,
  Clock,
  Sparkles,
  HeartPulse,
  Calendar,
  UserPlus,
  FileImage,
  UploadCloud,
  Stethoscope
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === 'ADMIN') {
          const statsRes = await adminService.getStats();
          if (statsRes.data.success) {
            setStats(statsRes.data.data);
          }
        }
        
        // Fetch patient list preview for clinical/staff roles
        if (['ADMIN', 'DOCTOR', 'NURSE', 'RESEARCHER', 'INSURANCE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'HEAD_RECRUITER'].includes(role)) {
          const patientsRes = await patientService.getAll({ size: 5 });
          if (patientsRes.data.success) {
            setRecentPatients(patientsRes.data.data.content || []);
          }
        }

        // Fetch appointments for receptionist, doctor, admin
        if (['RECEPTIONIST', 'DOCTOR', 'ADMIN'].includes(role)) {
          const apptRes = await appointmentService.getAll();
          if (apptRes.data.success) {
            setUpcomingAppointments((apptRes.data.data || []).slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner / Greeting */}
      <div className="glass-panel" style={{
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(6, 182, 212, 0.08) 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>
                Welcome back, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
              </h1>
              <RoleBadge role={role} />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Secure session established • Zero-trust end-to-end encryption enforced
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <EncryptionBadge label="AES-256-GCM Enabled" />
            <span className="badge badge-cyan">
              <Key size={11} />
              ECC secp256r1 Key Auth
            </span>
          </div>
        </div>
      </div>

      {/* ADMIN VIEW */}
      {role === 'ADMIN' && (
        <>
          {/* 4 Stat Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            {[
              { label: 'Registered System Users', value: stats?.totalUsers ?? '6', icon: <Users size={22} color="#22d3ee" />, link: '/admin/users' },
              { label: 'Protected Patient Records', value: stats?.totalPatients ?? '3', icon: <HeartPulse size={22} color="#34d399" />, link: '/patients' },
              { label: 'AES-256-GCM Records', value: stats?.totalMedicalRecords ?? '3', icon: <FileLock2 size={22} color="#c084fc" />, link: '/patients' },
              { label: 'Audit Trail Events', value: stats?.totalAuditLogs ?? '30+', icon: <Activity size={22} color="#fbbf24" />, link: '/admin/audit-logs' },
            ].map((stat, idx) => (
              <Link key={idx} to={stat.link} style={{ textDecoration: 'none' }}>
                <div className="glass-panel" style={{
                  padding: '22px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>
                      {stat.value}
                    </div>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {stat.icon}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Cryptographic Engine Status Table */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="var(--primary)" />
              Cryptographic Engine & Security Architecture
            </h2>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Security Layer</th>
                    <th>Cryptographic Standard</th>
                    <th>Implementation Detail</th>
                    <th>State</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Data at Rest</strong></td>
                    <td>AES-256-GCM</td>
                    <td>128-bit authentication tag, 96-bit unique IV per operation</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                  <tr>
                    <td><strong>Key Protection</strong></td>
                    <td>ECC (secp256r1)</td>
                    <td>NIST P-256 Elliptic Curve Diffie-Hellman via Bouncy Castle</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                  <tr>
                    <td><strong>Credential Hash</strong></td>
                    <td>BCrypt (cost factor 12)</td>
                    <td>Adaptive work factor salted hashing with brute-force resistance</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                  <tr>
                    <td><strong>Authentication</strong></td>
                    <td>Stateless JWT + OTP</td>
                    <td>HMAC-SHA256 bearer tokens with SHA-256 hashed 6-digit OTP</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                  <tr>
                    <td><strong>Anomaly Detection</strong></td>
                    <td>Heuristic Zero-Trust Model</td>
                    <td>Multi-vector scoring: role, time anomaly, resource sensitivity</td>
                    <td><StatusBadge status="ACTIVE" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* DOCTOR / NURSE VIEW */}
      {(role === 'DOCTOR' || role === 'NURSE') && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Active Patient Registry</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Patients registered under clinical care</p>
              </div>
              <Link to="/patients" className="btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}>
                View All Patients
              </Link>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Patient Identifier</th>
                    <th>Full Name</th>
                    <th>Blood Group</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((p) => (
                    <tr key={p.id}>
                      <td><code style={{ color: 'var(--primary)', fontWeight: 600 }}>{p.patientIdentifier}</code></td>
                      <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                      <td><span className="badge badge-violet">{p.bloodGroup || 'N/A'}</span></td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{p.contactPhone}</td>
                      <td>
                        <Link to={`/patients/${p.id}`} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                          Open Records
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={18} color="var(--primary)" />
              Clinical Capabilities
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {role === 'DOCTOR' ? (
                <>
                  <p style={{ marginBottom: '12px' }}>
                    As an authorized physician, you have full clearance to author new encrypted medical records, view complete clinical histories, and diagnose patients.
                  </p>
                  <Link to="/patients" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Access Patient & Record Consultations
                  </Link>
                </>
              ) : (
                <>
                  <p style={{ marginBottom: '12px' }}>
                    As nursing and care staff, you have clearance to review patient records, administer treatments, and inspect clinical notes.
                  </p>
                  <Link to="/patients" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Review Patient Registry
                  </Link>
                </>
              )}
            </div>

            <div style={{
              marginTop: 'auto',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <CheckCircle2 size={16} color="#34d399" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>HIPAA & GDPR Compliant</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                All reads and writes are recorded to an immutable audit trail with automatic anomaly assessment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PATIENT VIEW */}
      {role === 'PATIENT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HeartPulse size={20} color="var(--primary)" />
              My Health Records
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Your electronic health records are encrypted at rest with AES-256-GCM. Only you and your authorized care team can decrypt and view them.
            </p>
            <Link to="/my-records" className="btn-primary">
              <span>View Decrypted Records</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={20} color="#c084fc" />
              Consent & Privacy Management
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              You maintain total sovereign control over your medical data. Grant or revoke temporary access to clinical researchers or insurance adjusters at any time.
            </p>
            <Link to="/permissions" className="btn-secondary">
              <span>Manage Granted Consents</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* RESEARCHER VIEW */}
      {role === 'RESEARCHER' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#fbbf24" />
            Clinical Research Cohorts
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            All patient records accessed under the Researcher role are automatically de-identified and anonymized. Identifying clinical notes are redacted in compliance with health data privacy regulations.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/patients" className="btn-primary">
              Access Approved Cohort Data
            </Link>
            <Link to="/permissions" className="btn-secondary">
              View Active Consents
            </Link>
          </div>
        </div>
      )}

      {/* INSURANCE VIEW */}
      {role === 'INSURANCE' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#c084fc" />
            Insurance Claims Verification
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Verify patient coverage and medical claims data with explicit patient consent validation.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/patients" className="btn-primary">
              Verify Claimant Records
            </Link>
            <Link to="/permissions" className="btn-secondary">
              Inspect Consent Clearances
            </Link>
          </div>
        </div>
      )}

      {/* HEAD RECRUITER VIEW */}
      {role === 'HEAD_RECRUITER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <UserPlus size={22} color="#6366f1" />
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Staff Appointments Portal</h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Recruit, credential, and onboard hospital physicians, nurses, laboratory technicians, radiologists, and reception desk coordinators.
              </p>
              <Link to="/staff-recruitment" className="btn-primary" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderColor: '#6366f1' }}>
                <UserPlus size={16} />
                <span>Open Staff Recruitment Desk</span>
              </Link>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Users size={22} color="var(--primary)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Hospital Personnel Directory</h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Monitor active duty personnel across all clinical units including Cardiology, Radiology, and Inpatient Wards.
              </p>
              <Link to="/staff-recruitment" className="btn-secondary">
                <span>View Full Staff Directory</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* RECEPTIONIST VIEW */}
      {role === 'RECEPTIONIST' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Calendar size={22} color="#10b981" />
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Doctor Appointments Desk</h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Schedule patient consultations, assign attending physicians, manage clinic queues, and track appointment completion statuses.
              </p>
              <Link to="/appointments" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}>
                <Calendar size={16} />
                <span>Manage Doctor Appointments</span>
              </Link>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Users size={22} color="var(--primary)" />
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Patient Admissions & Intake</h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Register newly admitted patients, create medical profile identifiers, and link incoming patients with clinical specialists.
              </p>
              <Link to="/patients" className="btn-secondary">
                <span>Open Patient Admissions Registry</span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          {/* Recent Appointments Preview */}
          {upcomingAppointments.length > 0 && (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Upcoming Consultation Queue</h3>
                <Link to="/appointments" className="btn-secondary" style={{ fontSize: '12px', padding: '5px 12px' }}>
                  View All
                </Link>
              </div>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Attending Doctor</th>
                      <th>Department</th>
                      <th>Scheduled Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.patientName}</td>
                        <td style={{ color: 'var(--primary)' }}>{a.doctorName}</td>
                        <td>{a.department}</td>
                        <td style={{ fontSize: '12px' }}>{a.appointmentDate ? a.appointmentDate.replace('T', ' ') : 'N/A'}</td>
                        <td><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LAB TECHNICIAN VIEW */}
      {role === 'LAB_TECHNICIAN' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <UploadCloud size={22} color="#f59e0b" />
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Laboratory Diagnostics Uploader</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Upload biochemical assays, hematology blood panels, urine tests, and pathology results directly into the secure patient media vault.
            </p>
            <Link to="/patients" className="btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderColor: '#f59e0b' }}>
              <UploadCloud size={16} />
              <span>Select Patient to Upload Lab Report</span>
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <ShieldCheck size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Digital Integrity Guarantee</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              All uploaded diagnostic files are sealed with SHA-256 digital hashes to prevent tampering. Doctors and patients can inspect previews with 100% authenticity verification.
            </p>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '12px', color: '#fbbf24' }}>
              Ready to process diagnostic laboratory files.
            </div>
          </div>
        </div>
      )}

      {/* RADIOLOGIST VIEW */}
      {role === 'RADIOLOGIST' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <FileImage size={22} color="#8b5cf6" />
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Diagnostic Imaging Vault</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Upload Chest X-Rays, Neuro-MRIs, CT scans, and Ultrasound imaging into the protected diagnostic media repository.
            </p>
            <Link to="/patients" className="btn-primary" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', borderColor: '#8b5cf6' }}>
              <UploadCloud size={16} />
              <span>Select Patient to Upload Medical Scan</span>
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Activity size={22} color="#34d399" />
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>High-Resolution Web Lightbox</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Interactive medical media viewer enabled. Fullscreen zoom, pan, and SHA-256 integrity inspection built-in for attending physicians.
            </p>
            <Link to="/patients" className="btn-secondary">
              <span>Inspect Patient Records & Scans</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
