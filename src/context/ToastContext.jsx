/**
 * ─── ToastContext ─────────────────────────────────────────────────────────────
 * Global toast notification system.
 * Wrap the app with <ToastProvider> and call useToast() in any component.
 *
 * Toast types: success | error | info | warning
 * Duration: auto-dismiss after 4 seconds (configurable per call)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { createContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContext = createContext(null);

let toastIdCounter = 0;

const TOAST_ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  info:    Info,
  warning: AlertTriangle,
};

const TOAST_STYLES = {
  success: {
    bg:     'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    color:  '#34d399',
  },
  error: {
    bg:     'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    color:  '#f87171',
  },
  info: {
    bg:     'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
    color:  '#22d3ee',
  },
  warning: {
    bg:     'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    color:  '#fbbf24',
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    show,
    success: (msg, dur) => show(msg, 'success', dur),
    error:   (msg, dur) => show(msg, 'error',   dur),
    info:    (msg, dur) => show(msg, 'info',     dur),
    warning: (msg, dur) => show(msg, 'warning',  dur),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Stack */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        style={{
          position:      'fixed',
          bottom:        '28px',
          right:         '28px',
          zIndex:        99999,
          display:       'flex',
          flexDirection: 'column',
          gap:           '10px',
          pointerEvents: 'none',
          maxWidth:      '420px',
          width:         '100%',
        }}
      >
        {toasts.map((t) => {
          const style   = TOAST_STYLES[t.type] || TOAST_STYLES.info;
          const Icon    = TOAST_ICONS[t.type]  || Info;
          return (
            <div
              key={t.id}
              role="alert"
              style={{
                display:       'flex',
                alignItems:    'flex-start',
                gap:           '12px',
                padding:       '14px 16px',
                borderRadius:  '12px',
                background:    'rgba(15, 23, 42, 0.97)',
                border:        `1px solid ${style.border}`,
                backdropFilter:'blur(20px)',
                boxShadow:     '0 8px 32px rgba(0,0,0,0.5)',
                pointerEvents: 'all',
                animation:     'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                color:         'var(--text-main)',
              }}
            >
              {/* Icon */}
              <div style={{
                width:          '32px',
                height:         '32px',
                borderRadius:   '8px',
                background:     style.bg,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
              }}>
                <Icon size={16} color={style.color} />
              </div>

              {/* Message */}
              <div style={{ flex: 1, paddingTop: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4 }}>
                  {t.message}
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  color:      'var(--text-subtle)',
                  padding:    '4px',
                  flexShrink: 0,
                  borderRadius: '4px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-subtle)'}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
