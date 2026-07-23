import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

function createPrismaClient() {
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
    const isSqlite = dbUrl.startsWith('file:');

    if (isPostgres) {
      return new PrismaClient({ datasources: { db: { url: dbUrl } } });
    }

    if (isSqlite) {
      try {
        const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
        return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });
      } catch {
        return new PrismaClient();
      }
    }

    return new PrismaClient();
  } catch (err) {
    console.error('PrismaClient initialization failed:', err.message);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
