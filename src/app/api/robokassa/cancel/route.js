import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * POST /api/robokassa/cancel — Cancel active subscription
 */
export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = require('@/lib/db').default;
    const d = db();

    // Cancel all active subscriptions for this user
    const result = d.prepare(`
      UPDATE subscriptions 
      SET status = 'cancelled', updated_at = datetime('now')
      WHERE user_id = ? AND status = 'active'
    `).run(user.id);

    // Downgrade user to free plan
    d.prepare(`
      UPDATE users 
      SET plan = 'free', generations_limit = 1, generations_used = 0,
          subscription_plan = NULL, subscription_inv_id = NULL, updated_at = datetime('now')
      WHERE id = ?
    `).run(user.id);

    console.log(`[Subscription] User ${user.email} cancelled subscription (${result.changes} sub(s)), downgraded to free`);

    return NextResponse.json({
      success: true,
      message: 'Подписка отменена. Тариф сброшен до бесплатного.',
    });
  } catch (error) {
    console.error('[Subscription Cancel] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
