import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

let adapter;

if (isPostgres) {
  try {
    const pg = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const pool = new pg.Pool({ connectionString: dbUrl });
    adapter = new PrismaPg(pool);
  } catch (e) {
    console.warn('PostgreSQL adapter init failed, using default Prisma connection');
  }
} else {
  try {
    const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
    adapter = new PrismaBetterSqlite3({ url: dbUrl });
  } catch (e) {
    console.warn('SQLite adapter not available (expected on Vercel), using default Prisma connection');
  }
}

const globalForPrisma = global;

const clientOpts = adapter ? { adapter } : {};
export const prisma = globalForPrisma.prisma || new PrismaClient(clientOpts);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
