/**
 * APIYI Client — AI Image & Text Generation
 * Supports:
 *   - gpt-image-2 via /images/edits (product image → styled output)
 *   - gemini-3-pro-image-preview via /chat/completions (fallback)
 *   - Text generation (GPT 5.4)
 */

import OpenAI from 'openai';
import { getPhotoPrompt, getCardPrompt, AD_PROMPTS } from './prompts.js';

const client = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: process.env.APIYI_BASE_URL || 'https://api.apiyi.com/v1',
});

// Size map: aspect ratio → gpt-image-2 size
const RATIO_TO_SIZE = {
  '9:16': '1024x1536',
  '3:4':  '1024x1536',
  '1:1':  '1024x1024',
  '4:3':  '1536x1024',
  '16:9': '1536x1024',
};

// ========================================
// GPT-IMAGE-2 GENERATION (images API)
// ========================================

async function generateWithGptImage2({ prompt, imageBase64, mimeType, aspectRatio }) {
  const size = RATIO_TO_SIZE[aspectRatio] || '1024x1536';
  const model = process.env.IMAGE_GEN_MODEL || 'gpt-image-2';

  console.log(`[GPT-IMAGE-2] Model: ${model} | Size: ${size}`);

  // Convert base64 image to a File-like object for the SDK
  const imageBuffer = Buffer.from(imageBase64, 'base64');

  // Use images.edit with the reference image
  const response = await client.images.edit({
    model,
    prompt,
    image: new File([imageBuffer], 'product.png', { type: mimeType || 'image/png' }),
    n: 1,
    size,
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    console.error('[GPT-IMAGE-2] No b64_json in response');
    return null;
  }

  return `data:image/png;base64,${b64}`;
}

// ========================================
// GEMINI FALLBACK (chat completions API)
// ========================================

async function generateWithGemini({ prompt, imageBase64, mimeType }) {
  const response = await client.chat.completions.create({
    model: 'gemini-3-pro-image-preview',
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
  if (!message) return null;

  let imageData = null;

  // Array content (multimodal)
  if (Array.isArray(message.content)) {
    for (const part of message.content) {
      if (part.type === 'image_url' && part.image_url?.url) { imageData = part.image_url.url; break; }
      if (part.type === 'image' && part.source?.data) { imageData = `data:image/png;base64,${part.source.data}`; break; }
      if (part.inline_data?.data) { imageData = `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`; break; }
    }
  }

  // String content
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

  return imageData;
}

// ========================================
// MAIN GENERATION FUNCTION
// ========================================

/**
 * Generate a product photo, card, or ad creative via AI
 */
export async function generateProductCard({
  imageBase64,
  mimeType = 'image/png',
  templateId,
  productName,
  bullets = [],
  type = 'photo',
  category = 'other',
  headline = '',
  cta = '',
  price = '',
  showButton = false,
  lang = 'ru',
  aspectRatio = '3:4',
  wishes = '',
  cardText = '',
  cardStyle = 'classic',
  creativity = 0.5,
}) {
  let prompt;

  if (type === 'ads') {
    const promptFn = AD_PROMPTS[templateId] || AD_PROMPTS['ad-minimal'];
    prompt = typeof promptFn === 'function'
      ? promptFn(productName, headline, cta, lang, { price, showButton })
      : promptFn;
  } else if (type === 'card') {
    prompt = getCardPrompt({ productName, bullets, lang, cardText, cardStyle, creativity, wishes });
  } else {
    // 'photo' — category-aware
    prompt = getPhotoPrompt({ conceptId: templateId, category, productName, bullets, lang, wishes });
  }

  // Inject aspect ratio
  prompt += `\n\nIMPORTANT: Generate the image in ${aspectRatio} aspect ratio.`;

  // === MODEL ROUTING ===
  // Rule: if output must contain text (card/ads) → OpenAI gpt-image-2 (better typography).
  //       photo → Gemini (cheaper, better photorealism).
  // Env overrides:
  //   IMAGE_GEN_MODEL=gpt-image-2  → force OpenAI for everything
  //   IMAGE_GEN_MODEL=gemini       → force Gemini for everything
  const forced = (process.env.IMAGE_GEN_MODEL || '').toLowerCase();
  const wantsText = type === 'ads' || type === 'card';
  const useGptImage = forced.startsWith('gpt-image') ? true
                    : forced.startsWith('gemini')    ? false
                    : wantsText;

  const GPT_IMAGE_MODEL = process.env.IMAGE_GEN_MODEL_OPENAI || 'gpt-image-2';
  const GEMINI_MODEL    = 'gemini-3-pro-image-preview';

  const COST_GPT_IMAGE = parseFloat(process.env.COST_GPT_IMAGE || '0.19');
  const COST_GEMINI    = parseFloat(process.env.COST_GEMINI    || '0.09');

  console.log(`[APIYI] ${type} | concept: ${templateId} | cat: ${category} | ratio: ${aspectRatio} | lang: ${lang} | route: ${useGptImage ? 'openai' : 'gemini'}`);
  console.log(`[APIYI] Product: ${productName}`);

  let imageData = null;
  let modelUsed = null;
  let costUsd = 0;

  if (useGptImage) {
    try {
      imageData = await generateWithGptImage2({ prompt, imageBase64, mimeType, aspectRatio });
      modelUsed = GPT_IMAGE_MODEL;
      costUsd = COST_GPT_IMAGE;
    } catch (err) {
      console.error('[GPT-IMAGE-2] Error:', err.message);
      console.log('[APIYI] Falling back to Gemini...');
      imageData = await generateWithGemini({ prompt, imageBase64, mimeType });
      modelUsed = GEMINI_MODEL;
      costUsd = imageData ? COST_GEMINI : 0;
    }
  } else {
    imageData = await generateWithGemini({ prompt, imageBase64, mimeType });
    modelUsed = GEMINI_MODEL;
    costUsd = imageData ? COST_GEMINI : 0;
  }

  return {
    success: !!imageData,
    imageData,
    model: modelUsed,
    costUsd,
    rawContent: imageData ? '[image data]' : null,
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
    ? `Product: ${productName}\nCategory: ${category || 'N/A'}\nKeywords: ${keywords || 'N/A'}\n\nJSON format:\n{"title":"SEO title up to 100 chars","subtitle":"Short description up to 60 chars","bullets":["Benefit 1","Benefit 2","Benefit 3","Benefit 4","Benefit 5"],"description":"Selling description 2-3 sentences","cta":"Call to action"}`
    : `Товар: ${productName}\nКатегория: ${category || 'Не указана'}\nКлючевые слова: ${keywords || 'Не указаны'}\n\nJSON формат:\n{"title":"SEO-название до 100 символов","subtitle":"Короткое описание до 60 символов","bullets":["Преимущество 1","Преимущество 2","Преимущество 3","Преимущество 4","Преимущество 5"],"description":"Продающее описание 2-3 предложения","cta":"Призыв к действию"}`;

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
    ? `Product: ${productName}\nTarget: ${targetAudience || 'Broad'}\nPlatform: ${platform || 'Universal'}\n\nJSON:\n{"headline":"Headline up to 40 chars","subheadline":"Subheadline up to 60 chars","cta":"CTA button up to 20 chars","body":"Body text 1-2 sentences","hashtags":["#hashtag1","#hashtag2"]}`
    : `Товар: ${productName}\nЦА: ${targetAudience || 'Широкая'}\nПлатформа: ${platform || 'Универсальная'}\n\nJSON:\n{"headline":"Заголовок до 40 символов","subheadline":"Подзаголовок до 60 символов","cta":"Кнопка CTA до 20 символов","body":"Основной текст 1-2 предложения","hashtags":["#хештег1","#хештег2"]}`;

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
