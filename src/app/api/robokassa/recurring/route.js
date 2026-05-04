import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';
import crypto from 'crypto';

/**
 * CRON endpoint — processes recurring (child) payments via Robokassa.
 * Call daily via external CRON (e.g., cron-job.org) with: GET /api/robokassa/recurring?secret=YOUR_SECRET
 *
 * Flow:
 * 1. Find all active subscriptions where next_charge_at <= now
 * 2. For each, send a POST to Robokassa's recurring endpoint with PreviousInvoiceID
 * 3. Robokassa charges the card and sends result to the normal Result URL callback
 * 4. Result callback updates plan, resets generations, extends next_charge_at
 */

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  const cronSecret = process.env.CRON_SECRET || 'adgena_cron_2026';
  if (secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
  const password1 = process.env.ROBOKASSA_PASSWORD1;
  const isTest = process.env.ROBOKASSA_TEST_MODE === 'true';

  if (!merchantLogin || !password1) {
    return NextResponse.json({ error: 'Robokassa not configured' }, { status: 500 });
  }

  try {
    const db = require('@/lib/db').default;
    const d = db();

    // Find subscriptions due for charge
    const dueSubscriptions = d.prepare(`
      SELECT s.*, u.email, u.name
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      WHERE s.status = 'active' AND s.next_charge_at <= datetime('now')
    `).all();

    console.log(`[Recurring] Found ${dueSubscriptions.length} subscriptions to charge`);

    const results = [];

    for (const sub of dueSubscriptions) {
      const plan = PLANS[sub.plan];
      if (!plan) {
        console.error(`[Recurring] Unknown plan: ${sub.plan}, skipping`);
        continue;
      }

      const newInvId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
      const outSum = plan.price.toFixed(2);

      // 54-FZ Receipt (required for recurring too)
      const receipt = JSON.stringify({
        items: [{
          name: `Подписка Adgena «${plan.name}» (${plan.description})`,
          quantity: 1,
          sum: plan.price,
          payment_method: 'full_payment',
          payment_object: 'service',
          tax: 'none',
        }],
      });
      const receiptEncoded = encodeURIComponent(receipt);

      // Shp_ params for the recurring charge
      const shpParams = {
        'Shp_planId': sub.plan,
        'Shp_userId': sub.user_id,
      };
      const shpStr = Object.keys(shpParams)
        .sort()
        .map(k => `${k}=${shpParams[k]}`)
        .join(':');

      // Signature: MerchantLogin:OutSum:InvId:Receipt:Password1:Shp_...
      const sigSource = `${merchantLogin}:${outSum}:${newInvId}:${receiptEncoded}:${password1}:${shpStr}`;
      const signature = crypto.createHash('md5').update(sigSource).digest('hex');

      const params = new URLSearchParams({
        MerchantLogin: merchantLogin,
        OutSum: outSum,
        InvId: newInvId.toString(),
        Description: `Подписка Adgena «${plan.name}» (продление)`,
        SignatureValue: signature,
        Receipt: receiptEncoded,
        PreviousInvoiceID: sub.initial_inv_id,
        ...shpParams,
      });

      if (isTest) {
        params.set('IsTest', '1');
      }

      const recurringUrl = 'https://auth.robokassa.ru/Merchant/Recurring';

      try {
        console.log(`[Recurring] Charging user ${sub.user_id} (${sub.email}): plan=${sub.plan}, sum=${outSum}, prevInvId=${sub.initial_inv_id}`);

        const res = await fetch(recurringUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        const responseText = await res.text();
        console.log(`[Recurring] Robokassa response for ${sub.user_id}: status=${res.status}, body=${responseText.slice(0, 200)}`);

        // Note: we do NOT update next_charge_at here — the Result callback handles that
        // after Robokassa confirms the charge was successful
        results.push({
          userId: sub.user_id,
          email: sub.email,
          plan: sub.plan,
          invId: newInvId,
          status: res.ok ? 'sent' : 'rejected',
          response: responseText.slice(0, 200),
        });

        if (!res.ok) {
          console.error(`[Recurring] Robokassa rejected charge for ${sub.user_id}: ${res.status}`);
        }
      } catch (reqErr) {
        console.error(`[Recurring] Request error for ${sub.user_id}:`, reqErr.message);
        results.push({
          userId: sub.user_id,
          email: sub.email,
          plan: sub.plan,
          status: 'error',
          error: reqErr.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('[Recurring] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
