export const dynamic = 'force-dynamic';

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

function createClient() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  const isSqlite = dbUrl.startsWith('file:');

  if (isPostgres) {
    try {
      const pg = require('pg');
      const { PrismaPg } = require('@prisma/adapter-pg');
      const pool = new pg.Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        max: 5,
      });
      return new PrismaClient({ adapter: new PrismaPg(pool) });
    } catch (e) {
      console.warn('[Prisma] PG adapter failed:', e.message);
    }
  }

  if (isSqlite) {
    try {
      const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
      return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });
    } catch (e) {
      console.warn('[Prisma] SQLite adapter failed:', e.message);
    }
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
