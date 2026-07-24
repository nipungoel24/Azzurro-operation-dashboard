const { Client } = require('ssh2');
const conn = new Client();

const steps = [
  'mkdir -p /home/nipun 2>&1; echo "mkdir: $?"',
  'ls /home/ 2>&1',
  'git clone https://github.com/nipungoel24/Azzurro-operation-dashboard.git /home/nipun/Operation-Dashboard 2>&1 || echo "clone failed"',
  'cd /home/nipun/Operation-Dashboard && ls package.json 2>&1',
  'cd /home/nipun/Operation-Dashboard && npm install 2>&1 | tail -10',
  'cd /home/nipun/Operation-Dashboard && npx prisma generate 2>&1',
  'cd /home/nipun/Operation-Dashboard && npm run build 2>&1 | tail -15',
  'cd /home/nipun/Operation-Dashboard && pm2 start ecosystem.config.cjs 2>&1 && pm2 save 2>&1',
  'pm2 list 2>&1',
];

let i = 0;
conn.on('ready', () => {
  console.log('Connected!\n');
  runNext();
}).on('error', (e) => { console.error(e.message); process.exit(1); });

function runNext() {
  if (i >= steps.length) { console.log('\nDone.'); conn.end(); process.exit(0); return; }
  const cmd = steps[i++];
  console.log(`\n[${i}] $ ${cmd.substring(0, 90)}`);
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error('ERR:', err.message); runNext(); return; }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => runNext());
  });
}

conn.connect({ host: '45.76.122.112', port: 22, username: 'nipun', password: '97=+BLd,yZX4{K}', readyTimeout: 15000 });
