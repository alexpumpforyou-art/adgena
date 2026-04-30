import { NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, createSession } from '@/lib/db';
import { signToken, buildSessionCookie } from '@/lib/auth';

// Rate limit: max 10 login attempts per IP per 15 minutes
const loginAttempts = new Map();
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW = 15 * 60 * 1000;

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.start > LOGIN_WINDOW) {
    loginAttempts.set(ip, { count: 1, start: now });
    return true;
  }
  entry.count++;
  return entry.count <= LOGIN_LIMIT;
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    if (!checkLoginRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email и пароль обязательны' }, { status: 400 });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Неверный email или пароль' }, { status: 401 });
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: 'Неверный email или пароль' }, { status: 401 });
    }

    const session = createSession(user.id);
    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        generationsUsed: user.generations_used,
        generationsLimit: user.generations_limit,
      },
    });

    response.cookies.set(buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка входа' },
      { status: 500 }
    );
  }
}
