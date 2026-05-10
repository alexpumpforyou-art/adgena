import OpenAI from 'openai';
import { slugifyRu } from './contentGenerator';

const NEWS_SOURCES = [
  { name: 'OpenAI Blog', rssUrl: 'https://openai.com/news/rss.xml' },
  { name: 'Google DeepMind Blog', rssUrl: 'https://deepmind.google/discover/blog/rss.xml' },
  { name: 'Anthropic News', rssUrl: 'https://www.anthropic.com/news/rss.xml' },
  { name: 'TechCrunch AI', rssUrl: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
];

export function getNewsSources() {
  return NEWS_SOURCES;
}

export async function fetchAiNewsCandidates(limit = 5) {
  const all = [];
  for (const source of NEWS_SOURCES) {
    try {
      const res = await fetch(source.rssUrl, { next: { revalidate: 0 } });
      if (!res.ok) continue;
      const xml = await res.text();
      all.push(...parseRss(xml, source.name));
    } catch (err) {
      console.error('[news] source error', source.name, err.message);
    }
  }
  return all
    .filter((item) => isRelevantAiNews(item))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, limit);
}

export async function generateNewsDraft(candidate) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const model = process.env.OPENAI_CONTENT_MODEL || 'gpt-4o-mini';
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 120000 });
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.65,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Ты редактор AI News Digest для AdGena. Делай краткий русскоязычный пересказ новости с источником, анализом для маркетинга/e-commerce и мягким упоминанием AdGena. Не копируй исходный текст.' },
      { role: 'user', content: buildNewsPrompt(candidate) },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '{}';
  const data = JSON.parse(raw);
  const title = cleanText(data.title, candidate.title, 100);

  return {
    sourceName: candidate.sourceName,
    sourceUrl: candidate.url,
    sourceTitle: candidate.title,
    sourcePublishedAt: candidate.publishedAt || null,
    slug: slugifyRu(data.slug || title),
    title,
    description: cleanText(data.description, `AI-новость: ${title}`, 160),
    summary: cleanText(data.summary, candidate.description || title, 500),
    body: normalizeNewsBody(data, candidate),
    imageUrl: '',
    status: (Number(data.qualityScore || 0) >= 85 && process.env.NEWS_AUTO_PUBLISH === 'true') ? 'published' : 'draft',
    qualityScore: Number(data.qualityScore || 0),
    model,
  };
}

function buildNewsPrompt(candidate) {
  return `Источник: ${candidate.sourceName}
URL: ${candidate.url}
Оригинальный заголовок: ${candidate.title}
Дата: ${candidate.publishedAt || 'не указана'}
Описание из RSS: ${candidate.description || ''}

Сделай AI news digest на русском. Верни строго JSON без markdown:
{
  "slug": "latin-url-slug",
  "title": "новостной SEO title до 90 символов",
  "description": "meta description до 155 символов",
  "summary": "краткое резюме 2-3 предложения",
  "sections": [{"title":"Что произошло","text":"..."},{"title":"Почему это важно","text":"..."},{"title":"Что это значит для маркетинга и e-commerce","text":"..."}],
  "adgenaAngle": "мягкий абзац про то, что AdGena помогает делать AI-визуалы для карточек, рекламы и соцсетей",
  "sourceNote": "Источник: ...",
  "qualityScore": 0-100
}

Правила:
- Не копируй текст источника, делай summary + commentary.
- Не выдумывай факты сверх RSS-описания.
- Если фактов мало, пиши осторожно: "согласно источнику", "компания сообщила".
- Не делай громких обещаний про AdGena.
- Статья должна быть полезна предпринимателю, маркетологу или продавцу на маркетплейсе.`;
}

function normalizeNewsBody(data, candidate) {
  return {
    sections: Array.isArray(data.sections) ? data.sections.slice(0, 4) : [],
    adgenaAngle: cleanText(data.adgenaAngle, 'Если нужно быстро проверить визуальную гипотезу для товара, можно использовать AdGena: загрузить фото продукта и получить AI-креатив для карточки, рекламы или соцсетей.', 700),
    sourceNote: cleanText(data.sourceNote, `Источник: ${candidate.sourceName}`, 180),
  };
}

function parseRss(xml, sourceName) {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  return items.map((item) => {
    const title = stripXml(readTag(item, 'title'));
    const link = stripXml(readTag(item, 'link')) || readAtomLink(item);
    const description = stripXml(readTag(item, 'description') || readTag(item, 'content:encoded'));
    const publishedAt = stripXml(readTag(item, 'pubDate') || readTag(item, 'published') || readTag(item, 'updated'));
    return { sourceName, title, url: link, description, publishedAt };
  }).filter((item) => item.title && item.url);
}

function readTag(xml, tag) {
  const escaped = tag.replace(':', '\\:');
  const re = new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)<\\/${escaped}>`, 'i');
  return xml.match(re)?.[1] || '';
}

function readAtomLink(xml) {
  return xml.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || '';
}

function stripXml(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function isRelevantAiNews(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  return ['ai', 'artificial intelligence', 'openai', 'gpt', 'image', 'video', 'model', 'генера'].some((word) => text.includes(word));
}

function cleanText(value, fallback, max) {
  const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1).trim() : text;
}
