import { NextResponse } from 'next/server';

const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID;
const YANDEX_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/yandex/callback`;

export async function GET() {
  if (!YANDEX_CLIENT_ID) {
    return NextResponse.redirect(new URL('/auth?error=yandex_not_configured', process.env.NEXT_PUBLIC_APP_URL));
  }

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: YANDEX_CLIENT_ID,
    redirect_uri: YANDEX_REDIRECT_URI,
    scope: 'login:email login:info',
  });

  return NextResponse.redirect(`https://oauth.yandex.ru/authorize?${params.toString()}`);
}
