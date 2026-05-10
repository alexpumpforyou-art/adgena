import { notFound } from 'next/navigation';
import SeoLandingPage from '@/components/SeoLandingPage';
import { TOOL_PAGES, TOOL_PAGE_SLUGS } from '@/lib/toolPages';

export function generateStaticParams() {
  return TOOL_PAGE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const page = TOOL_PAGES[params.slug];

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: page.path,
      type: 'website',
    },
  };
}

export default function Page({ params }) {
  const page = TOOL_PAGES[params.slug];

  if (!page) {
    notFound();
  }

  return <SeoLandingPage page={page} />;
}
