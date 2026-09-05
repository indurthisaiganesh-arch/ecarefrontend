/**
 * ─── PageHeader Component ─────────────────────────────────────────────────────
 * Standard page title + subtitle + badge + action buttons.
 * Use at the top of every page for visual consistency.
 *
 * Usage:
 *   <PageHeader
 *     title="System User Directory"
 *     subtitle="Manage registered accounts"
 *     badge={{ label: '42 Accounts', className: 'badge-cyan' }}
 *     actions={<button className="btn-primary">Create User</button>}
 *   />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';

/**
 * @param {{
 *   title:      string,
 *   subtitle?:  string,
 *   badge?:     { label: string, className?: string },
 *   badges?:    Array<{ label: string, className?: string }>,
 *   icon?:      React.ReactNode,
 *   actions?:   React.ReactNode,
 *   style?:     object,
 * }} props
 */
export const PageHeader = ({ title, subtitle, badge, badges = [], icon, actions, style: extraStyle }) => {
  const allBadges = badge ? [badge, ...badges] : badges;

  return (
    <div style={{
      display:        'flex',
      justifyContent: 'space-between',
      alignItems:     'center',
      flexWrap:       'wrap',
      gap:            '12px',
      ...extraStyle,
    }}>
      {/* Left: title + badges + subtitle */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
          {/* Optional icon */}
          {icon && (
            <div style={{
              width:          '36px',
              height:         '36px',
              borderRadius:   '10px',
              background:     'var(--primary-gradient)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              boxShadow:      '0 0 14px var(--primary-glow)',
              flexShrink:     0,
            }}>
              {icon}
            </div>
          )}

          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>{title}</h1>

          {/* Badges */}
          {allBadges.map((b, i) => (
            <span key={i} className={`badge ${b.className || 'badge-cyan'}`}>{b.label}</span>
          ))}
        </div>

        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: action buttons */}
      {actions && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
};
