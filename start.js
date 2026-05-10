// Wrapper: starts Next.js standalone server + built-in recurring payments CRON
const { spawn } = require('child_process');
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
const NEWS_CRON_INTERVAL_MS = Number(process.env.NEWS_CRON_INTERVAL_MS || 3 * 60 * 60 * 1000);
const CRON_SECRET = process.env.CRON_SECRET || 'adgena_cron_2026';
const PORT = process.env.PORT || 3000;

function callCron(url, label) {
  console.log(`[CRON] ${new Date().toISOString()} — ${label}...`);
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`[CRON] ${label} response: ${res.statusCode} — ${data.slice(0, 300)}`);
    });
  }).on('error', (err) => {
    console.error(`[CRON] ${label} error: ${err.message}`);
  });
}

function runRecurringCron() {
  callCron(`http://127.0.0.1:${PORT}/api/robokassa/recurring?secret=${CRON_SECRET}`, 'checking recurring payments');
}

function runNewsCron() {
  callCron(`http://127.0.0.1:${PORT}/api/cron/generate-news?secret=${CRON_SECRET}&limit=1&autoPublish=true&minQualityScore=80&maxAgeHours=48`, 'generating AI news');
}

// Wait 30s for server to start, then run every hour
setTimeout(() => {
  console.log('[CRON] Recurring payments scheduler started (every 1h)');
  runRecurringCron(); // first run
  setInterval(runRecurringCron, CRON_INTERVAL_MS);
  console.log(`[CRON] AI news scheduler started (every ${Math.round(NEWS_CRON_INTERVAL_MS / 60000)}m)`);
  runNewsCron();
  setInterval(runNewsCron, NEWS_CRON_INTERVAL_MS);
}, 30000);
