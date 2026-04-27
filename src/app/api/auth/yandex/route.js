import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

function getBaseUrl(request) {
  // Use env var first, fallback to request origin
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  try {
    const url = new URL(request.url);
    return url.origin;
  } catch {
    return 'https://adgena.pro';
  }
}

export async function GET(request) {
  const base = getBaseUrl(request);
  const clientId = process.env.YANDEX_CLIENT_ID;

  if (!clientId) {
    return NextResponse.redirect(`${base}/auth?error=yandex_not_configured`);
  }

  const redirectUri = `${base}/api/auth/yandex/callback`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'login:email login:info',
  });

  return NextResponse.redirect(`https://oauth.yandex.ru/authorize?${params.toString()}`);
}
