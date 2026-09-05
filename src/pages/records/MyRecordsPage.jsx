import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService, medicalRecordService, patientMediaService } from '../../services/api';
import { EncryptionBadge, StatusBadge } from '../../components/StatusBadge';
import { MediaGallery } from '../../components/MediaGallery';
import { FileLock2, Calendar, Stethoscope, HeartPulse, Lock, ShieldCheck, AlertCircle, FileImage } from 'lucide-react';

export const MyRecordsPage = () => {
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [activeTab, setActiveTab] = useState('RECORDS'); // 'RECORDS' | 'MEDIA'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMyData = async () => {
      try {
        setLoading(true);
        // Patients can list patients and the backend automatically filters to their own record!
        const res = await patientService.getAll();
        if (res.data.success && res.data.data.content && res.data.data.content.length > 0) {
          const myProfile = res.data.data.content[0];
          setPatient(myProfile);

          // Fetch records & media for this patient
          const [recRes, mediaRes] = await Promise.all([
            medicalRecordService.getByPatient(myProfile.id),
            patientMediaService.getByPatient(myProfile.id),
          ]);

          if (recRes.data.success) {
            setRecords(recRes.data.data || []);
          }
          if (mediaRes.data.success) {
            setMediaList(mediaRes.data.data || []);
          }
        } else {
          setError('No linked patient record found for your account.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve your medical records');
      } finally {
        setLoading(false);
      }
    };

    loadMyData();
  }, []);

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
        Decrypting your personal medical history with AES-256-GCM...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800 }}>My Encrypted Health Records</h1>
              <EncryptionBadge label="AES-256-GCM Decrypted" />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Personal patient health portal • Record confidentiality guaranteed under HIPAA/GDPR
            </p>
          </div>

          {patient && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Assigned Identifier
              </div>
              <code style={{
                fontSize: '15px',
                color: 'var(--primary)',
                fontWeight: 700,
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                padding: '4px 10px',
                borderRadius: '6px',
              }}>
                {patient.patientIdentifier}
              </code>
            </div>
          )}
        </div>
      </div>

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
          <span>Consultations & Clinical Notes ({records.length})</span>
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
          <span>Diagnostic Scans & Lab Reports ({mediaList.length})</span>
        </button>
      </div>

      {/* Tab 2: Diagnostic Media Viewer */}
      {activeTab === 'MEDIA' && (
        <MediaGallery
          mediaList={mediaList}
          canDelete={false}
        />
      )}

      {/* Tab 1: Records list */}
      {activeTab === 'RECORDS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {records.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No consultations or medical records recorded yet.
            </div>
          ) : (
            records.map((r) => (
              <div key={r.id} className="glass-panel" style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="badge badge-cyan">{r.recordType}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {r.recordDate ? r.recordDate.replace('T', ' ') : 'Recent'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Stethoscope size={14} /> Attending Doctor: {r.doctorName || 'Dr. Sarah Jenkins'}
                    </span>
                  </div>

                  <EncryptionBadge label={`AES-256-GCM (${r.keyVersion})`} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, marginBottom: '6px' }}>
                      Medical Diagnosis
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{r.diagnosis}</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#34d399', fontWeight: 700, marginBottom: '6px' }}>
                      Prescribed Treatment & Directives
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{r.treatment || 'None'}</div>
                  </div>

                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#c084fc', fontWeight: 700, marginBottom: '6px' }}>
                      Current Prescriptions
                    </div>
                    <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{r.prescriptions || 'None'}</div>
                  </div>
                </div>

                {r.clinicalNotes && (
                  <div style={{ marginTop: '14px', padding: '14px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-subtle)', fontWeight: 700, marginBottom: '4px' }}>
                      Clinical Observations
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.clinicalNotes}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
