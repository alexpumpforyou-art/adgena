import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';

/**
 * POST /api/robokassa/consent — Log user's consent to recurring payments
 * Required by Robokassa: "Сохраняйте историю согласий пользователей на автосписания"
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    const db = require('@/lib/db').default;
    const d = db();

    // Get request metadata
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';

    const consentText = `Я согласен на автоматические списания согласно условиям оферты (https://adgena.pro/terms). План: ${planId}.`;

    d.prepare(`
      INSERT INTO consents (id, user_id, user_email, plan, consent_text, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      crypto.randomUUID(),
      user.id,
      user.email,
      planId,
      consentText,
      ip,
      ua
    );

    console.log(`[Consent] Logged: user=${user.email}, plan=${planId}, ip=${ip}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Consent] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
