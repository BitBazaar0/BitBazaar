import { Request, Response, NextFunction } from 'express';
import { authenticate, optionalAuth, AuthRequest } from '../../middleware/auth.middleware';
import { generateToken } from '../../utils/jwt.util';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should authenticate with valid token', () => {
      const testUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = generateToken(testUser);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe(testUser.id);
      expect(mockRequest.user?.email).toBe(testUser.email);
    });

    it('should reject request without token', () => {
      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('No token provided');
    });

    it('should reject request with invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Invalid token');
    });

    it('should reject request with malformed authorization header', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      const error = (nextFunction as jest.Mock).mock.calls[0][0];
      expect(error).toBeDefined();
      expect(error.statusCode).toBe(401);
    });
  });

  describe('optionalAuth', () => {
    it('should attach user with valid token', () => {
      const testUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
      };

      const token = generateToken(testUser);
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe(testUser.id);
    });

    it('should proceed without user when no token provided', () => {
      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should proceed without user when invalid token provided', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockRequest.user).toBeUndefined();
    });
  });
});
