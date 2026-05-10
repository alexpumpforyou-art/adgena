import OpenAI from 'openai';

const DEFAULT_KEYWORDS = [
  { keyword: 'генератор карточек товара для Wildberries', cluster: 'marketplaces', intent: 'tool', priority: 100 },
  { keyword: 'инфографика для карточки товара Ozon', cluster: 'marketplaces', intent: 'tool', priority: 95 },
  { keyword: 'рекламный креатив для косметики', cluster: 'niches', intent: 'commercial', priority: 90 },
  { keyword: 'баннер для Telegram Ads', cluster: 'ads', intent: 'tool', priority: 88 },
  { keyword: 'креатив для VK рекламы', cluster: 'ads', intent: 'tool', priority: 86 },
  { keyword: 'реклама для салона красоты', cluster: 'niches', intent: 'commercial', priority: 84 },
  { keyword: 'промо баннер для товара', cluster: 'ads', intent: 'tool', priority: 82 },
  { keyword: 'нейросеть для маркетплейсов', cluster: 'ai', intent: 'tool', priority: 80 },
  { keyword: 'генератор продуктовых фото', cluster: 'ai', intent: 'tool', priority: 78 },
  { keyword: 'реклама для ресторана', cluster: 'niches', intent: 'commercial', priority: 76 },
];

export function getDefaultContentKeywords() {
  return DEFAULT_KEYWORDS;
}

export function slugifyRu(input) {
  const map = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y',ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return String(input || '')
    .toLowerCase()
    .split('')
    .map((ch) => map[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `seo-${Date.now()}`;
}

export async function generateSeoDraft(keywordRow) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const model = process.env.OPENAI_CONTENT_MODEL || 'gpt-4o-mini';
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 120000 });
  const prompt = buildPrompt(keywordRow);
  const completion = await client.chat.completions.create({
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Ты SEO-редактор SaaS AdGena. Пиши полезный, конкретный русский контент без выдуманных функций, гарантий, цифр продаж и медицинских/финансовых обещаний.' },
      { role: 'user', content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || '{}';
  const data = JSON.parse(raw);
  const slug = slugifyRu(data.slug || keywordRow.keyword);

  return {
    keywordId: keywordRow.id,
    keyword: keywordRow.keyword,
    slug,
    title: cleanText(data.title, `${keywordRow.keyword} — AdGena`, 90),
    description: cleanText(data.description, `Создавайте визуалы по запросу «${keywordRow.keyword}» с помощью AdGena.`, 160),
    h1: cleanText(data.h1, keywordRow.keyword, 90),
    lead: cleanText(data.lead, `AdGena помогает быстро подготовить визуалы для задачи: ${keywordRow.keyword}.`, 420),
    body: normalizeBody(data),
    status: 'draft',
    model,
  };
}

function buildPrompt(keywordRow) {
  return `Сгенерируй draft SEO-страницы для AdGena по ключу: "${keywordRow.keyword}".
Кластер: ${keywordRow.cluster || 'не указан'}.
Интент: ${keywordRow.intent || 'commercial/tool'}.

Верни строго JSON без markdown:
{
  "slug": "latin-url-slug",
  "title": "SEO title до 80 символов",
  "description": "meta description до 155 символов",
  "h1": "H1",
  "lead": "вводный абзац 1-2 предложения",
  "benefits": [{"title":"...","text":"..."}],
  "sections": [{"title":"...","text":"..."}],
  "steps": ["...", "...", "..."],
  "faq": [{"q":"...","a":"..."}],
  "ctaTitle": "...",
  "ctaText": "..."
}

Требования:
- benefits: 3 пункта.
- sections: 2-3 смысловых блока.
- steps: 3 шага.
- faq: 4 вопроса.
- Не обещай рост продаж, CTR или модерацию площадок.
- Не пиши, что AdGena автоматически публикует в рекламные кабинеты.
- Упор на генерацию AI-визуалов, карточек, баннеров, промо по фото товара.
- Текст должен быть уникальным под ключ, не шаблонным.`;
}

function normalizeBody(data) {
  return {
    benefits: Array.isArray(data.benefits) ? data.benefits.slice(0, 4) : [],
    sections: Array.isArray(data.sections) ? data.sections.slice(0, 4) : [],
    steps: Array.isArray(data.steps) ? data.steps.slice(0, 5) : [],
    faq: Array.isArray(data.faq) ? data.faq.slice(0, 6) : [],
    ctaTitle: cleanText(data.ctaTitle, 'Создайте первый визуал в AdGena', 120),
    ctaText: cleanText(data.ctaText, 'Загрузите фото товара и проверьте, какой креатив получится для вашей задачи.', 240),
  };
}

function cleanText(value, fallback, max) {
  const text = String(value || fallback || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1).trim() : text;
}
