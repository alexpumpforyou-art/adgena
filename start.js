// Wrapper: starts Next.js standalone server + built-in recurring payments CRON
const { execSync, spawn } = require('child_process');
const http = require('http');

// --- Start Next.js ---
const server = spawn('node', ['.next/standalone/server.js'], {
  stdio: 'inherit',
  env: { ...process.env, HOSTNAME: '0.0.0.0' },
});

server.on('close', (code) => {
  console.log(`[Server] Exited with code ${code}`);
  process.exit(code);
});

// --- Built-in CRON for recurring payments ---
const CRON_INTERVAL_MS = 60 * 60 * 1000; // every 1 hour
const CRON_SECRET = process.env.CRON_SECRET || 'adgena_cron_2026';
const PORT = process.env.PORT || 3000;

function runRecurringCron() {
  const url = `http://127.0.0.1:${PORT}/api/robokassa/recurring?secret=${CRON_SECRET}`;
  console.log(`[CRON] ${new Date().toISOString()} — checking recurring payments...`);

  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[CRON] Response: ${res.statusCode} — ${data.slice(0, 200)}`);
    });
  }).on('error', (err) => {
    console.error(`[CRON] Error: ${err.message}`);
  });
}

// Wait 30s for server to start, then run every hour
setTimeout(() => {
  console.log('[CRON] Recurring payments scheduler started (every 1h)');
  runRecurringCron(); // first run
  setInterval(runRecurringCron, CRON_INTERVAL_MS);
}, 30000);
