/**
 * APIYI Client — AI Image & Text Generation
 * Uses Nano Banana Pro (gemini-3-pro-image-preview) for product card generation
 * OpenAI-compatible SDK
 * Supports both RU and EN markets
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: process.env.APIYI_BASE_URL || 'https://api.apiyi.com/v1',
});

// ========================================
// MARKETPLACE CARD PROMPTS
// ========================================

const MARKETPLACE_PROMPTS = {
  // ---- UNIVERSAL / RU-first ----
  'white-studio': (name, bullets, lang) => lang === 'en'
    ? `Create a professional product photo on a PURE WHITE background for Amazon/eBay listing.
Product: "${name}"
${bullets.length ? `Features:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Requirements:
- Pure white (#FFFFFF) background, suitable for Amazon main image
- Product centered, taking up 85% of frame
- Studio-quality lighting with soft shadows
- No text overlays, no graphics, just the product
- Square 1:1 format, high resolution look
- Professional commercial photography style`
    : `Создай профессиональное студийное фото товара на ЧИСТО БЕЛОМ фоне для маркетплейса.
Товар: "${name}"
${bullets.length ? `Характеристики:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Требования:
- Чисто белый фон (#FFFFFF)
- Товар по центру, занимает 85% кадра
- Студийный свет с мягкими тенями
- Без текста и графики, только товар
- Квадратный формат 1:1
- Стиль коммерческой фотографии`,

  'minimal-clean': (name, bullets, lang) => lang === 'en'
    ? `Create a clean minimalist product listing card.
Product: "${name}"
${bullets.length ? `Key features:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Clean white/light background
- Product prominently displayed in center-top (60% of card)
- Product name in bold dark text below
- Feature bullets with green checkmarks
- Modern minimalist, no clutter
- Vertical 3:4 ratio
- Professional e-commerce quality`
    : `Создай карточку товара в минималистичном стиле для маркетплейса.
Товар: "${name}"
${bullets.length ? `Преимущества:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Дизайн:
- Чистый белый/светлый фон
- Товар крупно по центру сверху (60% карточки)
- Название жирным тёмным шрифтом
- Буллеты с зелёными чекмарками
- Минималистичный стиль без лишнего
- Вертикальный формат 3:4
- Текст на русском языке`,

  'gradient-modern': (name, bullets, lang) => lang === 'en'
    ? `Create a vibrant gradient product card for marketplace listing.
Product: "${name}"
${bullets.length ? `Features:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Bold purple-to-blue gradient background
- Product floating in center with subtle shadow
- Large bold white title text at top
- Feature bullets in white with golden arrow icons
- Modern, eye-catching, premium feel
- Vertical 3:4 ratio`
    : `Создай яркую карточку товара с градиентом для маркетплейса.
Товар: "${name}"
${bullets.length ? `Преимущества:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Дизайн:
- Яркий фиолетово-синий градиент
- Товар по центру с тенью
- Крупный жирный белый заголовок сверху
- Буллеты белым с золотыми стрелками
- Современный, привлекающий внимание
- Вертикальный формат 3:4
- Текст на русском языке`,

  'dark-premium': (name, bullets, lang) => lang === 'en'
    ? `Create a luxury premium product card for high-end listing.
Product: "${name}"
${bullets.length ? `Features:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Dark navy/black background with subtle golden accents
- Product in center with dramatic lighting and glow
- Gold/champagne elegant title text
- Feature bullets with diamond icons in gold
- "PREMIUM" badge in top-right corner
- Luxurious, expensive aesthetic
- Vertical 3:4 ratio`
    : `Создай премиальную карточку товара в люксовом стиле.
Товар: "${name}"
${bullets.length ? `Преимущества:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Дизайн:
- Тёмный фон с золотыми акцентами
- Товар с драматичным освещением и свечением
- Золотой элегантный заголовок
- Буллеты с бриллиантовыми иконками золотом
- Бейдж "PREMIUM" справа сверху
- Люксовый, дорогой стиль
- Вертикальный формат 3:4
- Текст на русском языке`,

  'neon-vibrant': (name, bullets, lang) => lang === 'en'
    ? `Create a cyberpunk neon style product card.
Product: "${name}"
${bullets.length ? `Features:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Dark background with neon glow effects (cyan, magenta, purple)
- Product in center with neon outline glow
- Electric blue title text with neon glow
- Feature bullets with lightning bolt icons
- Futuristic, gaming, tech aesthetic
- Vertical 3:4 ratio`
    : `Создай карточку товара в кибер/неон стиле.
Товар: "${name}"
${bullets.length ? `Преимущества:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Дизайн:
- Тёмный фон с неоновым свечением (голубой, розовый, фиолетовый)
- Товар с неоновым контуром
- Заголовок электрик-синим с неоновым свечением
- Буллеты с молниями
- Футуристичный, гейминг, тех стиль
- Вертикальный формат 3:4
- Текст на русском языке`,

  'nature-organic': (name, bullets, lang) => lang === 'en'
    ? `Create an eco-friendly organic product card.
Product: "${name}"
${bullets.length ? `Features:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Warm beige/cream background with leaf decorations
- Product placed naturally in center
- Green earth-tone title text
- Feature bullets with leaf/plant icons
- "ECO" badge in top-left
- Natural, organic aesthetic
- Vertical 3:4 ratio`
    : `Создай эко-карточку товара в натуральном стиле.
Товар: "${name}"
${bullets.length ? `Преимущества:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Дизайн:
- Тёплый бежевый фон с листьями
- Товар естественно по центру
- Зелёный заголовок в земляных тонах
- Буллеты с иконками листьев
- Бейдж "ЭКО" слева сверху
- Натуральный, органический стиль
- Вертикальный формат 3:4
- Текст на русском языке`,

  'lifestyle-context': (name, bullets, lang) => lang === 'en'
    ? `Create a lifestyle product photo showing this product in a real-life context.
Product: "${name}"
${bullets.length ? `Features:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Product shown in a natural environment (home, office, outdoors — choose most appropriate)
- Warm, inviting lighting
- Minimal text — small product name only
- Lifestyle/editorial photography style
- Etsy/Pinterest aesthetic
- Vertical 3:4 or square 1:1 ratio`
    : `Создай lifestyle-фото товара в реальном контексте использования.
Товар: "${name}"

Дизайн:
- Товар в естественной среде (дом, офис, природа — выбери подходящее)
- Тёплое уютное освещение
- Минимум текста — только название мелко
- Стиль lifestyle/editorial фотографии
- Вертикальный 3:4 или квадрат 1:1`,

  'infographic-pro': (name, bullets, lang) => lang === 'en'
    ? `Create a professional infographic product card with icons and specifications.
Product: "${name}"
${bullets.length ? `Specifications:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Light/white background
- Product in center (40% of card)
- Around the product: infographic-style icons with feature callouts
- Each feature has a small icon + short text label
- Clean lines connecting icons to product
- Professional, informative style
- Vertical 3:4 ratio`
    : `Создай профессиональную инфографику для карточки товара.
Товар: "${name}"
${bullets.length ? `Характеристики:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Дизайн:
- Светлый/белый фон
- Товар по центру (40% карточки)
- Вокруг товара: иконки с характеристиками в стиле инфографики
- У каждой характеристики маленькая иконка + текст
- Линии от иконок к товару
- Профессиональный, информативный стиль
- Вертикальный формат 3:4
- Текст на русском языке`,

  'amazon-a-plus': (name, bullets, lang) => `Create an Amazon A+ Enhanced Brand Content module.
Product: "${name}"
${bullets.length ? `Features:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Wide horizontal layout suitable for Amazon A+ content
- Product photo on the left (40%), feature text on the right
- Clean typography, serif headings, sans-serif body
- Feature bullets with custom icons
- Premium brand storytelling feel
- White/light background with accent color
- Horizontal 16:9 or 3:2 ratio
- English text only`,

  'comparison-split': (name, bullets, lang) => lang === 'en'
    ? `Create a comparison/split product card showing product advantages.
Product: "${name}"
${bullets.length ? `Advantages:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Design:
- Split layout: left side "WITHOUT" (red/gray), right side "WITH ${name}" (green/bright)
- Product prominently on the right side
- Comparison checkmarks/crosses
- Bold text highlighting benefits
- Square 1:1 or vertical 3:4 ratio`
    : `Создай карточку-сравнение товара.
Товар: "${name}"
${bullets.length ? `Преимущества:\n${bullets.map(b => `• ${b}`).join('\n')}` : ''}

Дизайн:
- Разделённый layout: слева "БЕЗ" (красный/серый), справа "С ${name}" (зелёный/яркий)
- Товар крупно справа
- Галочки и крестики для сравнения
- Жирный текст с преимуществами
- Вертикальный 3:4
- Текст на русском языке`,
};

// ========================================
// AD CREATIVE PROMPTS
// ========================================

const AD_PROMPTS = {
  'ad-bold-sale': (name, headline, cta, lang) => lang === 'en'
    ? `Create a bold sale advertising creative.
Product: "${name}"
Headline: "${headline || 'UP TO 50% OFF'}"
CTA: "${cta || 'Shop Now'}"

Design:
- Vibrant red-to-orange gradient background
- Product on the left (50%)
- HUGE bold white headline text on right
- Prominent pill-shaped CTA button
- Energetic, urgent, high-converting
- Price tag or discount badge element
- Square 1:1 format`
    : `Создай яркий рекламный креатив для распродажи.
Товар: "${name}"
Заголовок: "${headline || 'СКИДКА ДО 50%'}"
CTA: "${cta || 'Купить сейчас'}"

Дизайн:
- Яркий красно-оранжевый градиент
- Товар слева (50%)
- ОГРОМНЫЙ жирный белый заголовок справа
- Заметная CTA кнопка
- Энергичный, срочный, продающий
- Бейдж скидки
- Квадрат 1:1
- Текст на русском языке`,

  'ad-minimal-product': (name, headline, cta, lang) => lang === 'en'
    ? `Create a minimalist product advertising creative.
Product: "${name}"
Headline: "${headline || name}"
CTA: "${cta || 'Learn More'}"

Design:
- Clean white/light gray background
- Product centered prominently (large, 60%)
- Clean dark headline text below
- Dark CTA button at bottom
- Apple-style minimalist aesthetic
- Lots of whitespace
- Square 1:1 format`
    : `Создай минималистичный рекламный креатив.
Товар: "${name}"
Заголовок: "${headline || name}"
CTA: "${cta || 'Подробнее'}"

Дизайн:
- Чистый белый/светло-серый фон
- Товар крупно по центру (60%)
- Тёмный заголовок снизу
- Тёмная CTA кнопка
- Apple-стиль минимализм
- Много воздуха
- Квадрат 1:1
- Текст на русском языке`,

  'ad-dark-luxury': (name, headline, cta, lang) => lang === 'en'
    ? `Create a luxury dark advertising creative.
Product: "${name}"
Headline: "${headline || name}"
CTA: "${cta || 'Discover'}"

Design:
- Deep dark navy/black background
- Product with dramatic studio lighting
- Elegant thin uppercase title in champagne/gold, wide letter spacing
- CTA with gold border, no fill, uppercase
- Ultra premium luxury aesthetic
- Square 1:1 format`
    : `Создай люксовый рекламный креатив на тёмном фоне.
Товар: "${name}"
Заголовок: "${headline || name}"
CTA: "${cta || 'Узнать больше'}"

Дизайн:
- Глубокий тёмный фон
- Товар с драматичным освещением
- Элегантный тонкий заголовок золотом
- CTA с золотой рамкой
- Ультра-премиум стиль
- Квадрат 1:1
- Текст на русском языке`,

  'ad-social-story': (name, headline, cta, lang) => lang === 'en'
    ? `Create a vertical social media story advertising creative.
Product: "${name}"
Headline: "${headline || name}"
CTA: "${cta || 'Swipe Up'}"

Design:
- Purple-to-violet gradient background
- Product in center area
- Bold large white headline
- White pill CTA button at bottom
- Swipe-up arrow indicator
- Energetic, social media native
- Vertical 9:16 story format`
    : `Создай вертикальный рекламный креатив для stories.
Товар: "${name}"
Заголовок: "${headline || name}"
CTA: "${cta || 'Узнать'}"

Дизайн:
- Фиолетовый градиент
- Товар по центру
- Крупный белый заголовок
- Белая CTA кнопка снизу
- Стрелка вверх (swipe)
- Вертикальный 9:16
- Текст на русском языке`,

  'ad-google-banner': (name, headline, cta, lang) => `Create a Google Display Network banner ad.
Product: "${name}"
Headline: "${headline || name}"
CTA: "${cta || 'Shop Now'}"

Design:
- Horizontal 1200x628 banner format
- Product on left (40%), headline + CTA on right
- Clean corporate background (white or light brand color)
- Clear, readable headline
- Prominent CTA button
- Logo placeholder area in corner
- Professional, click-worthy`,

  'ad-retargeting': (name, headline, cta, lang) => lang === 'en'
    ? `Create a retargeting advertising creative.
Product: "${name}"
Headline: "${headline || 'Still thinking about it?'}"
CTA: "${cta || 'Complete Purchase'}"

Design:
- Clean background with urgency feel
- Product prominently displayed
- Persuasive headline (urgency/scarcity)
- Bright CTA button
- Optional: "Limited stock" or "X% off if you buy now" badge
- Square 1:1 format`
    : `Создай креатив для ретаргетинга.
Товар: "${name}"
Заголовок: "${headline || 'Всё ещё думаете?'}"
CTA: "${cta || 'Оформить заказ'}"

Дизайн:
- Чистый фон с ощущением срочности
- Товар крупно
- Убеждающий заголовок
- Яркая CTA кнопка
- Бейдж "Осталось мало" или "Скидка при заказе сейчас"
- Квадрат 1:1
- Текст на русском языке`,
};

// ========================================
// GENERATION FUNCTION
// ========================================

/**
 * Generate a complete product card or ad creative via AI
 * @param {Object} params
 * @param {string} params.imageBase64 - Product photo in base64
 * @param {string} params.mimeType - Image MIME type
 * @param {string} params.templateId - Template to use
 * @param {string} params.productName - Product name
 * @param {string[]} params.bullets - Feature bullets
 * @param {string} params.type - 'marketplace' or 'ads'
 * @param {string} params.headline - Ad headline
 * @param {string} params.cta - CTA text
 * @param {string} params.lang - 'ru' or 'en'
 */
export async function generateProductCard({
  imageBase64,
  mimeType = 'image/png',
  templateId,
  productName,
  bullets = [],
  type = 'marketplace',
  headline = '',
  cta = '',
  lang = 'ru',
}) {
  let prompt;

  if (type === 'marketplace') {
    const promptFn = MARKETPLACE_PROMPTS[templateId] || MARKETPLACE_PROMPTS['minimal-clean'];
    prompt = typeof promptFn === 'function'
      ? promptFn(productName, bullets, lang)
      : promptFn;
  } else {
    const promptFn = AD_PROMPTS[templateId] || AD_PROMPTS['ad-minimal-product'];
    prompt = typeof promptFn === 'function'
      ? promptFn(productName, headline, cta, lang)
      : promptFn;
  }

  console.log(`[APIYI] Generating ${type} card | template: ${templateId} | lang: ${lang}`);
  console.log(`[APIYI] Product: ${productName}`);

  const response = await client.chat.completions.create({
    model: process.env.IMAGE_GEN_MODEL || 'gemini-3-pro-image-preview',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      },
    ],
  });

  const message = response.choices?.[0]?.message;
  if (!message) throw new Error('No response from APIYI');

  // Extract image from response
  let imageData = null;

  // Array content (multimodal)
  if (Array.isArray(message.content)) {
    for (const part of message.content) {
      if (part.type === 'image_url' && part.image_url?.url) { imageData = part.image_url.url; break; }
      if (part.type === 'image' && part.source?.data) { imageData = `data:image/png;base64,${part.source.data}`; break; }
      if (part.inline_data?.data) { imageData = `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`; break; }
    }
  }

  // String content (Nano Banana format)
  if (!imageData && typeof message.content === 'string') {
    const content = message.content;
    const mdMatch = content.match(/!\[.*?\]\((data:image\/\w+;base64,[A-Za-z0-9+/=]+)\)/);
    if (mdMatch) { imageData = mdMatch[1]; }
    else if (content.startsWith('data:image')) { imageData = content; }
    else if (content.startsWith('http')) { imageData = content; }
    else {
      const dataUrlMatch = content.match(/(data:image\/\w+;base64,[A-Za-z0-9+/=]+)/);
      if (dataUrlMatch) { imageData = dataUrlMatch[1]; }
      else if (content.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(content.substring(0, 100))) {
        imageData = `data:image/png;base64,${content}`;
      }
    }
  }

  return {
    success: !!imageData,
    imageData,
    model: response.model,
    usage: response.usage,
    rawContent: message.content,
  };
}

// ========================================
// TEXT GENERATION
// ========================================

export async function generateProductText({ productName, category, keywords, lang = 'ru' }) {
  const isEn = lang === 'en';

  const systemPrompt = isEn
    ? `You are an e-commerce copywriting expert for Amazon, eBay, Etsy. Reply in strict JSON format, no markdown.`
    : `Ты — эксперт по маркетплейсам Wildberries и Ozon. Отвечай строго в JSON без markdown.`;

  const userPrompt = isEn
    ? `Product: ${productName}
Category: ${category || 'N/A'}
Keywords: ${keywords || 'N/A'}

JSON format:
{
  "title": "SEO title up to 100 chars",
  "subtitle": "Short description up to 60 chars",
  "bullets": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"],
  "description": "Selling description 2-3 sentences",
  "cta": "Call to action"
}`
    : `Товар: ${productName}
Категория: ${category || 'Не указана'}
Ключевые слова: ${keywords || 'Не указаны'}

JSON формат:
{
  "title": "SEO-название до 100 символов",
  "subtitle": "Короткое описание до 60 символов",
  "bullets": ["Преимущество 1", "Преимущество 2", "Преимущество 3", "Преимущество 4", "Преимущество 5"],
  "description": "Продающее описание 2-3 предложения",
  "cta": "Призыв к действию"
}`;

  const response = await client.chat.completions.create({
    model: process.env.AI_TEXT_MODEL || 'gpt-5.4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  const content = response.choices[0].message.content;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    return JSON.parse(jsonMatch[1].trim());
  } catch {
    return { title: productName, subtitle: '', bullets: [], description: '', cta: isEn ? 'Buy Now' : 'Купить сейчас' };
  }
}

export async function generateAdCopy({ productName, targetAudience, platform, lang = 'ru' }) {
  const isEn = lang === 'en';

  const systemPrompt = isEn
    ? `You are a creative ad copywriter. Reply in strict JSON, no markdown.`
    : `Ты — креативный копирайтер для рекламы. JSON без markdown.`;

  const userPrompt = isEn
    ? `Product: ${productName}
Target: ${targetAudience || 'Broad'}
Platform: ${platform || 'Universal'}

JSON:
{
  "headline": "Headline up to 40 chars",
  "subheadline": "Subheadline up to 60 chars",
  "cta": "CTA button up to 20 chars",
  "body": "Body text 1-2 sentences",
  "hashtags": ["#hashtag1", "#hashtag2"]
}`
    : `Товар: ${productName}
ЦА: ${targetAudience || 'Широкая'}
Платформа: ${platform || 'Универсальная'}

JSON:
{
  "headline": "Заголовок до 40 символов",
  "subheadline": "Подзаголовок до 60 символов",
  "cta": "Кнопка CTA до 20 символов",
  "body": "Основной текст 1-2 предложения",
  "hashtags": ["#хештег1", "#хештег2"]
}`;

  const response = await client.chat.completions.create({
    model: process.env.AI_TEXT_MODEL || 'gpt-5.4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 500,
  });

  const content = response.choices[0].message.content;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    return JSON.parse(jsonMatch[1].trim());
  } catch {
    return { headline: productName, subheadline: '', cta: isEn ? 'Learn More' : 'Подробнее', body: '', hashtags: [] };
  }
}

export default client;
