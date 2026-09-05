/**
 * ─── Alert Component ──────────────────────────────────────────────────────────
 * Inline alert banners for error, success, info, and warning states.
 * Replaces raw inline div styling scattered across pages.
 *
 * Usage:
 *   <Alert type="error" message={error} />
 *   <Alert type="success" message="Patient created successfully" onDismiss={() => setSuccess('')} />
 *   <Alert type="info" message="Account is pending approval." icon={<Clock size={16} />} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const CONFIG = {
  error: {
    bg:     'rgba(239, 68, 68, 0.10)',
    border: 'rgba(239, 68, 68, 0.30)',
    color:  '#f87171',
    Icon:   AlertCircle,
  },
  success: {
    bg:     'rgba(16, 185, 129, 0.10)',
    border: 'rgba(16, 185, 129, 0.30)',
    color:  '#34d399',
    Icon:   CheckCircle2,
  },
  info: {
    bg:     'rgba(6, 182, 212, 0.08)',
    border: 'rgba(6, 182, 212, 0.25)',
    color:  '#22d3ee',
    Icon:   Info,
  },
  warning: {
    bg:     'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.30)',
    color:  '#fbbf24',
    Icon:   AlertTriangle,
  },
};

/**
 * @param {{ type?: 'error'|'success'|'info'|'warning', message?: string, icon?: React.ReactNode, onDismiss?: () => void, style?: object }} props
 */
export const Alert = ({ type = 'info', message, icon, onDismiss, style: extraStyle }) => {
  if (!message) return null;

  const cfg = CONFIG[type] || CONFIG.info;
  const DefaultIcon = cfg.Icon;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        padding:      '12px 14px',
        borderRadius: 'var(--radius-md)',
        background:   cfg.bg,
        border:       `1px solid ${cfg.border}`,
        color:        cfg.color,
        fontSize:     '13px',
        lineHeight:   1.5,
        ...extraStyle,
      }}
    >
      {/* Icon */}
      <span style={{ flexShrink: 0 }}>
        {icon || <DefaultIcon size={18} />}
      </span>

      {/* Message */}
      <span style={{ flex: 1 }}>{message}</span>

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background:   'none',
            border:       'none',
            cursor:       'pointer',
            color:        cfg.color,
            opacity:      0.7,
            padding:      '2px',
            flexShrink:   0,
            borderRadius: '4px',
            transition:   'opacity 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
