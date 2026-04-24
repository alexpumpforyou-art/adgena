import { NextResponse } from 'next/server';
import { createUser, createSession } from '@/lib/db';
import { signToken, buildSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email и пароль обязательны' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Пароль минимум 6 символов' }, { status: 400 });
    }

    const user = createUser({ email, password, name });
    const session = createSession(user.id);
    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        generationsUsed: user.generationsUsed,
        generationsLimit: user.generationsLimit,
      },
    });

    response.cookies.set(buildSessionCookie(token));
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка регистрации' },
      { status: error.message?.includes('зарегистрирован') ? 409 : 500 }
    );
  }
}
