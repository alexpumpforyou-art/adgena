import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'vt.0pe@yandex.ru')
  .split(',').map(e => e.trim().toLowerCase());

const DATA_DIR = process.env.NODE_ENV === 'production'
  ? '/app/data'
  : path.join(process.cwd(), 'data');

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const getDb = require('@/lib/db').default;
    const d = getDb();

    // === EMAIL (Resend) ===
    // Free tier: 100/day, 3000/month
    const emailToday = d.prepare(
      "SELECT COUNT(*) as c FROM email_log WHERE status = 'sent' AND created_at > datetime('now', '-1 day')"
    ).get().c;
    const emailMonth = d.prepare(
      "SELECT COUNT(*) as c FROM email_log WHERE status = 'sent' AND created_at > datetime('now', '-30 days')"
    ).get().c;
    const emailFailedMonth = d.prepare(
      "SELECT COUNT(*) as c FROM email_log WHERE status = 'failed' AND created_at > datetime('now', '-30 days')"
    ).get().c;

    // === GENERATIONS ===
    const genToday = d.prepare(
      "SELECT COUNT(*) as c FROM generations WHERE created_at > datetime('now', '-1 day')"
    ).get().c;
    const genMonth = d.prepare(
      "SELECT COUNT(*) as c FROM generations WHERE created_at > datetime('now', '-30 days')"
    ).get().c;
    const genTotal = d.prepare("SELECT COUNT(*) as c FROM generations").get().c;

    // === USERS ===
    const usersTotal = d.prepare("SELECT COUNT(*) as c FROM users").get().c;
    const usersNewToday = d.prepare(
      "SELECT COUNT(*) as c FROM users WHERE created_at > datetime('now', '-1 day')"
    ).get().c;
    const usersNewMonth = d.prepare(
      "SELECT COUNT(*) as c FROM users WHERE created_at > datetime('now', '-30 days')"
    ).get().c;
    const usersActive7d = d.prepare(
      "SELECT COUNT(DISTINCT user_id) as c FROM sessions WHERE created_at > datetime('now', '-7 days')"
    ).get().c;
    const usersActive30d = d.prepare(
      "SELECT COUNT(DISTINCT user_id) as c FROM sessions WHERE created_at > datetime('now', '-30 days')"
    ).get().c;

    // === TICKETS ===
    const ticketsOpen = d.prepare("SELECT COUNT(*) as c FROM tickets WHERE status = 'open'").get().c;
    const ticketsTotal = d.prepare("SELECT COUNT(*) as c FROM tickets").get().c;

    // === SUBSCRIPTIONS ===
    const subsActive = d.prepare("SELECT COUNT(*) as c FROM subscriptions WHERE status = 'active'").get().c;

    // === DATABASE SIZE ===
    let dbSizeBytes = 0;
    let dbSizeMB = 0;
    try {
      const stat = fs.statSync(path.join(DATA_DIR, 'adgena.db'));
      dbSizeBytes = stat.size;
      dbSizeMB = +(dbSizeBytes / 1024 / 1024).toFixed(2);
    } catch { /* ignore */ }

    // === DISK FREE on DATA_DIR ===
    let diskFreeMB = null;
    try {
      if (fs.statfsSync) {
        const s = fs.statfsSync(DATA_DIR);
        diskFreeMB = Math.round((s.bfree * s.bsize) / 1024 / 1024);
      }
    } catch { /* ignore */ }

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      quotas: {
        email: {
          provider: 'Resend',
          sentToday: emailToday,
          sentMonth: emailMonth,
          failedMonth: emailFailedMonth,
          limitDay: 100,
          limitMonth: 3000,
        },
        generations: {
          today: genToday,
          month: genMonth,
          total: genTotal,
        },
        users: {
          total: usersTotal,
          newToday: usersNewToday,
          newMonth: usersNewMonth,
          active7d: usersActive7d,
          active30d: usersActive30d,
        },
        tickets: {
          open: ticketsOpen,
          total: ticketsTotal,
        },
        subscriptions: {
          active: subsActive,
        },
        database: {
          sizeBytes: dbSizeBytes,
          sizeMB: dbSizeMB,
          path: path.join(DATA_DIR, 'adgena.db'),
          diskFreeMB,
        },
      },
    });
  } catch (err) {
    console.error('[Admin Quotas] error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
