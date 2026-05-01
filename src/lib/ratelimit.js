/**
 * Simple in-memory rate limiter (token bucket + concurrency tracker).
 *
 * WARNING: This is PER INSTANCE. If Railway scales to multiple replicas,
 * each replica has its own bucket. For now we run 1 replica, so this is fine.
 * If you scale horizontally, swap this out for Upstash Redis.
 */

// ----- Token bucket -----
// Each key (e.g. "ip:1.2.3.4" or "user:abc") gets its own bucket.
// Tokens refill at `refillRate` per second, max `capacity`.

const buckets = new Map();

/**
 * Try to consume 1 token for `key`. Returns { ok, retryAfterMs }.
 *
 * @param {string} key          stable identifier (ip, user id, email)
 * @param {number} capacity     max tokens in bucket
 * @param {number} refillPerSec tokens added per second
 */
export function consumeToken(key, capacity = 5, refillPerSec = 1 / 12) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: capacity, last: now };
    buckets.set(key, b);
  } else {
    // Refill
    const elapsedSec = (now - b.last) / 1000;
    b.tokens = Math.min(capacity, b.tokens + elapsedSec * refillPerSec);
    b.last = now;
  }
  if (b.tokens >= 1) {
    b.tokens -= 1;
    return { ok: true, retryAfterMs: 0 };
  }
  const deficit = 1 - b.tokens;
  const retryAfterMs = Math.ceil((deficit / refillPerSec) * 1000);
  return { ok: false, retryAfterMs };
}

// ----- Concurrency tracker -----
// How many in-flight requests `key` currently holds.

const inflight = new Map();

export function tryAcquireSlot(key, max = 2) {
  const current = inflight.get(key) || 0;
  if (current >= max) return false;
  inflight.set(key, current + 1);
  return true;
}

export function releaseSlot(key) {
  const current = inflight.get(key) || 0;
  if (current <= 1) inflight.delete(key);
  else inflight.set(key, current - 1);
}

// ----- Helper: extract client IP from Next.js request -----
export function getClientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  // Cloudflare / generic
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

// ----- GC: evict old buckets every few minutes so Map doesn't grow unbounded -----
let gcStarted = false;
function startGc() {
  if (gcStarted) return;
  gcStarted = true;
  setInterval(() => {
    const cutoff = Date.now() - 10 * 60 * 1000; // 10 min idle
    for (const [k, b] of buckets) {
      if (b.last < cutoff && b.tokens >= 5) buckets.delete(k);
    }
  }, 5 * 60 * 1000).unref?.();
}
startGc();
