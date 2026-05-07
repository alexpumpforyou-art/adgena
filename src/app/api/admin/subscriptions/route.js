import { NextResponse } from 'next/server';
import { getCurrentUser, isAdminUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const db = require('@/lib/db').default;
    const d = db();

    const subscriptions = d.prepare(`
      SELECT
        s.*,
        u.email,
        u.name,
        u.plan AS user_plan,
        u.generations_used,
        u.generations_limit,
        COALESCE(p.total_payments, 0) AS total_payments,
        COALESCE(p.recurring_payments, 0) AS recurring_payments,
        COALESCE(p.total_amount, 0) AS total_amount,
        p.last_payment_at,
        p.last_payment_inv_id,
        p.last_payment_amount
      FROM subscriptions s
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN (
        SELECT
          user_id,
          COUNT(*) AS total_payments,
          SUM(CASE WHEN is_recurring = 1 THEN 1 ELSE 0 END) AS recurring_payments,
          SUM(amount) AS total_amount,
          MAX(created_at) AS last_payment_at,
          (
            SELECT inv_id
            FROM payments p2
            WHERE p2.user_id = payments.user_id
            ORDER BY datetime(created_at) DESC
            LIMIT 1
          ) AS last_payment_inv_id,
          (
            SELECT amount
            FROM payments p3
            WHERE p3.user_id = payments.user_id
            ORDER BY datetime(created_at) DESC
            LIMIT 1
          ) AS last_payment_amount
        FROM payments
        GROUP BY user_id
      ) p ON p.user_id = s.user_id
      ORDER BY
        CASE s.status WHEN 'active' THEN 0 ELSE 1 END,
        s.next_charge_at ASC
      LIMIT 100
    `).all();

    const payments = d.prepare(`
      SELECT p.*, u.email, u.name
      FROM payments p
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY datetime(p.created_at) DESC
      LIMIT 200
    `).all();

    return NextResponse.json({ success: true, subscriptions, payments });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { action, subscriptionId } = await request.json();
    const db = require('@/lib/db').default;
    const d = db();

    if (action === 'cancel') {
      const sub = d.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subscriptionId);
      if (!sub) return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 });

      // Cancel subscription
      d.prepare("UPDATE subscriptions SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(subscriptionId);

      // Downgrade user to free
      d.prepare(`
        UPDATE users
        SET plan = 'free', generations_limit = 1, generations_used = 0,
            subscription_plan = NULL, subscription_inv_id = NULL, updated_at = datetime('now')
        WHERE id = ?
      `).run(sub.user_id);

      console.log(`[Admin] Cancelled subscription ${subscriptionId} for user ${sub.user_id}`);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
