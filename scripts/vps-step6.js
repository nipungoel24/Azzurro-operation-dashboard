const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

function run(cmd, label) {
  return new Promise((resolve) => {
    console.log(`\n[${label}]`);
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error('ERR:', err.message); resolve(''); return; }
      let out = '';
      stream.on('data', d => { out += d.toString(); process.stdout.write(d.toString()); });
      stream.stderr.on('data', d => { out += d.toString(); process.stdout.write(d.toString()); });
      stream.on('close', () => resolve(out));
    });
  });
}

async function main() {
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject);
    conn.connect({
      host: '45.76.122.112', port: 22, username: 'nipun',
      privateKey: fs.readFileSync('C:\\Users\\Nipun\\.ssh\\id_ed25519'),
      readyTimeout: 15000,
    });
  });
  console.log('Connected!');

  // Read postgresql.conf (world-readable)
  await run('cat /etc/postgresql/17/main/postgresql.conf 2>&1', 'postgresql.conf');

  // Check ssh authorized_keys and env
  await run('cat ~/.ssh/authorized_keys 2>&1 | head -3', 'SSH keys');
  await run('cat ~/.profile ~/.bashrc 2>/dev/null | grep -i pass 2>&1 || echo "no pass refs"', 'Shell config for passwords');

  // Check Postgres port config
  await run('grep "^port" /etc/postgresql/17/main/postgresql.conf 2>&1', 'Postgres port');
  
  // Check if Postgres listening
  await run('ss -tlnp | grep 5432', 'Port 5432 status');

  // Check for any .env or database files
  await run('find /home/nipun -name ".env*" -o -name "DATABASE*" 2>/dev/null | head -10', 'Env files in home');

  console.log('\n=== Done ===');
  conn.end();
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
