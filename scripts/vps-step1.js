const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

let stepNum = 0;
const results = [];

function run(cmd, label) {
  return new Promise((resolve) => {
    stepNum++;
    console.log(`\n[Step ${stepNum}] ${label}`);
    console.log(`$ ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error('ERR:', err.message); resolve(''); return; }
      let out = '';
      stream.on('data', d => { out += d.toString(); process.stdout.write(d.toString()); });
      stream.stderr.on('data', d => { out += d.toString(); process.stdout.write(d.toString()); });
      stream.on('close', () => { results.push({ label, out }); resolve(out); });
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

  // Step 1: Confirm Postgres is running
  await run('systemctl status postgresql --no-pager', 'Postgres service status');
  await run('sudo -u postgres psql -c "SELECT version();" 2>&1', 'Postgres version');
  await run('sudo -u postgres psql -c "SELECT usename FROM pg_user;" 2>&1', 'Existing Postgres users');

  // Check postgresql.conf for listen_addresses
  await run('sudo grep -r "listen_addresses" /etc/postgresql/*/main/postgresql.conf 2>&1', 'listen_addresses setting');

  // Check pg_hba.conf
  await run('sudo cat /etc/postgresql/*/main/pg_hba.conf 2>&1', 'pg_hba.conf contents');

  // Check firewall
  await run('sudo ufw status 2>&1', 'UFW firewall status');
  await run('ss -tlnp | grep 5432', 'Port 5432 listening');

  console.log('\n=== Step 1 Complete ===');
  conn.end();
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
