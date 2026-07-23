import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = global;

const DEFAULT_PROPERTIES = [
  { name: 'Potts Point', code: 'POTTS', cloudbedsPropertyId: '311272', capacity: 107, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification' },
  { name: 'Surry Hills', code: 'SURRY', cloudbedsPropertyId: '311134', capacity: 72, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification' },
  { name: 'Darling Harbour', code: 'DARL', cloudbedsPropertyId: '311271', capacity: 176, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification' },
  { name: 'Central Sydney', code: 'CENT', cloudbedsPropertyId: '311267', capacity: 48, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification' },
  { name: 'The Pyrmont Budget Hotel', code: 'PYRM', cloudbedsPropertyId: '311268', capacity: 14, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification' },
  { name: 'Olympic Hotel', code: 'OLYM', capacity: 0, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification' },
];

async function ensureDatabaseReady(client) {
  try {
    await client.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
      name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'viewer'
    )`);
    await client.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS Property (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, address TEXT,
      cloudbedsPropertyId TEXT, capacity INTEGER DEFAULT 0, timezone TEXT DEFAULT 'Australia/Sydney',
      verificationStatus TEXT DEFAULT 'needs_verification', active INTEGER DEFAULT 1,
      notes TEXT, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
    )`);
  } catch (err) {
    console.error('[prisma] Schema init failed:', err.message);
  }
  try {
    const adminEmail = 'nipun24.goel@gmail.com';
    const existing = await client.user.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      await client.user.create({
        data: {
          email: adminEmail,
          name: 'Nipun Goel',
          password: bcrypt.hashSync('azzurro_secure', 10),
          role: 'administrator',
        },
      });
      console.log('[prisma] Auto-seeded admin user:', adminEmail);
    }
  } catch (err) {
    console.error('[prisma] Auto-seed user failed:', err.message);
  }

  try {
    for (const prop of DEFAULT_PROPERTIES) {
      const exists = await client.property.findFirst({ where: { code: prop.code } });
      if (!exists) {
        await client.property.create({ data: prop });
      }
    }
  } catch (err) {
    console.error('[prisma] Auto-seed properties failed:', err.message);
  }
}

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

if (!globalForPrisma._seeded) {
  globalForPrisma._seeded = true;
  ensureDatabaseReady(prisma);
}
