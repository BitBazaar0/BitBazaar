import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prismaClientSingleton = (): PrismaClient => {
  const databaseUrl = process.env.DATABASE_URL;
  
  // Validate connection string format for Supabase
  if (databaseUrl?.includes('pooler.supabase.com')) {
    if (!databaseUrl.includes('pgbouncer=true')) {
      logger.warn('Supabase pooler URL missing pgbouncer=true. Consider adding it to DATABASE_URL.');
    }
    if (databaseUrl.includes(':5432')) {
      logger.warn('Using port 5432 with pooler. Consider using port 6543 for connection pooling.');
    }
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
};

declare const globalThis: {
  prismaGlobal: PrismaClient | undefined;
} & typeof global;

const prisma: PrismaClient = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export default prisma;

