import { NextResponse } from 'next/server';
import { getCurrentUser, isAdminUser } from '@/lib/auth';
import { PLANS } from '@/lib/plans';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
    const password1 = process.env.ROBOKASSA_PASSWORD1;
    const isTest = process.env.ROBOKASSA_TEST_MODE === 'true';

    if (!merchantLogin || !password1) {
      return NextResponse.json({ success: false, error: 'Robokassa not configured' }, { status: 500 });
    }

    const db = require('@/lib/db').default;
    const d = db();

    d.prepare(`
      UPDATE subscriptions
      SET billing_status = 'idle', updated_at = datetime('now')
      WHERE billing_status = 'processing'
        AND last_charge_attempt_at <= datetime('now', '-3 hours')
    `).run();

    // Find all active subscriptions due for charge
    const dueSubscriptions = d.prepare(`
      SELECT s.*, u.email, u.name
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      WHERE s.status = 'active'
        AND s.next_charge_at <= datetime('now')
        AND COALESCE(s.billing_status, 'idle') != 'processing'
    `).all();

    console.log(`[Admin Recurring] Found ${dueSubscriptions.length} subscriptions to charge`);

    const results = [];

    for (const sub of dueSubscriptions) {
      const plan = PLANS[sub.plan];
      if (!plan) {
        results.push({ email: sub.email, plan: sub.plan, status: 'skipped', error: 'Unknown plan' });
        continue;
      }

      const newInvId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
      const outSum = plan.price.toFixed(2);

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

      const shpParams = {
        'Shp_planId': sub.plan,
        'Shp_userId': sub.user_id,
      };
      const shpStr = Object.keys(shpParams)
        .sort()
        .map(k => `${k}=${shpParams[k]}`)
        .join(':');

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

      try {
        d.prepare(`
          UPDATE subscriptions
          SET billing_status = 'processing',
              last_charge_attempt_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ? AND COALESCE(billing_status, 'idle') != 'processing'
        `).run(sub.id);

        const res = await fetch('https://auth.robokassa.ru/Merchant/Recurring', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        const responseText = await res.text();
        console.log(`[Admin Recurring] ${sub.email}: status=${res.status}, body=${responseText.slice(0, 200)}`);

        results.push({
          email: sub.email,
          plan: sub.plan,
          amount: outSum,
          invId: newInvId,
          prevInvId: sub.initial_inv_id,
          status: res.ok ? 'sent' : 'rejected',
          httpStatus: res.status,
          response: responseText.slice(0, 300),
        });

        if (!res.ok) {
          d.prepare(`
            UPDATE subscriptions
            SET billing_status = 'idle', updated_at = datetime('now')
            WHERE id = ?
          `).run(sub.id);
        }
      } catch (reqErr) {
        d.prepare(`
          UPDATE subscriptions
          SET billing_status = 'idle', updated_at = datetime('now')
          WHERE id = ?
        `).run(sub.id);
        results.push({
          email: sub.email,
          plan: sub.plan,
          status: 'error',
          error: reqErr.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: dueSubscriptions.length,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('[Admin Recurring] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
