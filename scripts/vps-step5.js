const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
const SUDO_PASS = '97=+BLd,yZX4{K}\n';

function runSudo(cmd, label) {
  return new Promise((resolve) => {
    console.log(`\n[${label}]`);
    conn.exec(cmd, (err, stream) => {
      if (err) { console.error('ERR:', err.message); resolve(''); return; }
      let out = '';
      stream.on('data', d => {
        const s = d.toString();
        out += s;
        process.stdout.write(s);
        // Send password when sudo prompts
        if (s.includes('password for nipun') || s.includes('[sudo] password')) {
          stream.write(SUDO_PASS);
        }
      });
      stream.stderr.on('data', d => {
        const s = d.toString();
        out += s;
        process.stdout.write(s);
        if (s.includes('password for nipun') || s.includes('[sudo] password')) {
          stream.write(SUDO_PASS);
        }
      });
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

  // Test sudo with password
  await runSudo('sudo -S whoami 2>&1', 'sudo whoami');

  // Check PostgreSQL config
  await runSudo('sudo -S cat /etc/postgresql/17/main/pg_hba.conf 2>&1', 'pg_hba.conf');
  await runSudo('sudo -S grep -i listen /etc/postgresql/17/main/postgresql.conf 2>&1', 'listen_addresses');
  await runSudo('sudo -S grep -i ssl /etc/postgresql/17/main/postgresql.conf 2>&1', 'SSL config');

  // Access postgres directly
  await runSudo('sudo -u postgres psql -c "SELECT current_user, version();" 2>&1', 'postgres access');
  await runSudo('sudo -u postgres psql -c "SELECT usename FROM pg_user;" 2>&1', 'existing users');
  await runSudo('sudo -u postgres psql -c "SELECT datname FROM pg_database;" 2>&1', 'existing databases');

  console.log('\n=== Done ===');
  conn.end();
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
