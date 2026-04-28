import { NextResponse } from 'next/server';
import { signToken, buildSessionCookie } from '@/lib/auth';
import { getUserByEmail, createSession } from '@/lib/db';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

function getBaseUrl(request) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  try { return new URL(request.url).origin; } catch { return 'https://adgena.pro'; }
}

// Fetch with timeout + retry for Railway network issues
async function fetchWithRetry(url, options, { timeout = 20000, retries = 3 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      console.error(`[Yandex] Fetch attempt ${attempt}/${retries} to ${url} failed:`, err.message);
      if (attempt === retries) throw err;
      // Wait before retry (500ms, 1s, 1.5s)
      await new Promise(r => setTimeout(r, attempt * 500));
    }
  }
}

export async function GET(request) {
  const base = getBaseUrl(request);
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  console.log('[Yandex Callback] code:', code ? 'present' : 'MISSING', 'error:', error || 'none');

  if (error || !code) {
    return NextResponse.redirect(`${base}/auth?error=yandex_denied`);
  }

  try {
    const clientId = process.env.YANDEX_CLIENT_ID;
    const clientSecret = process.env.YANDEX_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${base}/auth?error=yandex_not_configured`);
    }

    // Exchange code for token (with retry)
    console.log('[Yandex] Exchanging code for token...');
    const tokenRes = await fetchWithRetry('https://oauth.yandex.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const tokens = await tokenRes.json();
    console.log('[Yandex] Token response:', tokens.access_token ? 'OK' : 'FAIL', tokens.error || '');

    if (!tokens.access_token) {
      console.error('[Yandex] Token error:', JSON.stringify(tokens));
      return NextResponse.redirect(`${base}/auth?error=yandex_token_failed`);
    }

    // Get user info (with retry)
    console.log('[Yandex] Getting user info...');
    const userRes = await fetchWithRetry('https://login.yandex.ru/info?format=json', {
      headers: { Authorization: `OAuth ${tokens.access_token}` },
    });

    const userText = await userRes.text();
    console.log('[Yandex] User info status:', userRes.status, 'body preview:', userText.substring(0, 200));
    
    let yandexUser;
    try {
      yandexUser = JSON.parse(userText);
    } catch (parseErr) {
      console.error('[Yandex] Failed to parse user info response');
      return NextResponse.redirect(`${base}/auth?error=yandex_failed`);
    }
    const email = yandexUser.default_email || yandexUser.emails?.[0];
    console.log('[Yandex] User email:', email || 'MISSING');

    if (!email) {
      return NextResponse.redirect(`${base}/auth?error=yandex_no_email`);
    }

    // Find or create user
    const db = require('@/lib/db').default;
    const d = db();
    let user = getUserByEmail(email);

    if (!user) {
      const id = crypto.randomUUID();
      const passwordHash = bcryptjs.hashSync(crypto.randomBytes(32).toString('hex'), 10);
      const displayName = yandexUser.display_name || yandexUser.real_name || email.split('@')[0];

      d.prepare(`
        INSERT INTO users (id, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `).run(id, email.toLowerCase().trim(), passwordHash, displayName);

      user = { id, email, name: displayName };
      console.log('[Yandex] Created new user:', email);
    } else {
      console.log('[Yandex] Existing user:', email);
    }

    // Create session
    const session = createSession(user.id);
    const token = signToken({ userId: user.id, email: user.email });

    const response = NextResponse.redirect(`${base}/dashboard`);
    response.cookies.set(buildSessionCookie(token));
    console.log('[Yandex] Login success, redirecting to dashboard');
    return response;

  } catch (err) {
    console.error('[Yandex] OAuth error:', err.message, err.cause?.message || '');
    return NextResponse.redirect(`${base}/auth?error=yandex_failed`);
  }
}
