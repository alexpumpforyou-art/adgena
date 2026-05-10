import { NextResponse } from 'next/server';
import { generateSeoDraft, getDefaultContentKeywords } from '@/lib/contentGenerator';
import { getNextContentKeywords, getNextDraftContentPage, seedContentKeywords, updateContentPageStatus, upsertContentPage } from '@/lib/db';

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
    const autoPublish = searchParams.get('autoPublish') === 'true';
    seedContentKeywords(getDefaultContentKeywords());

    const keywords = getNextContentKeywords(limit);
    const generated = [];
    const errors = [];
    let published = null;

    for (const keyword of keywords) {
      try {
        const draft = await generateSeoDraft(keyword);
        const id = upsertContentPage(draft);
        generated.push({ id, slug: draft.slug, keyword: keyword.keyword, model: draft.model });
        if (autoPublish && !published) {
          updateContentPageStatus(id, 'published');
          published = { id, slug: draft.slug, keyword: keyword.keyword, source: 'generated' };
        }
      } catch (err) {
        errors.push({ keyword: keyword.keyword, error: err.message });
      }
    }

    if (autoPublish && !published) {
      const draft = getNextDraftContentPage();
      if (draft) {
        updateContentPageStatus(draft.id, 'published');
        published = { id: draft.id, slug: draft.slug, keyword: draft.keyword, source: 'existing_draft' };
      }
    }

    return NextResponse.json({ success: true, requested: limit, generated, published, errors });
  } catch (error) {
    console.error('[generate-content] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
