import React, { useState } from 'react';
import { useAuth }       from '../../context/AuthContext';
import { emailService }  from '../../services/api';
import { useStaff }      from '../../hooks/useStaff';
import { useToast }      from '../../hooks/useToast';
import { Alert }         from '../../components/common/Alert';
import { PageHeader }    from '../../components/common/PageHeader';
import { Modal }         from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { RoleBadge }     from '../../components/StatusBadge';
import {
  UserPlus, Users, Stethoscope, Building2, ShieldCheck,
  Mail, Phone, Award, CheckCircle2, AlertCircle,
  Search, Filter, X, Lock, UserCheck, RefreshCw,
} from 'lucide-react';

const EMPTY_FORM = {
  fullName: '', email: '', password: '', role: 'DOCTOR',
  department: 'Cardiology', specialization: 'Interventional Cardiology',
  licenseNumber: 'MD-' + Math.floor(10000 + Math.random() * 90000),
  phoneNumber: '+1-555-0199',
};

export const StaffRecruitmentPage = () => {
  const { role } = useAuth();
  const toast    = useToast();
  const { staffList, loading, error, reload, appointStaff } = useStaff();

  const [roleFilter,       setRoleFilter]       = useState('ALL');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [showAppointModal, setShowAppointModal] = useState(false);
  const [modalLoading,     setModalLoading]     = useState(false);
  const [modalError,       setModalError]       = useState('');
  const [formData,         setFormData]         = useState(EMPTY_FORM);

  const handleRoleChange = (selectedRole) => {
    let dept = 'General Medicine';
    let spec = 'General Practice';
    if (selectedRole === 'DOCTOR') {
      dept = 'Cardiology';
      spec = 'Consultant Physician';
    } else if (selectedRole === 'NURSE') {
      dept = 'Inpatient Critical Care';
      spec = 'Registered Nurse (RN)';
    } else if (selectedRole === 'LAB_TECHNICIAN') {
      dept = 'Pathology & Diagnostic Laboratory';
      spec = 'Clinical Biochemist';
    } else if (selectedRole === 'RADIOLOGIST') {
      dept = 'Diagnostic Imaging & Radiology';
      spec = 'Diagnostic Radiologist';
    } else if (selectedRole === 'RECEPTIONIST') {
      dept = 'Patient Care & Admissions Desk';
      spec = 'Front Desk Coordinator';
    }
    setFormData(prev => ({
      ...prev,
      role: selectedRole,
      department: dept,
      specialization: spec,
    }));
  };

  const handleAppointSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    const result = await appointStaff(formData);
    if (result.success) {
      // Send welcome email (non-blocking — SMTP optional)
      emailService.sendWelcomeEmail(formData.email, formData.fullName, formData.role)
        .catch(() => {/* SMTP not yet configured */});

      toast.success(`${formData.fullName} appointed as ${formData.role} successfully!`);
      setFormData(EMPTY_FORM);
      setTimeout(() => setShowAppointModal(false), 300);
    } else {
      setModalError(result.error);
    }
    setModalLoading(false);
  };

  const canAppoint = ['HEAD_RECRUITER', 'ADMIN'].includes(role);

  // Statistics
  const doctorsCount = staffList.filter(s => s.role === 'DOCTOR').length;
  const nursesCount = staffList.filter(s => s.role === 'NURSE').length;
  const labTechsCount = staffList.filter(s => s.role === 'LAB_TECHNICIAN').length;
  const radiologistsCount = staffList.filter(s => s.role === 'RADIOLOGIST').length;
  const receptionistsCount = staffList.filter(s => s.role === 'RECEPTIONIST').length;

  // Filter & Search
  const filteredStaff = staffList.filter(s => {
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    const matchesSearch = searchQuery === '' ||
      (s.fullName && s.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.specialization && s.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.licenseNumber && s.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Hospital Staff Recruitment & Roster</h1>
              <span className="badge badge-indigo">HR Administration</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Head Recruiter portal: Appoint, credential, and manage medical personnel, radiologists, laboratory technicians, and reception staff
            </p>
          </div>

          {canAppoint && (
            <button
              onClick={() => setShowAppointModal(true)}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderColor: '#6366f1' }}
            >
              <UserPlus size={16} />
              <span>Appoint New Staff Member</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: 700, marginBottom: '4px' }}>
            Total Appointed Staff
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)' }}>
            {staffList.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, marginBottom: '4px' }}>
            Physicians / Doctors
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary)' }}>
            {doctorsCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#10b981', fontWeight: 700, marginBottom: '4px' }}>
            Registered Nurses
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
            {nursesCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700, marginBottom: '4px' }}>
            Lab Technicians
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b' }}>
            {labTechsCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8b5cf6', fontWeight: 700, marginBottom: '4px' }}>
            Radiologists
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#8b5cf6' }}>
            {radiologistsCount}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
            Front Desk Desk Staff
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8' }}>
            {receptionistsCount}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search staff by name, email, department, or specialization..."
            className="glass-input"
            style={{ width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={15} color="var(--text-muted)" />
          {['ALL', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'RECEPTIONIST'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                background: 'none',
                border: '1px solid',
                borderColor: roleFilter === r ? 'var(--primary)' : 'var(--border-subtle)',
                backgroundColor: roleFilter === r ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: roleFilter === r ? '#ffffff' : 'var(--text-muted)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
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

      {/* Roster Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px auto',
          }} />
          Loading hospital medical personnel roster...
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={44} style={{ margin: '0 auto 14px auto', opacity: 0.4 }} />
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
            No personnel found
          </div>
          <p style={{ fontSize: '13px' }}>
            No hospital staff records match your selected role filter or search query.
          </p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Hospital Role</th>
                  <th>Department & Unit</th>
                  <th>Clinical Specialization</th>
                  <th>License Number</th>
                  <th>Contact Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                        }}>
                          {s.fullName ? s.fullName.charAt(0) : 'S'}
                        </div>
                        <span>{s.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={s.role} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)' }}>
                        <Building2 size={13} color="var(--primary)" />
                        <span>{s.department || 'General Medicine'}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {s.specialization || 'Clinical Staff'}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', color: 'var(--primary)' }}>
                        {s.licenseNumber || 'LIC-VERIFIED'}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={11} /> {s.email}
                        </span>
                        {s.phoneNumber && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={11} /> {s.phoneNumber}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-emerald">
                        <UserCheck size={11} /> Active Duty
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appoint Staff Modal */}
      {showAppointModal && (
        <div className="modal-overlay" onClick={() => setShowAppointModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={22} color="#6366f1" />
                <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Appoint New Hospital Staff</h2>
              </div>
              <button
                onClick={() => setShowAppointModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '12px',
                marginBottom: '14px',
              }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleAppointSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Gregory House"
                    className="glass-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Hospital Role *
                  </label>
                  <select
                    className="glass-input"
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    <option value="DOCTOR" style={{ background: '#0f172a' }}>Physician / Doctor</option>
                    <option value="NURSE" style={{ background: '#0f172a' }}>Staff Nurse</option>
                    <option value="LAB_TECHNICIAN" style={{ background: '#0f172a' }}>Laboratory Technician</option>
                    <option value="RADIOLOGIST" style={{ background: '#0f172a' }}>Diagnostic Radiologist</option>
                    <option value="RECEPTIONIST" style={{ background: '#0f172a' }}>Receptionist / Admissions</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Hospital Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@ecare.com"
                    className="glass-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 8 chars, 1 uppercase, 1 special"
                    className="glass-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Department / Unit *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diagnostic Radiology"
                    className="glass-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Clinical Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MRI / CT Diagnostics"
                    className="glass-input"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Medical Board / License #
                  </label>
                  <input
                    type="text"
                    placeholder="MD-49321"
                    className="glass-input"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                    Direct Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+1-555-0199"
                    className="glass-input"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}>
                <ShieldCheck size={14} color="#6366f1" style={{ display: 'inline', marginRight: '6px' }} />
                Account credentials will be registered into the secure database with Argon2/BCrypt hashing. Permissions for role {formData.role} will be immediately active.
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="btn-primary"
                style={{
                  height: '44px',
                  marginTop: '6px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  borderColor: '#6366f1',
                }}
              >
                {modalLoading ? 'Creating Hospital Staff Account...' : 'Appoint & Activate Staff Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
