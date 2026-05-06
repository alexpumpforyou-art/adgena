import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'vt.0pe@yandex.ru')
  .split(',').map(e => e.trim().toLowerCase());

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (!ADMIN_EMAILS.includes(user.email) && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const db = require('@/lib/db').default;
    const d = db();

    const subscriptions = d.prepare(`
      SELECT s.*, u.email, u.name
      FROM subscriptions s
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY
        CASE s.status WHEN 'active' THEN 0 ELSE 1 END,
        s.next_charge_at ASC
      LIMIT 100
    `).all();

    return NextResponse.json({ success: true, subscriptions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!ADMIN_EMAILS.includes(user.email) && user.role !== 'admin')) {
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
