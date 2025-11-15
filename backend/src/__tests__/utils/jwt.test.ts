import { generateToken, verifyToken } from '../../utils/jwt.util';

describe('JWT Utilities', () => {
  const testUser = {
    id: 'test-user-id-123',
    email: 'test@example.com',
    username: 'testuser',
  };

  beforeAll(() => {
    // Ensure JWT_SECRET is set for tests
    process.env.JWT_SECRET = 'test-jwt-secret';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts separated by dots
    });

    it('should generate different tokens for different users', () => {
      const user1 = { ...testUser, id: 'user1' };
      const user2 = { ...testUser, id: 'user2' };

      const token1 = generateToken(user1);
      const token2 = generateToken(user2);

      expect(token1).not.toBe(token2);
    });

    it('should include user data in token', () => {
      const token = generateToken(testUser);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.username).toBe(testUser.username);
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateToken(testUser);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.username).toBe(testUser.username);
      expect(decoded.iat).toBeDefined(); // issued at
      expect(decoded.exp).toBeDefined(); // expiration
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        verifyToken(invalidToken);
      }).toThrow();
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';

      expect(() => {
        verifyToken(malformedToken);
      }).toThrow();
    });

    it('should throw error for token with wrong secret', () => {
      const token = generateToken(testUser);

      // Change the secret
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = 'different-secret';

      expect(() => {
        verifyToken(token);
      }).toThrow();

      // Restore original secret
      process.env.JWT_SECRET = originalSecret;
    });
  });
});
