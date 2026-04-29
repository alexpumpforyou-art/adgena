import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PLANS = {
  lite:     { limit: 10 },
  standard: { limit: 35 },
  pro:      { limit: 100 },
  business: { limit: 300 },
};

function verifySignature(outSum, invId, password2, shpParams) {
  // Shp_ params must be sorted alphabetically
  const shpStr = Object.keys(shpParams)
    .sort()
    .map(k => `${k}=${shpParams[k]}`)
    .join(':');

  const str = shpStr
    ? `${outSum}:${invId}:${password2}:${shpStr}`
    : `${outSum}:${invId}:${password2}`;

  return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

// POST — Robokassa Result URL callback (server-to-server)
export async function POST(request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    return processResult(params);
  } catch (error) {
    console.error('[Robokassa Result] POST error:', error);
    return new NextResponse('ERROR', { status: 500 });
  }
}

// GET — fallback (some configs send GET)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    return processResult(searchParams);
  } catch (error) {
    console.error('[Robokassa Result] GET error:', error);
    return new NextResponse('ERROR', { status: 500 });
  }
}

async function processResult(params) {
  const outSum = params.get('OutSum');
  const invId = params.get('InvId');
  const signatureValue = params.get('SignatureValue');

  // Extract Shp_ params
  const shpParams = {};
  for (const [key, value] of params.entries()) {
    if (key.startsWith('Shp_')) {
      shpParams[key] = value;
    }
  }

  const userId = shpParams['Shp_userId'];
  const planId = shpParams['Shp_planId'];

  console.log(`[Robokassa Result] InvId=${invId}, OutSum=${outSum}, userId=${userId}, plan=${planId}`);

  const password2 = process.env.ROBOKASSA_PASSWORD2;

  if (!password2) {
    console.error('[Robokassa Result] Missing ROBOKASSA_PASSWORD2');
    return new NextResponse('ERROR: config', { status: 500 });
  }

  // Verify signature
  const expectedSig = verifySignature(outSum, invId, password2, shpParams);

  if (expectedSig !== signatureValue?.toUpperCase()) {
    console.error(`[Robokassa Result] Invalid signature. Expected: ${expectedSig}, Got: ${signatureValue}`);
    return new NextResponse('ERROR: bad signature', { status: 403 });
  }

  // Signature valid — activate plan
  if (!userId || !planId || !PLANS[planId]) {
    console.error(`[Robokassa Result] Invalid params: userId=${userId}, planId=${planId}`);
    return new NextResponse(`OK${invId}`, { status: 200 });
  }

  try {
    const db = require('@/lib/db').default;
    const d = db();

    const plan = PLANS[planId];

    // Update user plan
    d.prepare(`
      UPDATE users 
      SET plan = ?, generations_limit = ?, generations_used = 0, updated_at = datetime('now') 
      WHERE id = ?
    `).run(planId, plan.limit, userId);

    // Log payment
    try {
      d.prepare(`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          inv_id TEXT,
          plan TEXT,
          amount REAL,
          status TEXT DEFAULT 'completed',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      d.prepare(`
        INSERT INTO payments (id, user_id, inv_id, plan, amount) 
        VALUES (?, ?, ?, ?, ?)
      `).run(crypto.randomUUID(), userId, invId, planId, parseFloat(outSum));
    } catch (logErr) {
      console.error('[Robokassa Result] Payment log error:', logErr.message);
    }

    console.log(`[Robokassa Result] SUCCESS — User ${userId} upgraded to ${planId}`);
  } catch (dbErr) {
    console.error('[Robokassa Result] DB error:', dbErr.message);
  }

  // Must respond with OK{InvId} for Robokassa to confirm
  return new NextResponse(`OK${invId}`, { status: 200 });
}
