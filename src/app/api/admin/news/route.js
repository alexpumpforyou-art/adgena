import { NextResponse } from 'next/server';
import { getCurrentUser, isAdminUser } from '@/lib/auth';
import { listNewsItems, updateNewsStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, items: listNewsItems(null, 200) });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    if (body.action !== 'status' || !['draft', 'published', 'rejected'].includes(body.status)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    updateNewsStatus(body.id, body.status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
