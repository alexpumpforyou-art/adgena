import { NextResponse } from 'next/server';
import { signToken, buildSessionCookie } from '@/lib/auth';
import { getUserByEmail, createSession } from '@/lib/db';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID;
const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/auth?error=yandex_denied`);
  }

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://oauth.yandex.ru/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: YANDEX_CLIENT_ID,
        client_secret: YANDEX_CLIENT_SECRET,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error('Yandex token error:', tokens);
      return NextResponse.redirect(`${APP_URL}/auth?error=yandex_token_failed`);
    }

    // Get user info
    const userRes = await fetch('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${tokens.access_token}` },
    });

    const yandexUser = await userRes.json();
    const email = yandexUser.default_email || yandexUser.emails?.[0];

    if (!email) {
      return NextResponse.redirect(`${APP_URL}/auth?error=yandex_no_email`);
    }

    // Find or create user
    const db = require('@/lib/db').default;
    const d = db();
    let user = getUserByEmail(email);

    if (!user) {
      const id = crypto.randomUUID();
      const passwordHash = bcryptjs.hashSync(crypto.randomBytes(32).toString('hex'), 10);
      const displayName = yandexUser.display_name || yandexUser.real_name || '';

      d.prepare(`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(id, email.toLowerCase().trim(), passwordHash, displayName);

      user = { id, email, name: displayName };
    }

    // Create session
    const session = createSession(user.id);
    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.redirect(`${APP_URL}/dashboard`);
    response.cookies.set(buildSessionCookie(token));
    return response;

  } catch (err) {
    console.error('Yandex OAuth error:', err);
    return NextResponse.redirect(`${APP_URL}/auth?error=yandex_failed`);
  }
}
