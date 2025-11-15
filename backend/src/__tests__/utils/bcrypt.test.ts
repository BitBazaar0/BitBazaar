import { hashPassword, comparePassword } from '../../utils/bcrypt.util';

describe('Bcrypt Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'MyPassword123!';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
      expect(hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')).toBe(true);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'MyPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty string', async () => {
      const password = '';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'MyPassword123!';
      const hashedPassword = await hashPassword(password);

      const result = await comparePassword(password, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'MyPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await hashPassword(password);

      const result = await comparePassword(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'MyPassword123!';
      const hashedPassword = await hashPassword(password);

      const result = await comparePassword('', hashedPassword);

      expect(result).toBe(false);
    });

    it('should handle case sensitivity', async () => {
      const password = 'MyPassword123!';
      const hashedPassword = await hashPassword(password);

      const result = await comparePassword('mypassword123!', hashedPassword);

      expect(result).toBe(false);
    });
  });
});
