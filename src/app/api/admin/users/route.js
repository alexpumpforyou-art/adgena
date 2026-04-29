import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Admin emails from env (comma-separated), e.g. ADMIN_EMAILS=user@mail.com,admin@site.com
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'vt.0pe@yandex.ru')
  .split(',').map(e => e.trim().toLowerCase());

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const db = require('@/lib/db').default;
    const d = db();

    const users = d.prepare(`
      SELECT id, email, name, role, plan, generations_used, generations_limit, created_at, updated_at
      FROM users ORDER BY created_at DESC
    `).all();

    const totalGenerations = d.prepare('SELECT COUNT(*) as count FROM generations').get();
    const todayGenerations = d.prepare(
      "SELECT COUNT(*) as count FROM generations WHERE created_at > datetime('now', '-1 day')"
    ).get();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalGenerations: totalGenerations.count,
        todayGenerations: todayGenerations.count,
      },
      users,
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Update user plan/limits
export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { userId, plan, generationsLimit, resetGenerations } = await request.json();

    const db = require('@/lib/db').default;
    const d = db();

    if (plan) {
      const limits = { free: 1, lite: 10, standard: 30, pro: 80, business: 200, unlimited: 99999 };
      d.prepare('UPDATE users SET plan = ?, generations_limit = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(plan, generationsLimit || limits[plan] || 5, userId);
    }

    if (resetGenerations) {
      d.prepare('UPDATE users SET generations_used = 0, updated_at = datetime(\'now\') WHERE id = ?')
        .run(userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Delete user
export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();

    const db = require('@/lib/db').default;
    const d = db();

    d.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    d.prepare('DELETE FROM generations WHERE user_id = ?').run(userId);
    d.prepare('DELETE FROM users WHERE id = ?').run(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
