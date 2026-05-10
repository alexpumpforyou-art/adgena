import { NextResponse } from 'next/server';
import { fetchAiNewsCandidates, generateNewsDraft } from '@/lib/newsGenerator';
import { getNextPublishableNewsItem, hasNewsSourceUrl, updateNewsStatus, upsertNewsItem } from '@/lib/db';

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
    const autoPublish = searchParams.get('autoPublish') === 'true';
    const minQualityScore = Math.max(0, Math.min(parseInt(searchParams.get('minQualityScore') || '80', 10), 100));
    const maxAgeHours = Math.max(1, Math.min(parseInt(searchParams.get('maxAgeHours') || '48', 10), 168));
    const candidates = await fetchAiNewsCandidates(20);
    const fresh = candidates.filter((item) => !hasNewsSourceUrl(item.url)).slice(0, limit);
    const generated = [];
    const errors = [];
    let published = null;

    for (const candidate of fresh) {
      try {
        const draft = await generateNewsDraft(candidate);
        const id = upsertNewsItem(draft);
        generated.push({ id, slug: draft.slug, title: draft.title, qualityScore: draft.qualityScore, status: draft.status });
        if (autoPublish && !published && draft.qualityScore >= minQualityScore && isFreshEnough(draft.sourcePublishedAt, maxAgeHours)) {
          updateNewsStatus(id, 'published');
          published = { id, slug: draft.slug, title: draft.title, qualityScore: draft.qualityScore, source: 'generated' };
        }
      } catch (err) {
        errors.push({ title: candidate.title, error: err.message });
      }
    }

    if (autoPublish && !published) {
      const draft = getNextPublishableNewsItem(minQualityScore, maxAgeHours);
      if (draft) {
        updateNewsStatus(draft.id, 'published');
        published = { id: draft.id, slug: draft.slug, title: draft.title, qualityScore: draft.quality_score, source: 'existing_draft' };
      }
    }

    return NextResponse.json({ success: true, found: candidates.length, fresh: fresh.length, generated, published, errors });
  } catch (error) {
    console.error('[generate-news] error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function isFreshEnough(sourcePublishedAt, maxAgeHours) {
  if (!sourcePublishedAt) return true;
  const time = new Date(sourcePublishedAt).getTime();
  if (Number.isNaN(time)) return true;
  return Date.now() - time <= maxAgeHours * 60 * 60 * 1000;
}
