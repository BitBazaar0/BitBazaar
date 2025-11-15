import {
  generateVerificationToken,
  generateResetToken,
  getTokenExpiry,
  isTokenExpired,
} from '../../utils/token.util';

describe('Token Utilities', () => {
  describe('generateVerificationToken', () => {
    it('should generate a random token', () => {
      const token = generateVerificationToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate hex string', () => {
      const token = generateVerificationToken();
      // Hex string should only contain 0-9 and a-f
      expect(/^[0-9a-f]+$/i.test(token)).toBe(true);
    });
  });

  describe('generateResetToken', () => {
    it('should generate a random token', () => {
      const token = generateResetToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate unique tokens', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate hex string', () => {
      const token = generateResetToken();
      expect(/^[0-9a-f]+$/i.test(token)).toBe(true);
    });
  });

  describe('getTokenExpiry', () => {
    it('should return a future date', () => {
      const expiryDate = getTokenExpiry();
      const now = new Date();

      expect(expiryDate).toBeInstanceOf(Date);
      expect(expiryDate.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should return date approximately 1 hour in the future', () => {
      const expiryDate = getTokenExpiry();
      const now = new Date();
      const diffInMinutes = (expiryDate.getTime() - now.getTime()) / (1000 * 60);

      // Should be approximately 60 minutes (allow small variance)
      expect(diffInMinutes).toBeGreaterThan(59);
      expect(diffInMinutes).toBeLessThan(61);
    });

    it('should accept custom hours', () => {
      const hours = 24;
      const expiryDate = getTokenExpiry(hours);
      const now = new Date();
      const diffInHours = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      expect(diffInHours).toBeGreaterThan(hours - 0.1);
      expect(diffInHours).toBeLessThan(hours + 0.1);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for future date', () => {
      const futureDate = new Date(Date.now() + 3600000); // 1 hour from now
      const result = isTokenExpired(futureDate);

      expect(result).toBe(false);
    });

    it('should return true for past date', () => {
      const pastDate = new Date(Date.now() - 3600000); // 1 hour ago
      const result = isTokenExpired(pastDate);

      expect(result).toBe(true);
    });

    it('should return true for null', () => {
      const result = isTokenExpired(null);

      expect(result).toBe(true);
    });

    it('should return true for undefined', () => {
      const result = isTokenExpired(undefined);

      expect(result).toBe(true);
    });

    it('should handle edge case of current time', () => {
      const now = new Date();
      const result = isTokenExpired(now);

      // Should be expired or very close to expiring
      expect(typeof result).toBe('boolean');
    });
  });
});
