/**
 * ─── VALIDATORS ──────────────────────────────────────────────────────────────
 * Pure form validation functions.
 * Each returns { valid: boolean, message: string }
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Validate an email address.
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) return { valid: false, message: 'Email address is required.' };
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email.trim())) return { valid: false, message: 'Please enter a valid email address.' };
  return { valid: true, message: '' };
};

/**
 * Validate a password (min 8 chars, at least 1 digit).
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required.' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters.' };
  if (!/\d/.test(password)) return { valid: false, message: 'Password must contain at least one number.' };
  return { valid: true, message: '' };
};

/**
 * Validate a username (alphanumeric + underscores, 3–30 chars).
 */
export const validateUsername = (username) => {
  if (!username || !username.trim()) return { valid: false, message: 'Username is required.' };
  if (username.length < 3) return { valid: false, message: 'Username must be at least 3 characters.' };
  if (username.length > 30) return { valid: false, message: 'Username must be 30 characters or fewer.' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, message: 'Username may only contain letters, numbers, and underscores.' };
  return { valid: true, message: '' };
};

/**
 * Validate a phone number (loose — allows + dashes spaces parens).
 */
export const validatePhone = (phone) => {
  if (!phone) return { valid: true, message: '' }; // optional field
  const pattern = /^[+\d\s\-().]{7,20}$/;
  if (!pattern.test(phone)) return { valid: false, message: 'Enter a valid phone number (e.g. +1-555-0199).' };
  return { valid: true, message: '' };
};

/**
 * Validate a required text field.
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || !String(value).trim()) return { valid: false, message: `${fieldName} is required.` };
  return { valid: true, message: '' };
};

/**
 * Validate an OTP code (exactly 6 digits).
 */
export const validateOtp = (otp) => {
  if (!otp) return { valid: false, message: 'Verification code is required.' };
  if (!/^\d{6}$/.test(otp)) return { valid: false, message: 'Verification code must be exactly 6 digits.' };
  return { valid: true, message: '' };
};

/**
 * Run multiple validators and return the first error found.
 * @param {Array<Function>} validators  Array of () => { valid, message }
 * @returns {string} First error message, or '' if all pass
 */
export const runValidators = (...validators) => {
  for (const fn of validators) {
    const result = fn();
    if (!result.valid) return result.message;
  }
  return '';
};
