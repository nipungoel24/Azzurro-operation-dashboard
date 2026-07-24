const { Client } = require('ssh2');
const conn = new Client();

const cmds = [
  'systemctl status postgresql 2>&1 | head -10 || echo "no pg service"',
  'psql --version 2>&1 || echo "no psql"',
  'ss -tlnp | grep 5432 || echo "port 5432 not listening"',
  'ls /etc/postgresql/ 2>/dev/null || echo "no pg config dir"',
  'cat /etc/postgresql/*/main/pg_hba.conf 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "no pg_hba"',
];

let i = 0;
conn.on('ready', () => { console.log('Checking VPS PostgreSQL...\n'); runNext(); })
  .on('error', e => { console.error(e.message); process.exit(1); });

function runNext() {
  if (i >= cmds.length) { console.log('\nDone.'); conn.end(); process.exit(0); return; }
  console.log('$ ' + cmds[i]);
  conn.exec(cmds[i++], (err, stream) => {
    if (err) { console.error('ERR:', err.message); runNext(); return; }
    stream.on('data', d => process.stdout.write(d.toString()));
    stream.stderr.on('data', d => process.stdout.write(d.toString()));
    stream.on('close', () => runNext());
  });
}

conn.connect({ host: '45.76.122.112', port: 22, username: 'nipun', password: '97=+BLd,yZX4{K}', readyTimeout: 10000 });
