const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

let prisma;

if (isPostgres) {
  const pg = require('pg');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new pg.Pool({ connectionString: dbUrl });
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
} else {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: dbUrl }) });
}

const DEFAULT_PROPERTIES = [
  { name: 'Potts Point', code: 'POTTS', cloudbedsPropertyId: '311272', capacity: 107, declaredRooms: 27, declaredBeds: 107, declaredBathrooms: 5, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification', notes: '5 bathrooms declared. 6 facilities listed — needs review.' },
  { name: 'Surry Hills', code: 'SURRY', cloudbedsPropertyId: '311134', capacity: 72, declaredRooms: 24, declaredBeds: 74, declaredBathrooms: 16, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification', notes: 'Declared 74 beds but rooms total 72? Room 18 bathroom info conflicts.' },
  { name: 'Darling Harbour', code: 'DARL', cloudbedsPropertyId: '311271', capacity: 176, declaredRooms: 28, declaredBeds: 176, declaredBathrooms: 24, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification', notes: '24 bathrooms: 7 ensuite + 17 shared facilities.' },
  { name: 'Central Sydney', code: 'CENT', cloudbedsPropertyId: '311267', capacity: 48, declaredRooms: 12, declaredBeds: 48, declaredBathrooms: 6, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification', notes: 'Declared 12 rooms but 11 listed. Bathroom count conflicts (6 vs 7).' },
  { name: 'The Pyrmont Budget Hotel', code: 'PYRM', cloudbedsPropertyId: '311268', capacity: 14, declaredRooms: 14, declaredBeds: 18, declaredBathrooms: 13, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification', notes: '14 rooms x 2 beds = 28 vs 18 declared. 11 ensuite rooms vs 12 private declared.' },
  { name: 'Olympic Hotel', code: 'OLYM', capacity: 0, declaredRooms: 30, declaredBeds: 0, declaredBathrooms: 11, timezone: 'Australia/Sydney', verificationStatus: 'needs_verification', notes: '6 owner-occupied rooms. 11 detached bathrooms. No Cloudbeds integration.' },
];

async function main() {
  const email = 'nipun24.goel@gmail.com';
  const name = 'Nipun Goel';
  const rawPassword = 'azzurro_secure';
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  console.log(`[Seed] Checking for existing user: ${email}...`);
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    console.log(`[Seed] Creating default user...`);
    await prisma.user.create({
      data: { email, name, password: hashedPassword, role: 'administrator' },
    });
    console.log(`[Seed] User created! Email: ${email} / Pass: ${rawPassword}`);
  } else {
    console.log(`[Seed] User ${email} already exists.`);
  }

  console.log(`\n[Seed] Checking for default properties...`);
  for (const prop of DEFAULT_PROPERTIES) {
    const existing = await prisma.property.findFirst({ where: { code: prop.code } });
    if (!existing) {
      await prisma.property.create({ data: prop });
      console.log(`[Seed] Created property: ${prop.name} (${prop.code})`);
    } else {
      console.log(`[Seed] Property exists: ${prop.name}`);
    }
  }

  console.log(`\n[Seed] Done.`);
}

main()
  .catch((e) => { console.error('[Seed] Error:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
