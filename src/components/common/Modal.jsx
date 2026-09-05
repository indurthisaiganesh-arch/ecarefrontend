/**
 * ─── Modal Component ──────────────────────────────────────────────────────────
 * Generic overlay modal wrapper.
 * Handles: backdrop, close on Escape, close on backdrop click, scroll lock.
 *
 * Usage:
 *   <Modal
 *     isOpen={showModal}
 *     onClose={() => setShowModal(false)}
 *     title="Create Staff Account"
 *     subtitle="Staff-created accounts are active immediately"
 *     icon={<UserPlus size={20} color="#fff" />}
 *     maxWidth="520px"
 *   >
 *     <form>...</form>
 *   </Modal>
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * @param {{
 *   isOpen:     boolean,
 *   onClose:    () => void,
 *   title?:     string,
 *   subtitle?:  string,
 *   icon?:      React.ReactNode,
 *   maxWidth?:  string,
 *   children:   React.ReactNode,
 *   closeOnBackdrop?: boolean,
 * }} props
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  maxWidth = '520px',
  children,
  closeOnBackdrop = true,
}) => {
  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        background:      'rgba(0,0,0,0.65)',
        backdropFilter:  'blur(6px)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '24px',
      }}
      onClick={closeOnBackdrop ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}
    >
      <div
        className="glass-panel"
        style={{
          width:     '100%',
          maxWidth,
          padding:   '32px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position:  'relative',
          animation: 'modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header */}
        {(title || icon) && (
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-start',
            marginBottom:   '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {icon && (
                <div style={{
                  width:          '40px',
                  height:         '40px',
                  borderRadius:   '10px',
                  background:     'var(--primary-gradient)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  boxShadow:      '0 0 16px var(--primary-glow)',
                  flexShrink:     0,
                }}>
                  {icon}
                </div>
              )}
              {title && (
                <div>
                  <div style={{ fontWeight: 800, fontSize: '17px' }}>{title}</div>
                  {subtitle && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {subtitle}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                background:   'none',
                border:       'none',
                cursor:       'pointer',
                color:        'var(--text-muted)',
                padding:      '4px',
                borderRadius: '6px',
                transition:   'color 0.2s, background 0.2s',
                flexShrink:   0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-main)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'none';
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        {children}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
};
