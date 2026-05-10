import ExampleCasePage from '../ExampleCasePage';
import { EXAMPLE_CASES } from '@/lib/exampleCases';

const item = EXAMPLE_CASES['reklamnyy-kreativ-dlya-kosmetiki'];
const metaTitle = item.title + ' — пример AdGena';

export const metadata = {
  title: metaTitle,
  description: item.description,
  alternates: { canonical: item.path },
  openGraph: {
    title: metaTitle,
    description: item.description,
    url: item.path,
    images: [{ url: item.afterImage }],
    type: 'article',
  },
};

export default function Page() {
  return <ExampleCasePage item={item} />;
}
