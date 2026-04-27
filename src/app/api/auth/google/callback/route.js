import { NextResponse } from 'next/server';
import { signToken, buildSessionCookie } from '@/lib/auth';
import { getUserByEmail, createSession } from '@/lib/db';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${APP_URL}/auth?error=google_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error('Google token error:', tokens);
      return NextResponse.redirect(`${APP_URL}/auth?error=google_token_failed`);
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(`${APP_URL}/auth?error=google_no_email`);
    }

    // Find or create user
    const db = require('@/lib/db').default;
    const d = db();
    let user = getUserByEmail(googleUser.email);

    if (!user) {
      // Create new user with random password (OAuth user)
      const id = crypto.randomUUID();
      const passwordHash = bcryptjs.hashSync(crypto.randomBytes(32).toString('hex'), 10);

      d.prepare(`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(id, googleUser.email.toLowerCase().trim(), passwordHash, googleUser.name || '');

      user = { id, email: googleUser.email, name: googleUser.name || '' };
    }

    // Create session
    const session = createSession(user.id);
    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.redirect(`${APP_URL}/dashboard`);
    response.cookies.set(buildSessionCookie(token));
    return response;

  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(`${APP_URL}/auth?error=google_failed`);
  }
}
