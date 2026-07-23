# Azzurro Operations Dashboard — Deployment Guide

## VPS Details
- **Provider:** Vultr
- **IP:** 45.76.122.112
- **User:** nipun
- **OS:** Ubuntu (via SSH)

## Pre-Deployment Checklist
1. Ensure PostgreSQL is running on the VPS
2. Copy `.env.example` to `.env` on the server and fill in all values
3. Run database backup before migration
4. Verify Node.js >= 18 is installed

## Environment Variables Required

```bash
# Database (PostgreSQL for Vultr production)
DATABASE_URL="postgresql://user:password@localhost:5432/azzurro_ops?schema=public"

# NextAuth
NEXTAUTH_SECRET="<generate-random-64-char-string>"
NEXTAUTH_URL="http://45.76.122.112:3000"

# DeepSeek Chatbot
DEEPSEEK_API_KEY="sk-..."

# Cloudbeds (5 properties)
CB_KEY_DARLING="..."
CB_KEY_CENTRAL="..."
CB_KEY_SURRY="..."
CB_KEY_POTTS="..."
CB_KEY_PYRMONT="..."

# Optional - Property Secrets Encryption
PROPERTY_SECRETS_ENCRYPTION_KEY="<generate-random-32-char-string>"
```

## Deployment Commands

### 1. Build Locally & Transfer

```bash
# On local machine:
npm run build
# The output is in .next/

# Transfer to VPS:
scp -r .next prisma package.json package-lock.json nipun@45.76.122.112:~/operation-dashboard/
```

### 2. On VPS (Production Setup)

```bash
# Install production dependencies only
cd ~/operation-dashboard
npm ci --production

# Run database migration
npx prisma db push --schema=prisma/schema.postgresql.prisma

# Seed the default admin user
node prisma/seed.js

# Import property inventory
node scripts/import-inventory.js
```

### 3. Start with PM2 (Recommended)

```bash
# Install PM2 if not present
npm install -g pm2

# Create ecosystem file:
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'azzurro-ops-dashboard',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    env: {
      NODE_ENV: 'production',
    },
    autorestart: true,
    max_memory_restart: '1G',
    instances: 1,
    exec_mode: 'fork',
  }]
};
EOF

# Start
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # follow the prompted command to enable boot-start
```

### 4. Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name operations.azzurrohotels.com 45.76.122.112;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10m;
}
```

### 5. Scheduler (Cron Jobs)

Add to crontab (`crontab -e`):

```cron
# Check overdue tasks every hour
0 * * * * curl -X POST http://localhost:3000/api/scheduled-tasks/check-overdue

# Detect missing updates at 4 PM Sydney time
0 6 * * * curl http://localhost:3000/api/scheduled-tasks/missing-updates?cutoff=16:00

# Cloudbeds sync every 30 minutes (during business hours)
*/30 0-12 * * * curl -X POST http://localhost:3000/api/empty-rooms/sync
```

### 6. Start/Restart Commands

```bash
pm2 restart azzurro-ops-dashboard
pm2 logs azzurro-ops-dashboard
pm2 status
pm2 stop azzurro-ops-dashboard
```

## Rollback Procedure

### If Database Migration Needs Rollback

```bash
# 1. Restore database from backup before migration
psql $DATABASE_URL < backup_before_migration.sql

# 2. Re-deploy previous version
cd ~/operation-dashboard
git checkout <previous-commit>
npm ci
npx prisma db push --schema=prisma/schema.postgresql.prisma
pm2 restart azzurro-ops-dashboard
```

### If Application Rollback Needed

```bash
cd ~/operation-dashboard
git checkout <previous-stable-commit>
npm ci --production
npm run build
pm2 restart azzurro-ops-dashboard
```

### Revert Imported Inventory

```bash
# Find the import batch ID from AuditLog
node -e "
  const { PrismaClient } = require('@prisma/client');
  // ... query BatchLog for last import
"

# Or revert via API:
curl -X POST http://localhost:3000/api/revert \
  -H 'Content-Type: application/json' \
  -d '{"batchId": "<import-batch-id>"}'
```

## Monitoring

```bash
pm2 monit              # Real-time CPU/memory
pm2 logs --lines 100   # View logs
curl http://localhost:3000/api/scheduled-tasks/summary  # Health check
```
