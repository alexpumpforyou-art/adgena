import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getGenerationsByUser } from '@/lib/db';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'vt.0pe@yandex.ru')
  .split(',').map(e => e.trim().toLowerCase());

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!ADMIN_EMAILS.includes(user.email) && user.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const history = getGenerationsByUser(userId, 100);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Admin History API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
