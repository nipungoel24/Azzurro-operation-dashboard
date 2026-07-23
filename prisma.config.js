try { require('dotenv/config'); } catch {}

const { defineConfig } = require('prisma/config');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

module.exports = defineConfig({
  schema: isPostgres ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.prisma',
  datasource: {
    url: { value: dbUrl || 'file:./dev.db' },
  },
});
