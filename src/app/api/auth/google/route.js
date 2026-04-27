import { NextResponse } from 'next/server';

function getBaseUrl(request) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  try { return new URL(request.url).origin; } catch { return 'https://adgena.pro'; }
}

export async function GET(request) {
  const base = getBaseUrl(request);
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(`${base}/auth?error=google_not_configured`);
  }

  const redirectUri = `${base}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
