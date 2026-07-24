const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

function runPty(cmd, label) {
  return new Promise((resolve) => {
    console.log(`\n[${label}] Running...`);
    conn.exec(cmd, { pty: true }, (err, stream) => {
      if (err) { console.error('ERR:', err.message); resolve(''); return; }
      let out = '';
      stream.on('data', d => {
        out += d.toString();
        // If sudo asks for password and we don't know it, just end early
        if (out.includes('password for nipun')) {
          console.log('(sudo requires password - skipping)');
          stream.close();
          resolve(out);
        }
      });
      stream.stderr.on('data', d => out += d.toString());
      stream.on('close', () => {
        if (out.length > 0 && !out.includes('password for nipun')) {
          process.stdout.write(out);
        }
        resolve(out);
      });
      // Close after timeout if stuck on password
      setTimeout(() => { stream.close(); }, 5000);
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

  // Check what files we can read without sudo
  await runPty('ls -la /etc/postgresql/17/main/*.conf 2>&1', 'Config file permissions');
  await runPty('id', 'Current user info');
  
  // Try to su to postgres
  await runPty('su postgres -c "whoami" 2>&1', 'su to postgres test');
  
  // Check if we can connect to psql locally with peer auth
  await runPty('sudo -u postgres psql -c "SELECT 1;" 2>&1', 'sudo postgres psql');

  console.log('\n=== Done ===');
  conn.end();
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
