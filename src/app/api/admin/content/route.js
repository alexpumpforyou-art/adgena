import { NextResponse } from 'next/server';
import { getCurrentUser, isAdminUser } from '@/lib/auth';
import { getDefaultContentKeywords } from '@/lib/contentGenerator';
import { listContentKeywords, listContentPages, seedContentKeywords, updateContentPageStatus } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!isAdminUser(user)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    seedContentKeywords(getDefaultContentKeywords());

    return NextResponse.json({
      success: true,
      pages: listContentPages(null, 200),
      keywords: listContentKeywords(300),
    });
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

    if (body.action === 'seed') {
      const items = String(body.keywords || '')
        .split('\n')
        .map((keyword) => keyword.trim())
        .filter(Boolean)
        .map((keyword) => ({ keyword, cluster: body.cluster || '', intent: body.intent || '', priority: body.priority || 50 }));
      seedContentKeywords(items);
      return NextResponse.json({ success: true, added: items.length });
    }

    if (body.action === 'status') {
      if (!['draft', 'published', 'rejected'].includes(body.status)) {
        return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
      }
      updateContentPageStatus(body.id, body.status);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
