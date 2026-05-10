import SeoLandingPage from '@/components/SeoLandingPage';
import { TOOL_PAGES } from '@/lib/toolPages';

const page = TOOL_PAGES['reklama-dlya-kosmetiki'];

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
