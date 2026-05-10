import { SEO_PAGE_SLUGS, SEO_PAGES } from '@/lib/seoPages';
import { TOOL_PAGE_SLUGS, TOOL_PAGES } from '@/lib/toolPages';
import { EXAMPLE_CASE_SLUGS, EXAMPLE_CASES } from '@/lib/exampleCases';
import { getPublishedContentPages } from '@/lib/db';

const BASE_URL = 'https://adgena.pro';

export default function sitemap() {
  const now = new Date();
  const seoPages = SEO_PAGE_SLUGS.map((slug) => ({
    url: `${BASE_URL}${SEO_PAGES[slug].path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  const toolPages = TOOL_PAGE_SLUGS.map((slug) => ({
    url: `${BASE_URL}${TOOL_PAGES[slug].path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  const examplePages = EXAMPLE_CASE_SLUGS.map((slug) => ({
    url: `${BASE_URL}${EXAMPLE_CASES[slug].path}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  const generatedSeoPages = getPublishedContentPages(500).map((page) => ({
    url: `${BASE_URL}/seo/${page.slug}`,
    lastModified: page.updated_at ? new Date(page.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.65,
  }));

  return [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    ...seoPages,
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...toolPages,
    { url: `${BASE_URL}/examples`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...examplePages,
    { url: `${BASE_URL}/seo`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    ...generatedSeoPages,
    { url: `${BASE_URL}/auth`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/en`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/en/auth`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/en/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/en/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
