import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  // Validate connection string format for Supabase
  if (databaseUrl?.includes('pooler.supabase.com')) {
    // Ensure pgbouncer=true is in the URL for proper pooling
    if (!databaseUrl.includes('pgbouncer=true')) {
      console.warn('⚠️  Warning: Supabase pooler URL detected but missing pgbouncer=true parameter.');
      console.warn('   Consider updating your DATABASE_URL to include ?pgbouncer=true');
    }
    // Ensure port 6543 (pooler) is being used, not 5432 (direct)
    if (databaseUrl.includes(':5432')) {
      console.warn('⚠️  Warning: Using port 5432 with pooler. Consider using port 6543 for connection pooling.');
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
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

export default prisma;

