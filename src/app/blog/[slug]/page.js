import { notFound } from 'next/navigation';
import { getContentPageBySlug } from '@/lib/db';
import SeoGeneratedPage from '../SeoGeneratedPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getContentPageBySlug(slug, ['published']);

  if (!page) return {};

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/blog/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/blog/${page.slug}`,
      type: 'article',
    },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const page = getContentPageBySlug(slug, ['published']);

  if (!page) {
    notFound();
  }

  return <SeoGeneratedPage page={page} />;
}
