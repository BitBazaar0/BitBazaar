import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { cleanDatabase, disconnectDatabase, seedTestCategories, createTestUser, createTestListing } from '../helpers/testDb';
import prisma from '../../lib/prisma';

const { app, httpServer } = createTestApp();

describe('Listing API', () => {
  let authToken: string;
  let userId: string;
  let categoryId: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Seed categories
    const categories = await seedTestCategories();
    categoryId = (await prisma.category.findFirst({ where: { slug: 'gpu' } }))!.id;

    // Create and login a user
    const user = await createTestUser({
      email: 'seller@example.com',
      username: 'seller',
      emailVerified: true,
    });
    userId = user.id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'seller@example.com',
        password: 'password123',
      });

    // Note: This will fail because createTestUser uses a pre-hashed password
    // We need to use the actual hashed version of 'password123'
    // For now, let's create a proper test user with login capability
    await cleanDatabase();
    await seedTestCategories();
    categoryId = (await prisma.category.findFirst({ where: { slug: 'gpu' } }))!.id;

    // Register a new user properly
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'seller@example.com',
        username: 'seller',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'Seller',
      });

    // Manually verify the user
    const registeredUser = await prisma.user.findUnique({
      where: { email: 'seller@example.com' },
    });
    userId = registeredUser!.id;
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    // Login
    const login = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'seller@example.com',
        password: 'Password123!',
      });

    authToken = login.body.data.token;
  });

  afterAll(async () => {
    await cleanDatabase();
    await disconnectDatabase();
    httpServer.close();
  });

  describe('POST /api/listings', () => {
    it('should create a new listing', async () => {
      const listingData = {
        title: 'NVIDIA RTX 4090',
        description: 'Brand new graphics card',
        categoryId,
        brand: 'NVIDIA',
        model: 'RTX 4090',
        condition: 'new',
        price: 1599.99,
        location: 'Skopje',
        images: ['https://example.com/image1.jpg'],
      };

      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(listingData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe(listingData.title);
      expect(response.body.data.price).toBe(listingData.price);
      expect(response.body.data.sellerId).toBe(userId);
      expect(response.body.data.isActive).toBe(true);
      expect(response.body.data.isSold).toBe(false);
    });

    it('should not create listing without authentication', async () => {
      const listingData = {
        title: 'Test Product',
        categoryId,
        price: 100,
      };

      const response = await request(app)
        .post('/api/listings')
        .send(listingData)
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Product',
          // missing required fields
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/listings', () => {
    beforeEach(async () => {
      // Create multiple test listings
      await createTestListing(userId, categoryId, {
        title: 'RTX 4090',
        brand: 'NVIDIA',
        price: 1599,
        condition: 'new',
      });

      await createTestListing(userId, categoryId, {
        title: 'RTX 3080',
        brand: 'NVIDIA',
        price: 699,
        condition: 'used',
      });

      await createTestListing(userId, categoryId, {
        title: 'RX 7900 XTX',
        brand: 'AMD',
        price: 899,
        condition: 'new',
      });
    });

    it('should get all active listings', async () => {
      const response = await request(app)
        .get('/api/listings')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.listings).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
    });

    it('should filter listings by category', async () => {
      const response = await request(app)
        .get(`/api/listings?categoryId=${categoryId}`)
        .expect(200);

      expect(response.body.data.listings).toHaveLength(3);
      response.body.data.listings.forEach((listing: any) => {
        expect(listing.categoryId).toBe(categoryId);
      });
    });

    it('should filter listings by brand', async () => {
      const response = await request(app)
        .get('/api/listings?brand=NVIDIA')
        .expect(200);

      expect(response.body.data.listings).toHaveLength(2);
      response.body.data.listings.forEach((listing: any) => {
        expect(listing.brand).toBe('NVIDIA');
      });
    });

    it('should filter listings by condition', async () => {
      const response = await request(app)
        .get('/api/listings?condition=new')
        .expect(200);

      expect(response.body.data.listings).toHaveLength(2);
      response.body.data.listings.forEach((listing: any) => {
        expect(listing.condition).toBe('new');
      });
    });

    it('should filter listings by price range', async () => {
      const response = await request(app)
        .get('/api/listings?minPrice=700&maxPrice=1000')
        .expect(200);

      expect(response.body.data.listings).toHaveLength(1);
      expect(response.body.data.listings[0].price).toBe(899);
    });

    it('should search listings by text', async () => {
      const response = await request(app)
        .get('/api/listings?search=RTX')
        .expect(200);

      expect(response.body.data.listings).toHaveLength(2);
      response.body.data.listings.forEach((listing: any) => {
        expect(listing.title).toContain('RTX');
      });
    });

    it('should sort listings by price ascending', async () => {
      const response = await request(app)
        .get('/api/listings?sort=price-asc')
        .expect(200);

      const prices = response.body.data.listings.map((l: any) => l.price);
      expect(prices).toEqual([699, 899, 1599]);
    });

    it('should sort listings by price descending', async () => {
      const response = await request(app)
        .get('/api/listings?sort=price-desc')
        .expect(200);

      const prices = response.body.data.listings.map((l: any) => l.price);
      expect(prices).toEqual([1599, 899, 699]);
    });

    it('should paginate listings', async () => {
      const response = await request(app)
        .get('/api/listings?page=1&limit=2')
        .expect(200);

      expect(response.body.data.listings).toHaveLength(2);
      expect(response.body.data.total).toBe(3);
      expect(response.body.data.page).toBe(1);
    });
  });

  describe('GET /api/listings/:id', () => {
    let listingId: string;

    beforeEach(async () => {
      const listing = await createTestListing(userId, categoryId, {
        title: 'RTX 4090',
        description: 'Detailed description',
      });
      listingId = listing.id;
    });

    it('should get a single listing by id', async () => {
      const response = await request(app)
        .get(`/api/listings/${listingId}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id).toBe(listingId);
      expect(response.body.data.title).toBe('RTX 4090');
      expect(response.body.data.seller).toBeDefined();
    });

    it('should return 404 for non-existent listing', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/listings/${fakeId}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should increment view count', async () => {
      // First view
      await request(app).get(`/api/listings/${listingId}`);

      // Second view
      await request(app).get(`/api/listings/${listingId}`);

      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      expect(listing?.views).toBe(2);
    });
  });

  describe('PATCH /api/listings/:id', () => {
    let listingId: string;

    beforeEach(async () => {
      const listing = await createTestListing(userId, categoryId, {
        title: 'Original Title',
        price: 100,
      });
      listingId = listing.id;
    });

    it('should update own listing', async () => {
      const updates = {
        title: 'Updated Title',
        price: 150,
      };

      const response = await request(app)
        .patch(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.title).toBe(updates.title);
      expect(response.body.data.price).toBe(updates.price);
    });

    it('should not update another user\'s listing', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          username: 'otheruser',
          password: 'Password123!',
          firstName: 'Other',
          lastName: 'User',
        });

      const otherUser = await prisma.user.findUnique({
        where: { email: 'other@example.com' },
      });
      await prisma.user.update({
        where: { id: otherUser!.id },
        data: { emailVerified: true },
      });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'Password123!',
        });

      const otherToken = otherLogin.body.data.token;

      const response = await request(app)
        .patch(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(response.body.message).toContain('not authorized');
    });

    it('should not update without authentication', async () => {
      const response = await request(app)
        .patch(`/api/listings/${listingId}`)
        .send({ title: 'New Title' })
        .expect(401);

      expect(response.body.message).toContain('No token provided');
    });
  });

  describe('DELETE /api/listings/:id', () => {
    let listingId: string;

    beforeEach(async () => {
      const listing = await createTestListing(userId, categoryId);
      listingId = listing.id;
    });

    it('should soft delete own listing', async () => {
      const response = await request(app)
        .delete(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('deleted');

      // Verify listing is soft deleted
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      expect(listing?.deletedAt).toBeTruthy();
      expect(listing?.isActive).toBe(false);
    });

    it('should not delete another user\'s listing', async () => {
      // Create another user and get token
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          username: 'otheruser',
          password: 'Password123!',
          firstName: 'Other',
          lastName: 'User',
        });

      const otherUser = await prisma.user.findUnique({
        where: { email: 'other@example.com' },
      });
      await prisma.user.update({
        where: { id: otherUser!.id },
        data: { emailVerified: true },
      });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'Password123!',
        });

      const otherToken = otherLogin.body.data.token;

      const response = await request(app)
        .delete(`/api/listings/${listingId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.message).toContain('not authorized');
    });
  });

  describe('POST /api/listings/:id/sold', () => {
    let listingId: string;

    beforeEach(async () => {
      const listing = await createTestListing(userId, categoryId);
      listingId = listing.id;
    });

    it('should mark own listing as sold', async () => {
      const response = await request(app)
        .post(`/api/listings/${listingId}/sold`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.isSold).toBe(true);

      // Verify in database
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      expect(listing?.isSold).toBe(true);
    });

    it('should not mark another user\'s listing as sold', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'other@example.com',
          username: 'otheruser',
          password: 'Password123!',
          firstName: 'Other',
          lastName: 'User',
        });

      const otherUser = await prisma.user.findUnique({
        where: { email: 'other@example.com' },
      });
      await prisma.user.update({
        where: { id: otherUser!.id },
        data: { emailVerified: true },
      });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'Password123!',
        });

      const otherToken = otherLogin.body.data.token;

      const response = await request(app)
        .post(`/api/listings/${listingId}/sold`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.message).toContain('not authorized');
    });
  });
});
