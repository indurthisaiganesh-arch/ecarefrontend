/**
 * ─── FORMATTERS ──────────────────────────────────────────────────────────────
 * Pure utility functions for data display formatting.
 * No React dependencies — can be used in hooks, services, and components.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Format an ISO date string to a readable date.
 * @param {string} iso  e.g. "2026-09-05T05:10:37"
 * @returns {string}    e.g. "05 Sep 2026"
 */
export const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

/**
 * Format an ISO date string to a readable date + time.
 * @param {string} iso  e.g. "2026-09-05T05:10:37"
 * @returns {string}    e.g. "05 Sep 2026, 05:10 AM"
 */
export const formatDateTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

/**
 * Format an ISO string to a relative time label.
 * @param {string} iso
 * @returns {string}  e.g. "2 hours ago", "just now"
 */
export const formatRelativeTime = (iso) => {
  if (!iso) return '—';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60)  return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)  return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)    return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30)     return `${days}d ago`;
    return formatDate(iso);
  } catch {
    return iso;
  }
};

/**
 * Get initials from a full name (up to 2 characters).
 * @param {string} fullName  e.g. "Jane Doe"
 * @returns {string}         e.g. "JD"
 */
export const getInitials = (fullName) => {
  if (!fullName) return '?';
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
};

/**
 * Format a phone number for display.
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return 'Not provided';
  return phone;
};

/**
 * Format a file size in bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string}  e.g. "2.4 MB"
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

/**
 * Truncate a string to maxLen characters with ellipsis.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (str, maxLen = 60) => {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
};

/**
 * Capitalize the first letter of each word.
 * @param {string} str
 * @returns {string}
 */
export const titleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
