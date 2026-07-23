require('dotenv/config');
const { defineConfig, env } = require('prisma/config');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

module.exports = defineConfig({
  schema: isPostgres ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.prisma',
  migrations: {
    seed: 'node prisma/seed.js',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
