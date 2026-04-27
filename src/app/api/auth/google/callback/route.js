import { NextResponse } from 'next/server';
import { signToken, buildSessionCookie } from '@/lib/auth';
import { getUserByEmail, createSession } from '@/lib/db';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

function getBaseUrl(request) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  try { return new URL(request.url).origin; } catch { return 'https://adgena.pro'; }
}

export async function GET(request) {
  const base = getBaseUrl(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(`${base}/auth?error=google_denied`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${base}/auth?error=google_not_configured`);
    }

    const redirectUri = `${base}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      console.error('Google token error:', tokens);
      return NextResponse.redirect(`${base}/auth?error=google_token_failed`);
    }

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(`${base}/auth?error=google_no_email`);
    }

    // Find or create user
    const db = require('@/lib/db').default;
    const d = db();
    let user = getUserByEmail(googleUser.email);

    if (!user) {
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

    const response = NextResponse.redirect(`${base}/dashboard`);
    response.cookies.set(buildSessionCookie(token));
    return response;

  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(`${base}/auth?error=google_failed`);
  }
}
