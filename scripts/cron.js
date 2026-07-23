// Scheduled tasks worker for Azzurro Operations Dashboard
// Runs hourly via PM2 cron. Safe to call repeatedly — all operations are idempotent.

require('dotenv/config');

const { PrismaClient } = require('@prisma/client');

let adapter;
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

if (isPostgres) {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pg = require('pg');
  const pool = new pg.Pool({ connectionString: dbUrl });
  adapter = new PrismaPg(pool);
} else {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  adapter = new PrismaBetterSqlite3({ url: dbUrl });
}

const prisma = new PrismaClient({ adapter });

async function checkOverdueTasks() {
  const today = new Date().toISOString().split('T')[0];
  const overdue = await prisma.scheduledTask.findMany({
    where: {
      status: { in: ['scheduled', 'in_progress'] },
      scheduledStart: { lt: today },
    },
  });

  for (const task of overdue) {
    await prisma.scheduledTask.update({
      where: { id: task.id },
      data: { status: 'overdue' },
    });
    console.log(`[Cron] Marked overdue: ${task.title}`);
  }

  return overdue.length;
}

async function runSyncIfConfigured() {
  const keys = [
    process.env.CB_KEY_DARLING,
    process.env.CB_KEY_CENTRAL,
    process.env.CB_KEY_SURRY,
    process.env.CB_KEY_POTTS,
    process.env.CB_KEY_PYRMONT,
  ].filter(Boolean);

  if (keys.length === 0) {
    console.log('[Cron] No Cloudbeds API keys configured. Skipping sync.');
    return;
  }

  console.log('[Cron] Running Cloudbeds sync...');
  try {
    const { fetchOccupancyData } = require('./src/services/cloudbeds');
    const today = new Date().toISOString().split('T')[0];
    await fetchOccupancyData(today);
    console.log('[Cron] Sync complete.');
  } catch (err) {
    console.error('[Cron] Sync failed:', err.message);
  }
}

async function main() {
  console.log(`[Cron] Starting hourly run at ${new Date().toISOString()}`);

  try {
    const overdueCount = await checkOverdueTasks();
    console.log(`[Cron] Overdue tasks updated: ${overdueCount}`);
  } catch (err) {
    console.error('[Cron] checkOverdueTasks failed:', err.message);
  }

  try {
    await runSyncIfConfigured();
  } catch (err) {
    console.error('[Cron] Sync failed:', err.message);
  }

  console.log('[Cron] Run complete.');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[Cron] Fatal:', err.message);
  process.exit(1);
});
