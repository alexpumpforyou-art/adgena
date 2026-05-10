import { NextResponse } from 'next/server';
import { generateSeoDraft, getDefaultContentKeywords } from '@/lib/contentGenerator';
import { getNextContentKeywords, seedContentKeywords, upsertContentPage } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const expected = process.env.CRON_SECRET || 'adgena_cron_2026';

    if (secret !== expected) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '3', 10), 10));
    seedContentKeywords(getDefaultContentKeywords());

    const keywords = getNextContentKeywords(limit);
    const generated = [];
    const errors = [];

    for (const keyword of keywords) {
      try {
        const draft = await generateSeoDraft(keyword);
        const id = upsertContentPage(draft);
        generated.push({ id, slug: draft.slug, keyword: keyword.keyword, model: draft.model });
      } catch (err) {
        errors.push({ keyword: keyword.keyword, error: err.message });
      }
    }

    return NextResponse.json({ success: true, requested: limit, generated, errors });
  } catch (error) {
    console.error('[generate-content] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
