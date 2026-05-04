import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { processWithdrawal } from '@/lib/db';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());

// GET — list all pending withdrawals
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = require('@/lib/db').default;
    const d = db();
    const withdrawals = d.prepare(`
      SELECT w.*, u.email, u.name 
      FROM referral_withdrawals w
      JOIN users u ON u.id = w.user_id
      ORDER BY 
        CASE w.status WHEN 'pending' THEN 0 ELSE 1 END,
        w.created_at DESC
      LIMIT 50
    `).all();

    return NextResponse.json({ success: true, withdrawals });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — approve or reject a withdrawal
export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { withdrawalId, status, adminNote } = await request.json();

    if (!withdrawalId || !['completed', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    processWithdrawal(withdrawalId, status, adminNote);

    console.log(`[Admin] Withdrawal ${withdrawalId} ${status} by ${user.email}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
