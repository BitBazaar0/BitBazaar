import prisma from '../../lib/prisma';

/**
 * Clean up all test data from the database
 * WARNING: This deletes all data - only use in test environment
 */
export async function cleanDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('cleanDatabase can only be run in test environment');
  }

  // Delete in correct order to respect foreign key constraints
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
}

/**
 * Disconnect from the database
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

/**
 * Seed test categories
 */
export async function seedTestCategories() {
  const categories = [
    { name: 'GPU', slug: 'gpu', displayName: 'Graphics Cards', icon: 'Memory', color: '#FF6B6B' },
    { name: 'CPU', slug: 'cpu', displayName: 'Processors', icon: 'Cpu', color: '#4ECDC4' },
    { name: 'RAM', slug: 'ram', displayName: 'Memory', icon: 'Memory', color: '#FFE66D' },
    { name: 'Storage', slug: 'storage', displayName: 'Storage Devices', icon: 'Storage', color: '#95E1D3' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  return categories;
}

/**
 * Create a test user
 */
export async function createTestUser(data?: Partial<{
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}>) {
  const defaultData = {
    email: 'test@example.com',
    username: 'testuser',
    password: '$2a$10$YourHashedPasswordHere', // Pre-hashed password: "password123"
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
  };

  return await prisma.user.create({
    data: { ...defaultData, ...data },
  });
}

/**
 * Create a test listing
 */
export async function createTestListing(
  sellerId: string,
  categoryId: string,
  data?: Partial<{
    title: string;
    description: string;
    brand: string;
    model: string;
    condition: string;
    price: number;
    location: string;
    images: string[];
  }>
) {
  const defaultData = {
    title: 'Test Product',
    description: 'Test Description',
    brand: 'Test Brand',
    model: 'Test Model',
    condition: 'new',
    price: 100,
    location: 'Test Location',
    images: [],
  };

  return await prisma.listing.create({
    data: {
      ...defaultData,
      ...data,
      sellerId,
      categoryId,
    },
  });
}
