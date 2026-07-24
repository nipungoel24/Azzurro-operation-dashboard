const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

function run(cmd, label) {
  return new Promise((resolve) => {
    console.log(`\n[${label}] $ ${cmd}`);
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

  // Check groups
  await run('groups', 'User groups');
  
  // Can we access postgres directly?
  await run('psql --version 2>&1', 'psql version');
  await run('PGPASSWORD="" psql -h localhost -U postgres -c "SELECT 1;" 2>&1 || echo "no direct access"', 'Direct psql access');
  
  // Check postgres config file permissions
  await run('ls -la /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/postgresql.conf 2>&1', 'Config file permissions');
  
  // Read configs without sudo
  await run('cat /etc/postgresql/*/main/pg_hba.conf 2>&1', 'pg_hba.conf');
  await run('cat /etc/postgresql/*/main/postgresql.conf 2>&1 | grep -i listen', 'listen_addresses');

  // Check if we have a .pgpass or env
  await run('cat ~/.pgpass 2>&1 || echo "no .pgpass"', '.pgpass file');
  await run('echo $PGPASSWORD; echo $PGHOST', 'PG env vars');

  // Try su to postgres
  await run('su - postgres -c "psql -c \\"SELECT 1;\\"" 2>&1 || echo "su failed"', 'su to postgres');

  console.log('\n=== Done ===');
  conn.end();
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
