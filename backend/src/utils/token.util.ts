import crypto from 'crypto';

/**
 * Generate a secure random token for email verification
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a secure random token for password reset
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate token expiry date (default: 1 hour from now)
 */
export const getTokenExpiry = (hours: number = 1): Date => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (expiryDate: Date | null | undefined): boolean => {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
};

