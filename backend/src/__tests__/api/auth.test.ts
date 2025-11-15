import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { cleanDatabase, disconnectDatabase } from '../helpers/testDb';
import prisma from '../../lib/prisma';
import { hashPassword } from '../../utils/bcrypt.util';

const { app, httpServer } = createTestApp();

describe('Authentication API', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
    httpServer.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
        location: 'Test City',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.message).toContain('Registration successful');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.emailVerified).toBe(false);
      expect(user?.verificationToken).toBeTruthy();
    });

    it('should not register user with existing email', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'user1',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      // Create first user
      await request(app).post('/api/auth/register').send(userData);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, username: 'user2' })
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });

    it('should not register user with existing username', async () => {
      const userData = {
        email: 'user1@example.com',
        username: 'existinguser',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      // Create first user
      await request(app).post('/api/auth/register').send(userData);

      // Try to create second user with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, email: 'user2@example.com' })
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // missing username and password
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a verified user for login tests
      const hashedPassword = await hashPassword('Password123!');
      await prisma.user.create({
        data: {
          email: 'loginuser@example.com',
          username: 'loginuser',
          password: hashedPassword,
          firstName: 'Login',
          lastName: 'User',
          emailVerified: true,
        },
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('loginuser@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should not login with unverified email', async () => {
      // Create unverified user
      const hashedPassword = await hashPassword('Password123!');
      await prisma.user.create({
        data: {
          email: 'unverified@example.com',
          username: 'unverified',
          password: hashedPassword,
          firstName: 'Unverified',
          lastName: 'User',
          emailVerified: false,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.message).toContain('verify your email');
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'loginuser@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      // Create and login a user
      const hashedPassword = await hashPassword('Password123!');
      const user = await prisma.user.create({
        data: {
          email: 'meuser@example.com',
          username: 'meuser',
          password: hashedPassword,
          firstName: 'Me',
          lastName: 'User',
          emailVerified: true,
        },
      });
      userId = user.id;

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'meuser@example.com',
          password: 'Password123!',
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('meuser@example.com');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('GET /api/auth/verify-email', () => {
    it('should verify email with valid token', async () => {
      // Create unverified user with verification token
      const hashedPassword = await hashPassword('Password123!');
      const user = await prisma.user.create({
        data: {
          email: 'verify@example.com',
          username: 'verifyuser',
          password: hashedPassword,
          firstName: 'Verify',
          lastName: 'User',
          emailVerified: false,
          verificationToken: 'valid-verification-token',
        },
      });

      const response = await request(app)
        .get('/api/auth/verify-email?token=valid-verification-token')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('verified successfully');

      // Verify user is now verified in database
      const verifiedUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(verifiedUser?.emailVerified).toBe(true);
      expect(verifiedUser?.verificationToken).toBeNull();
    });

    it('should not verify with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email?token=invalid-token')
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should not verify already verified email', async () => {
      const hashedPassword = await hashPassword('Password123!');
      await prisma.user.create({
        data: {
          email: 'already@example.com',
          username: 'already',
          password: hashedPassword,
          firstName: 'Already',
          lastName: 'Verified',
          emailVerified: true,
          verificationToken: 'some-token',
        },
      });

      const response = await request(app)
        .get('/api/auth/verify-email?token=some-token')
        .expect(400);

      expect(response.body.message).toContain('already verified');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword('Password123!');
      await prisma.user.create({
        data: {
          email: 'forgot@example.com',
          username: 'forgotuser',
          password: hashedPassword,
          firstName: 'Forgot',
          lastName: 'User',
          emailVerified: true,
        },
      });
    });

    it('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgot@example.com' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('password reset email');

      // Verify reset token was created
      const user = await prisma.user.findUnique({
        where: { email: 'forgot@example.com' },
      });
      expect(user?.resetToken).toBeTruthy();
      expect(user?.resetTokenExpiry).toBeTruthy();
    });

    it('should not reveal if email does not exist', async () => {
      // For security, we don't want to reveal which emails are registered
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      const hashedPassword = await hashPassword('OldPassword123!');
      resetToken = 'valid-reset-token-123';
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      await prisma.user.create({
        data: {
          email: 'reset@example.com',
          username: 'resetuser',
          password: hashedPassword,
          firstName: 'Reset',
          lastName: 'User',
          emailVerified: true,
          resetToken,
          resetTokenExpiry,
        },
      });
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('reset successfully');

      // Verify user can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'reset@example.com',
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.data).toHaveProperty('token');

      // Verify reset token was cleared
      const user = await prisma.user.findUnique({
        where: { email: 'reset@example.com' },
      });
      expect(user?.resetToken).toBeNull();
      expect(user?.resetTokenExpiry).toBeNull();
    });

    it('should not reset password with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewPassword123!',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should not reset password with expired token', async () => {
      // Create user with expired token
      const hashedPassword = await hashPassword('Password123!');
      const expiredToken = 'expired-token-123';
      const expiredDate = new Date(Date.now() - 3600000); // 1 hour ago

      await prisma.user.create({
        data: {
          email: 'expired@example.com',
          username: 'expireduser',
          password: hashedPassword,
          firstName: 'Expired',
          lastName: 'User',
          emailVerified: true,
          resetToken: expiredToken,
          resetTokenExpiry: expiredDate,
        },
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: expiredToken,
          password: 'NewPassword123!',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired');
    });
  });
});
