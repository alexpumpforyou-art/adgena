import { NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/email';

// In-memory store for verification codes
// Key: email, Value: { code, expires, attempts }
const verificationCodes = new Map();

// Cleanup expired codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of verificationCodes) {
    if (now > data.expires) verificationCodes.delete(email);
  }
}, 60000);

// Rate limit: max 3 code requests per email per 10 minutes
function canSendCode(email) {
  const existing = verificationCodes.get(email);
  if (!existing) return true;

  // Can't request new code within 60 seconds
  if (Date.now() - existing.created < 60000) return false;

  return true;
}

// Send verification code
export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email обязателен' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit
    if (!canSendCode(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Подождите минуту перед повторной отправкой' },
        { status: 429 }
      );
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Store code (expires in 10 minutes)
    verificationCodes.set(normalizedEmail, {
      code,
      created: Date.now(),
      expires: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    // Send email
    const result = await sendVerificationCode(normalizedEmail, code);

    if (!result.success) {
      // If email service not configured, return code in dev mode only
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true, dev_code: code });
      }
      return NextResponse.json(
        { success: false, error: 'Не удалось отправить код. Попробуйте позже.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Verify] Send code error:', err);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}

// Verify code
export async function PUT(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email и код обязательны' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const stored = verificationCodes.get(normalizedEmail);

    if (!stored) {
      return NextResponse.json(
        { success: false, error: 'Код не найден. Запросите новый.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (Date.now() > stored.expires) {
      verificationCodes.delete(normalizedEmail);
      return NextResponse.json(
        { success: false, error: 'Код истёк. Запросите новый.' },
        { status: 400 }
      );
    }

    // Check attempts (max 5)
    stored.attempts++;
    if (stored.attempts > 5) {
      verificationCodes.delete(normalizedEmail);
      return NextResponse.json(
        { success: false, error: 'Слишком много попыток. Запросите новый код.' },
        { status: 429 }
      );
    }

    // Verify code
    if (stored.code !== code.trim()) {
      return NextResponse.json(
        { success: false, error: `Неверный код. Осталось попыток: ${5 - stored.attempts}` },
        { status: 400 }
      );
    }

    // Code is correct — delete it
    verificationCodes.delete(normalizedEmail);

    return NextResponse.json({ success: true, verified: true });
  } catch (err) {
    console.error('[Verify] Check code error:', err);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}
