// PM2 Ecosystem Config for Azzurro Operations Dashboard
// Deploy: pm2 start ecosystem.config.cjs
// Save: pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: 'azzurro-dashboard',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/azzurro_ops?schema=public',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'azzurro_ops_nextauth_secret_change_me',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://45.76.122.112:3000',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        CB_KEY_DARLING: process.env.CB_KEY_DARLING,
        CB_KEY_CENTRAL: process.env.CB_KEY_CENTRAL,
        CB_KEY_SURRY: process.env.CB_KEY_SURRY,
        CB_KEY_POTTS: process.env.CB_KEY_POTTS,
        CB_KEY_PYRMONT: process.env.CB_KEY_PYRMONT,
        PROPERTY_SECRETS_ENCRYPTION_KEY: process.env.PROPERTY_SECRETS_ENCRYPTION_KEY || '',
      },
      max_memory_restart: '512M',
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
    {
      name: 'azzurro-cron',
      script: 'scripts/cron.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 * * * *', // Every hour
      autorestart: false,
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/azzurro_ops?schema=public',
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        CB_KEY_DARLING: process.env.CB_KEY_DARLING,
        CB_KEY_CENTRAL: process.env.CB_KEY_CENTRAL,
        CB_KEY_SURRY: process.env.CB_KEY_SURRY,
        CB_KEY_POTTS: process.env.CB_KEY_POTTS,
        CB_KEY_PYRMONT: process.env.CB_KEY_PYRMONT,
      },
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
