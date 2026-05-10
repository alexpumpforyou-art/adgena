import { notFound } from 'next/navigation';
import { getNewsItemBySlug } from '@/lib/db';
import NewsArticlePage from '../NewsArticlePage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getNewsItemBySlug(slug, ['published']);

  if (!item) return {};

  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/news/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.description,
      url: `/news/${item.slug}`,
      type: 'article',
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const item = getNewsItemBySlug(slug, ['published']);

  if (!item) {
    notFound();
  }

  return <NewsArticlePage item={item} />;
}
