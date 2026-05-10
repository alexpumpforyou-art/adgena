import { NextResponse } from 'next/server';
import { fetchAiNewsCandidates, generateNewsDraft } from '@/lib/newsGenerator';
import { hasNewsSourceUrl, upsertNewsItem } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const expected = process.env.CRON_SECRET || 'adgena_cron_2026';

    if (secret !== expected) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '1', 10), 5));
    const candidates = await fetchAiNewsCandidates(20);
    const fresh = candidates.filter((item) => !hasNewsSourceUrl(item.url)).slice(0, limit);
    const generated = [];
    const errors = [];

    for (const candidate of fresh) {
      try {
        const draft = await generateNewsDraft(candidate);
        const id = upsertNewsItem(draft);
        generated.push({ id, slug: draft.slug, title: draft.title, qualityScore: draft.qualityScore, status: draft.status });
      } catch (err) {
        errors.push({ title: candidate.title, error: err.message });
      }
    }

    return NextResponse.json({ success: true, found: candidates.length, fresh: fresh.length, generated, errors });
  } catch (error) {
    console.error('[generate-news] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
