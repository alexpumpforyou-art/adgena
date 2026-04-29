import { NextResponse } from 'next/server';
import { getCurrentUser, signToken, buildSessionCookie } from '@/lib/auth';
import { getUserById } from '@/lib/db';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'vt.0pe@yandex.ru')
  .split(',').map(e => e.trim().toLowerCase());

export async function POST(request) {
  try {
    const adminUser = await getCurrentUser();
    if (!adminUser || (!ADMIN_EMAILS.includes(adminUser.email) && adminUser.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 });
    }

    const targetUser = getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Sign a token for the target user
    const token = signToken({ userId: targetUser.id, email: targetUser.email });

    const response = NextResponse.json({ success: true, message: 'Impersonating user' });
    
    // Set the session cookie to log the admin in as the target user
    const cookieOpts = buildSessionCookie(token);
    response.cookies.set(cookieOpts.name, cookieOpts.value, cookieOpts);

    return response;
  } catch (error) {
    console.error('Admin Impersonate API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
