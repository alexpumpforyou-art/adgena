import { NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword, createSession } from '@/lib/db';
import { signToken, buildSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
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
