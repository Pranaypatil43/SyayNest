/**
 * dev.js — starts backend then frontend, works on Windows/Mac/Linux
 * Run with: node dev.js
 */
const { spawn } = require('child_process');
const http = require('http');

const SERVER_PORT = 8080;
const POLL_INTERVAL = 500;  // ms between checks
const MAX_WAIT = 30000;     // 30 seconds max

function log(prefix, data) {
  String(data).split('\n').filter(l => l.trim()).forEach(l => {
    console.log(`[${prefix}] ${l}`);
  });
}

function spawnProc(name, cmd, args, cwd) {
  const p = spawn(cmd, args, { cwd, shell: true });
  p.stdout.on('data', d => log(name, d));
  p.stderr.on('data', d => log(name, d));
  p.on('exit', code => {
    if (code !== 0 && code !== null) {
      console.error(`\n[${name}] exited with code ${code} — stopping everything.\n`);
      process.exit(1);
    }
  });
  return p;
}

function waitForServer(port, timeout) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http.get(`http://localhost:${port}/api/listings`, res => {
        res.resume();
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error(`Backend did not start within ${timeout / 1000}s`));
        } else {
          setTimeout(check, POLL_INTERVAL);
        }
      });
    };
    check();
  });
}

async function main() {
  console.log('Starting backend…');
  const server = spawnProc(
    'server',
    'node',
    ['app.js'],
    __dirname
  );

  console.log(`Waiting for backend on port ${SERVER_PORT}…`);
  try {
    await waitForServer(SERVER_PORT, MAX_WAIT);
  } catch (e) {
    console.error(e.message);
    server.kill();
    process.exit(1);
  }

  console.log('Backend ready — starting Vite…');
  const client = spawnProc(
    'client',
    'npm',
    ['run', 'dev'],
    `${__dirname}/client`
  );

  // Forward Ctrl+C to both
  process.on('SIGINT', () => {
    server.kill();
    client.kill();
    process.exit(0);
  });
}

main();
