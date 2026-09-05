import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  Users, 
  Search, 
  UserPlus, 
  Eye, 
  AlertCircle, 
  FileText, 
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  HeartPulse
} from 'lucide-react';

export const PatientListPage = () => {
  const { role } = useAuth();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal for creating a new patient
  const [showModal, setShowModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    contactPhone: '',
    contactEmail: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadPatients = async (query = '') => {
    try {
      setLoading(true);
      const res = await patientService.getAll({ search: query, size: 50 });
      if (res.data.success) {
        setPatients(res.data.data.content || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPatients(search);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const res = await patientService.create(createForm);
      if (res.data.success) {
        setShowModal(false);
        setCreateForm({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          gender: 'Male',
          bloodGroup: 'O+',
          contactPhone: '',
          contactEmail: '',
          address: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
        });
        loadPatients();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setModalLoading(false);
    }
  };

  const canCreate = ['ADMIN', 'DOCTOR', 'NURSE'].includes(role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Patient Registry</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Encrypted demographic directory with unique patient identifiers
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <UserPlus size={16} />
            <span>Register New Patient</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
          <input
            type="text"
            className="glass-input"
            style={{ paddingLeft: '42px' }}
            placeholder="Search by name, email, or PAT-identifier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {/* Error Alert */}
      {error && (
        <div style={{
          padding: '12px 14px',
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

      {/* Patients Table */}
      <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Full Name</th>
                <th>Date of Birth</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    Loading patient records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No patients found matching your search.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <code style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(6, 182, 212, 0.12)',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '12px',
                      }}>
                        {p.patientIdentifier}
                      </code>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.firstName} {p.lastName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.dateOfBirth}</td>
                    <td><span className="badge badge-cyan">{p.gender}</span></td>
                    <td><span className="badge badge-violet">{p.bloodGroup || 'Unknown'}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      <div>{p.contactPhone}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{p.contactEmail}</div>
                    </td>
                    <td>
                      <Link to={`/patients/${p.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        <Eye size={14} />
                        <span>View Records</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Patient */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Register New Patient Profile</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{
                padding: '10px 12px',
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

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>First Name</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Last Name</label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>DOB</label>
                  <input
                    type="date"
                    required
                    className="glass-input"
                    value={createForm.dateOfBirth}
                    onChange={(e) => setCreateForm({ ...createForm, dateOfBirth: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Gender</label>
                  <select
                    className="glass-input"
                    value={createForm.gender}
                    onChange={(e) => setCreateForm({ ...createForm, gender: e.target.value })}
                  >
                    <option value="Male" style={{ background: '#0f172a' }}>Male</option>
                    <option value="Female" style={{ background: '#0f172a' }}>Female</option>
                    <option value="Other" style={{ background: '#0f172a' }}>Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Blood Group</label>
                  <select
                    className="glass-input"
                    value={createForm.bloodGroup}
                    onChange={(e) => setCreateForm({ ...createForm, bloodGroup: e.target.value })}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg} style={{ background: '#0f172a' }}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Phone</label>
                  <input
                    type="tel"
                    className="glass-input"
                    placeholder="+1-555-0100"
                    value={createForm.contactPhone}
                    onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
                  <input
                    type="email"
                    className="glass-input"
                    placeholder="patient@example.com"
                    value={createForm.contactEmail}
                    onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Address</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="123 Health Ave, Boston, MA"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Emergency Contact Name</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Jane Doe (Spouse)"
                    value={createForm.emergencyContactName}
                    onChange={(e) => setCreateForm({ ...createForm, emergencyContactName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Emergency Contact Phone</label>
                  <input
                    type="tel"
                    className="glass-input"
                    placeholder="+1-555-0999"
                    value={createForm.emergencyContactPhone}
                    onChange={(e) => setCreateForm({ ...createForm, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={modalLoading}
                className="btn-primary"
                style={{ marginTop: '10px', height: '44px' }}
              >
                {modalLoading ? 'Encrypting & Saving...' : 'Save Patient Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
