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
  console.log('Connected!\n');

  // Try sudo -n
  await run('sudo -n whoami 2>&1', 'sudo -n test');
  
  // Read pg_hba with sudo -n
  await run('sudo -n cat /etc/postgresql/17/main/pg_hba.conf 2>&1', 'pg_hba.conf');
  await run('sudo -n grep listen_addresses /etc/postgresql/17/main/postgresql.conf 2>&1', 'listen_addresses');

  // Get postgres password or reset it
  await run('sudo -n -u postgres psql -c "SELECT current_user;" 2>&1', 'psql as postgres');
  await run('sudo -n -u postgres psql -c "SELECT usename FROM pg_user;" 2>&1', 'existing users');

  // Check if pw is needed
  await run('sudo -n -u postgres psql -c "SELECT 1;" 2>&1', 'test postgres access');

  // Check ssl
  await run('sudo -n grep ssl /etc/postgresql/17/main/postgresql.conf 2>&1', 'SSL config');

  console.log('\n=== Done ===');
  conn.end();
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
