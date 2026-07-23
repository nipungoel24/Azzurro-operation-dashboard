// PM2 Ecosystem Config for Azzurro Operations Dashboard
// Deploy: pm2 start ecosystem.config.cjs
// Save: pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: 'azzurro-dashboard',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/azzurro_dashboard',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
        DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
        CB_KEY_DARLING: process.env.CB_KEY_DARLING,
        CB_KEY_CENTRAL: process.env.CB_KEY_CENTRAL,
        CB_KEY_SURRY: process.env.CB_KEY_SURRY,
        CB_KEY_POTTS: process.env.CB_KEY_POTTS,
        CB_KEY_PYRMONT: process.env.CB_KEY_PYRMONT,
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
        DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
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
