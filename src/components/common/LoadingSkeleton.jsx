/**
 * ─── LoadingSkeleton Component ────────────────────────────────────────────────
 * Animated skeleton placeholders for tables and content cards.
 * Replaces plain "Loading..." text with production-quality loading states.
 *
 * Usage:
 *   <TableSkeleton rows={5} cols={6} />
 *   <CardSkeleton count={3} />
 *   <TextSkeleton lines={2} />
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';

const shimmerStyle = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: '6px',
};

/**
 * Skeleton rows for a table body.
 * @param {{ rows?: number, cols?: number }} props
 */
export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <tr key={rowIdx} style={{ opacity: 1 - (rowIdx * 0.12) }}>
        {Array.from({ length: cols }).map((_, colIdx) => (
          <td key={colIdx} style={{ padding: '14px 16px' }}>
            <div style={{ ...shimmerStyle, height: '14px', width: colIdx === 0 ? '80%' : `${55 + (colIdx * 7) % 30}%` }} />
          </td>
        ))}
      </tr>
    ))}
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </>
);

/**
 * Skeleton cards in a grid layout.
 * @param {{ count?: number, height?: string }} props
 */
export const CardSkeleton = ({ count = 3, height = '120px' }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ ...shimmerStyle, height, borderRadius: '12px' }} />
    ))}
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

/**
 * Skeleton text lines.
 * @param {{ lines?: number }} props
 */
export const TextSkeleton = ({ lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} style={{ ...shimmerStyle, height: '13px', width: i === lines - 1 ? '60%' : '100%' }} />
    ))}
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

/**
 * Full-page centered loading spinner (for route-level loading).
 * @param {{ label?: string }} props
 */
export const PageSpinner = ({ label = 'Loading...' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    minHeight: '300px', gap: '16px',
  }}>
    <div style={{
      width: '40px', height: '40px',
      border: '3px solid rgba(6, 182, 212, 0.2)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
