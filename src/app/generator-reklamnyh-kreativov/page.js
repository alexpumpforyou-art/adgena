import SeoLandingPage from '@/components/SeoLandingPage';
import { SEO_PAGES } from '@/lib/seoPages';

const page = SEO_PAGES['generator-reklamnyh-kreativov'];

export const metadata = {
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

export default function Page() {
  return <SeoLandingPage page={page} />;
}
