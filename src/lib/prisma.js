import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

let adapter;

if (isPostgres) {
  const pg = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new pg.Pool({ connectionString: dbUrl });
  adapter = new PrismaPg(pool);
} else {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  adapter = new PrismaBetterSqlite3({ url: dbUrl });
}

const globalForPrisma = global;

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
