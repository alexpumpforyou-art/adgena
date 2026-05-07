import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isStaff, getSetting, setSetting } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ALLOWED_KEYS = new Set(['image_layout_provider']);

export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user || !isStaff(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    success: true,
    settings: {
      image_layout_provider: getSetting('image_layout_provider') || 'openai',
    },
  });
}

export async function PUT(request) {
  const user = await getCurrentUser(request);
  if (!user || !isStaff(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!ALLOWED_KEYS.has(key)) {
      return NextResponse.json({ error: 'Unknown setting' }, { status: 400 });
    }

    if (key === 'image_layout_provider' && !['openai', 'gemini'].includes(value)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    setSetting(key, value);
    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
