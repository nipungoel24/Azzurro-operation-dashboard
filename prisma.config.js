try { require('dotenv/config'); } catch {}

const { defineConfig } = require('prisma/config');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
const isVercel = process.env.VERCEL === '1';

module.exports = defineConfig({
  schema: (isPostgres || isVercel) ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ? { value: process.env.DATABASE_URL } : { value: 'file:./dev.db' },
  },
});
