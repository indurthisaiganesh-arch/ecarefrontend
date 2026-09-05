import React, { useState } from 'react';
import { patientMediaService } from '../services/api';
import { UploadCloud, X, Image, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export const UploadMediaModal = ({ patientId, isOpen, onClose, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState('SCAN_XRAY');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Check size limit: 10MB
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selected);
    setError('');

    // Generate local preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      if (!title) {
        // Auto-generate title from filename
        const cleanName = selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    };
    reader.readAsDataURL(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !previewUrl) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await patientMediaService.upload({
        patientId,
        title,
        description,
        mediaType,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        fileData: previewUrl,
      });

      if (res.data.success) {
        onUploadSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload diagnostic media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Upload Diagnostic Scan / Lab Media</h2>
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
          {/* File Picker / Drop Zone */}
          <div style={{
            border: '2px dashed var(--border-glow)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: 'rgba(6, 182, 212, 0.03)',
            position: 'relative',
            cursor: 'pointer',
          }}>
            <input
              type="file"
              accept="image/*,.pdf,.svg"
              required
              onChange={handleFileChange}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%',
              }}
            />
            {previewUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                {file?.type?.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
                  />
                ) : (
                  <FileText size={40} color="var(--primary)" />
                )}
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>{file.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>
                  {(file.size / 1024).toFixed(1)} KB • Click to choose a different file
                </div>
              </div>
            ) : (
              <div>
                <UploadCloud size={36} color="var(--primary)" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                  Click or drag scan / lab report file here
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  Supports DICOM exports, PNG, JPEG, SVG radiographs, and PDF diagnostic reports (up to 10MB)
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Diagnostic Category</label>
              <select
                className="glass-input"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
              >
                <option value="SCAN_XRAY" style={{ background: '#0f172a' }}>X-Ray Radiograph</option>
                <option value="SCAN_MRI" style={{ background: '#0f172a' }}>MRI Neuro / Spine Scan</option>
                <option value="SCAN_CT" style={{ background: '#0f172a' }}>CT Computed Tomography</option>
                <option value="SCAN_ULTRASOUND" style={{ background: '#0f172a' }}>Ultrasound Sonogram</option>
                <option value="LAB_REPORT" style={{ background: '#0f172a' }}>Biochemistry / Blood Lab Report</option>
                <option value="PATHOLOGY" style={{ background: '#0f172a' }}>Histopathology Slide Report</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Media Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chest X-Ray PA & Lateral View"
                className="glass-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Clinical Findings & Observations</label>
            <textarea
              rows={2}
              placeholder="Radiological observations, impression, lab measurements..."
              className="glass-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="btn-primary"
            style={{ height: '44px', marginTop: '6px' }}
          >
            {loading ? 'Processing & Computing Hash...' : 'Upload & Seal into Patient Records'}
          </button>
        </form>
      </div>
    </div>
  );
};
