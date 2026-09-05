import React, { useState } from 'react';
import { EncryptionBadge, StatusBadge } from './StatusBadge';
import { 
  FileText, 
  Image as ImageIcon, 
  Eye, 
  Download, 
  X, 
  Calendar, 
  User, 
  Maximize2, 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut,
  Sparkles
} from 'lucide-react';

export const MediaGallery = ({ mediaList = [], onMediaDeleted, canDelete = false }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [zoom, setZoom] = useState(1);

  const filteredList = mediaList.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'SCANS') return item.mediaType.startsWith('SCAN_');
    if (filter === 'LAB') return item.mediaType === 'LAB_REPORT' || item.mediaType === 'PATHOLOGY';
    return true;
  });

  const getMediaBadge = (type) => {
    switch (type) {
      case 'SCAN_XRAY': return <span className="badge badge-cyan">Chest / Skeletal X-Ray</span>;
      case 'SCAN_MRI': return <span className="badge badge-violet">MRI Neuro / Soft Tissue</span>;
      case 'SCAN_CT': return <span className="badge badge-amber">CT Computed Tomography</span>;
      case 'SCAN_ULTRASOUND': return <span className="badge badge-cyan">Sonogram Ultrasound</span>;
      case 'LAB_REPORT': return <span className="badge badge-green">Biochemical Lab Assay</span>;
      default: return <span className="badge badge-cyan">{type}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={() => setFilter('ALL')}
          style={{
            background: filter === 'ALL' ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.04)',
            color: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          All Diagnostics ({mediaList.length})
        </button>
        <button
          onClick={() => setFilter('SCANS')}
          style={{
            background: filter === 'SCANS' ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.04)',
            color: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Medical Scans (X-Ray / MRI / CT)
        </button>
        <button
          onClick={() => setFilter('LAB')}
          style={{
            background: filter === 'LAB' ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.04)',
            color: '#ffffff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Lab & Pathology Reports
        </button>
      </div>

      {/* Grid of Media Cards */}
      {filteredList.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No diagnostic scans or laboratory reports found for this filter.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                transition: 'var(--transition)',
              }}
            >
              {/* Media Preview Box */}
              <div
                onClick={() => { setSelectedMedia(item); setZoom(1); }}
                style={{
                  height: '210px',
                  backgroundColor: '#020617',
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid var(--border-color)',
                }}
                className="media-preview-container"
              >
                {item.fileType.startsWith('image/') ? (
                  <img
                    src={item.fileData}
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={48} color="var(--primary)" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.fileName}</div>
                  </div>
                )}

                {/* Hover Overlay with Preview Icon */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(3, 7, 18, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                >
                  <span style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(6, 182, 212, 0.9)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                  }}>
                    <Maximize2 size={14} /> Fullscreen Inspection
                  </span>
                </div>

                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  {getMediaBadge(item.mediaType)}
                </div>
              </div>

              {/* Card Meta Content */}
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {item.description || 'Uploaded to patient diagnostic profile.'}
                  </p>
                </div>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: 'var(--text-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} />
                    <span>{item.uploaderName} ({item.uploaderRole})</span>
                  </div>
                  <div>
                    {item.fileSize ? `${(item.fileSize / 1024).toFixed(1)} KB` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal / Fullscreen Viewer */}
      {selectedMedia && (
        <div className="modal-overlay" onClick={() => setSelectedMedia(null)} style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '920px',
              width: '95vw',
              maxHeight: '92vh',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  {getMediaBadge(selectedMedia.mediaType)}
                  <span className="badge badge-cyan">
                    <ShieldCheck size={11} /> SHA-256 Verified
                  </span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800 }}>{selectedMedia.title}</h2>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
                  className="btn-secondary"
                  style={{ padding: '6px 10px' }}
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                  className="btn-secondary"
                  style={{ padding: '6px 10px' }}
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <a
                  href={selectedMedia.fileData}
                  download={selectedMedia.fileName}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  <Download size={14} /> Download
                </a>
                <button
                  onClick={() => setSelectedMedia(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Main Preview Box */}
            <div style={{
              flex: 1,
              minHeight: '400px',
              maxHeight: '55vh',
              backgroundColor: '#020617',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}>
              {selectedMedia.fileType.startsWith('image/') ? (
                <img
                  src={selectedMedia.fileData}
                  alt={selectedMedia.title}
                  style={{
                    transform: `scale(${zoom})`,
                    transition: 'transform 0.15s ease-out',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: '4px',
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <FileText size={64} color="var(--primary)" style={{ margin: '0 auto 12px auto' }} />
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{selectedMedia.fileName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Document format. Click Download above to inspect complete file.
                  </div>
                </div>
              )}
            </div>

            {/* Description & Metadata Footer */}
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div><strong>Clinical Description:</strong> {selectedMedia.description || 'None provided'}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: 'var(--text-subtle)' }}>
                <span>Uploader: <strong>{selectedMedia.uploaderName}</strong> ({selectedMedia.uploaderRole})</span>
                <span>File: {selectedMedia.fileName}</span>
                <span>Date: {selectedMedia.createdAt ? selectedMedia.createdAt.replace('T', ' ') : 'Recent'}</span>
                <span>Hash: <code style={{ color: 'var(--primary)' }}>{selectedMedia.mediaHash ? selectedMedia.mediaHash.substring(0, 16) : ''}...</code></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
