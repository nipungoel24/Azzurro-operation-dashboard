export const dynamic = 'force-dynamic';

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

function getPgPool() {
  const { Pool } = require('pg');
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

function createClient() {
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  const isSqlite = dbUrl.startsWith('file:');

  if (isPostgres) {
    try {
      const { PrismaPg } = require('@prisma/adapter-pg');
      return new PrismaClient({ adapter: new PrismaPg(getPgPool()) });
    } catch {}
  }

  if (isSqlite) {
    try {
      const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
      return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });
    } catch {}
  }

  return new PrismaClient();
}

let _prisma = null;
function getPrisma() {
  if (_prisma) return _prisma;
  _prisma = createClient();
  return _prisma;
}

const handler = { get(_, prop) { return getPrisma()[prop]; } };

export const prisma = globalForPrisma.prismaProxy || new Proxy({}, handler);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaProxy = prisma;
}
