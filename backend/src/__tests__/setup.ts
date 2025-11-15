import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set default test environment variables if not already set
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.PORT = process.env.PORT || '5001';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Disable email sending in tests
process.env.SMTP_HOST = '';
process.env.SMTP_PORT = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';

// Mock logger to reduce noise in tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Global test timeout
jest.setTimeout(30000);
