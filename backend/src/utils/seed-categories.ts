import prisma from '../lib/prisma';
import logger from './logger';

export const seedCategories = async () => {
  try {
    // Check if categories already exist
    const existingCategories = await prisma.category.count();
    if (existingCategories > 0) {
      logger.info('Categories already exist, skipping seed');
      return;
    }

    const categories = [
      { name: 'GPU', slug: 'gpu', displayName: 'GPUS', color: '#6366f1' },
      { name: 'CPU', slug: 'cpu', displayName: 'CPUS', color: '#10b981' },
      { name: 'RAM', slug: 'ram', displayName: 'MEMORY', color: '#f59e0b' },
      { name: 'Motherboard', slug: 'motherboard', displayName: 'MOTHERBOARDS', color: '#8b5cf6' },
      { name: 'Storage', slug: 'storage', displayName: 'STORAGE', color: '#ec4899' },
      { name: 'PSU', slug: 'psu', displayName: 'POWER SUPPLIES', color: '#3b82f6' },
      { name: 'Case', slug: 'case', displayName: 'GAMING PCS', color: '#14b8a6' },
      { name: 'Cooling', slug: 'cooling', displayName: 'COOLING', color: '#06b6d4' },
      { name: 'Peripheral', slug: 'peripheral', displayName: 'PERIPHERALS', color: '#a855f7' },
      { name: 'Monitor', slug: 'monitor', displayName: 'MONITORS', color: '#f97316' },
      { name: 'Other', slug: 'other', displayName: 'OTHER', color: '#64748b' },
    ];

    await prisma.category.createMany({
      data: categories,
      skipDuplicates: true
    });

    logger.info(`Seeded ${categories.length} categories`);
  } catch (error) {
    logger.error('Error seeding categories:', error);
    throw error;
  }
};

