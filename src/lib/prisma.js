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

const SCHEMA_SQL = [
  `CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'viewer')`,
  `CREATE TABLE IF NOT EXISTS Property (id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT, address TEXT, closestStations TEXT, timezone TEXT DEFAULT 'Australia/Sydney', cloudbedsPropertyId TEXT, cloudbedsApiKey TEXT, capacity INTEGER DEFAULT 0, declaredBeds INTEGER, declaredRooms INTEGER, declaredBathrooms INTEGER, declaredPrivateBathrooms INTEGER, declaredSharedBathrooms INTEGER, verificationStatus TEXT DEFAULT 'needs_verification', active INTEGER DEFAULT 1, notes TEXT, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS Task (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'To do', property TEXT NOT NULL, responsible TEXT NOT NULL, dueDate TEXT, lastUpdated TEXT, recurrence TEXT DEFAULT 'none', reminderActive INTEGER DEFAULT 0, reminderTime TEXT, snoozeDuration INTEGER DEFAULT 10, reminderTriggered INTEGER DEFAULT 0, updates TEXT DEFAULT '[]', created_by_email TEXT, updated_by_email TEXT, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS ScheduledTask (id TEXT PRIMARY KEY, propertyId TEXT, propertyName TEXT, facilityId TEXT, roomId TEXT, templateId TEXT, category TEXT, title TEXT NOT NULL, description TEXT, instructions TEXT, scheduledStart TEXT, scheduledEnd TEXT, shift TEXT, assigneeId TEXT, assigneeName TEXT, assignedRole TEXT, priority TEXT DEFAULT 'medium', status TEXT DEFAULT 'scheduled', recurrenceReference TEXT, generatedSource TEXT, incompleteReason TEXT, completionNotes TEXT, completedAt TEXT, createdBy TEXT, createdByName TEXT, updatedBy TEXT, updatedByName TEXT, handoffNotes TEXT, parentTaskId TEXT, version INTEGER DEFAULT 1, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS AuditLog (id TEXT PRIMARY KEY, entityType TEXT DEFAULT 'task', entityId TEXT NOT NULL, action TEXT NOT NULL, changedByEmail TEXT, changedByName TEXT, actorRole TEXT, source TEXT DEFAULT 'ui', summary TEXT, reason TEXT, oldData TEXT, newData TEXT, correlationId TEXT, batchId TEXT, revertedAuditId TEXT, task_id TEXT, task_title TEXT, action_type TEXT, changed_by_email TEXT, old_data TEXT, new_data TEXT, timestamp TEXT DEFAULT (datetime('now')), createdAt TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS Room (id TEXT PRIMARY KEY, propertyId TEXT, propertyCode TEXT, cloudbedsRoomId TEXT, roomNumber TEXT NOT NULL, normalizedRoomKey TEXT, building TEXT, floor TEXT, bedCount INTEGER, bedDescription TEXT, roomType TEXT, roomSize TEXT, bathroomArrangement TEXT, assignedBathroomId TEXT, isEnsuite INTEGER DEFAULT 0, isDetachedPrivate INTEGER DEFAULT 0, hasSharedBathroom INTEGER DEFAULT 0, ownerOccupied INTEGER DEFAULT 0, cleaningRequired INTEGER DEFAULT 1, fridge INTEGER DEFAULT 0, airConditioning TEXT, storage TEXT, rcdBedsidePlugs INTEGER, roomSetup TEXT, operationalNotes TEXT, verificationStatus TEXT DEFAULT 'imported_unverified', active INTEGER DEFAULT 1, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS Facility (id TEXT PRIMARY KEY, propertyId TEXT, propertyCode TEXT, roomId TEXT, assignedRoomId TEXT, type TEXT NOT NULL, name TEXT NOT NULL, bathroomType TEXT, building TEXT, floor TEXT, floorOrArea TEXT, locationDescription TEXT, isShared INTEGER DEFAULT 0, isPrivate INTEGER DEFAULT 0, isEnsuite INTEGER DEFAULT 0, showerCount INTEGER, toiletCount INTEGER, cleaningRequired INTEGER DEFAULT 1, ownerOccupied INTEGER DEFAULT 0, active INTEGER DEFAULT 1, verificationStatus TEXT DEFAULT 'needs_verification', lastDeepCleanedAt TEXT, lastVentCleanedAt TEXT, cleaningRequirements TEXT, defaultTaskFrequency TEXT, maintenanceNotes TEXT, notes TEXT, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS EmptyRoomSnapshot (id TEXT PRIMARY KEY, propertyId TEXT NOT NULL, propertyName TEXT NOT NULL, externalRoomId TEXT, roomNumber TEXT NOT NULL, roomName TEXT, roomType TEXT, occupancyStatus TEXT, cleaningStatus TEXT, lastDeparture TEXT, nextArrival TEXT, deepCleanRequired INTEGER DEFAULT 0, pestSprayRequired INTEGER DEFAULT 0, existingTaskId TEXT, syncRunId TEXT, dataSource TEXT DEFAULT 'cloudbeds', syncWarning TEXT, syncedAt TEXT DEFAULT (datetime('now')), createdAt TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS ShiftHandoff (id TEXT PRIMARY KEY, propertyId TEXT, propertyName TEXT, shiftFrom TEXT, shiftTo TEXT, preparedBy TEXT, preparedByName TEXT, notes TEXT, acknowledged INTEGER DEFAULT 0, acknowledgedBy TEXT, acknowledgedAt TEXT, taskIds TEXT, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')))`,
  `CREATE TABLE IF NOT EXISTS CloudbedsSyncRun (id TEXT PRIMARY KEY, propertyId TEXT, propertyName TEXT, status TEXT DEFAULT 'running', roomsFound INTEGER DEFAULT 0, roomsUpdated INTEGER DEFAULT 0, errors TEXT, startedAt TEXT DEFAULT (datetime('now')), completedAt TEXT)`,
  `CREATE TABLE IF NOT EXISTS ChatConversation (id TEXT PRIMARY KEY, userId TEXT, userEmail TEXT, messages TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now')))`,
];

async function ensureDatabaseReady(client) {
  try {
    for (const sql of SCHEMA_SQL) {
      await client.$executeRawUnsafe(sql);
    }
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
