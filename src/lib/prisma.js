import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

const createPrismaClient = () => {
  try {
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
      return new PrismaClient({ datasources: { db: { url: dbUrl } } });
    }
    if (dbUrl.startsWith('file:')) {
      const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
      return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });
    }
  } catch {}
  return new PrismaClient();
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
