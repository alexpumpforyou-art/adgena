/**
 * AI Image & Text Generation
 * Supports:
 *   - GPT Image via direct OpenAI /images/edits (product image → styled output)
 *   - gemini-3-pro-image-preview via APIYI /chat/completions
 *   - Text generation via APIYI
 */

import OpenAI from 'openai';
import { getPhotoPrompt, getCardPrompt, AD_PROMPTS, getPromptOverride } from './prompts.js';
import { getSetting } from './db.js';

const apiyiClient = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: process.env.APIYI_BASE_URL || 'https://api.apiyi.com/v1',
});

const PRODUCT_FIDELITY_RU = `Сохрани точную идентичность товара с референса: форму, пропорции, цвет, материал, упаковку, расположение этикетки/логотипа и узнаваемые детали. Не редизайни товар, не меняй цвет и не добавляй несуществующие элементы.`;
const PRODUCT_FIDELITY_EN = `Preserve the exact product identity from the reference image: shape, proportions, color, material, packaging, label placement, logo position and distinctive details. Do not redesign the product, change its color, or add non-existing elements.`;
const AD_SAFE_ZONE_RU = `Держи весь текст, цену и CTA внутри безопасных полей минимум 8% от краёв. Не обрезай текст, товар, ценник или кнопку.`;
const AD_SAFE_ZONE_EN = `Keep all text, price and CTA inside a safe margin of at least 8% from all edges. Do not crop text, product, price badge or CTA.`;

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
  if (process.env.DISABLE_OPENAI_IMAGE_GENERATION === 'true') {
    throw new Error('Генерация карточек и рекламы временно отключена. Мы настраиваем стабильную очередь генераций.');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured for direct GPT Image generation');
  }

  const size = RATIO_TO_SIZE[aspectRatio] || '1024x1536';
  const model = process.env.IMAGE_GEN_MODEL_OPENAI || 'gpt-image-2';
  const responseModel = process.env.OPENAI_RESPONSES_MODEL || 'gpt-5.5';
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: parseInt(process.env.OPENAI_IMAGE_TIMEOUT_MS || '240000', 10),
  });

  console.log(`[OPENAI GPT-IMAGE] Model: ${model} via Responses ${responseModel} | Size: ${size}`);

  const startedAt = Date.now();
  const response = await openaiClient.responses.create({
    model: responseModel,
    input: [
      {
        role: 'user',
        content: [
          { type: 'input_text', text: prompt },
          { type: 'input_image', image_url: `data:${mimeType || 'image/png'};base64,${imageBase64}` },
        ],
      },
    ],
    tools: [
      {
        type: 'image_generation',
        model,
        size,
        quality: process.env.OPENAI_IMAGE_QUALITY || 'low',
      },
    ],
  });
  console.log(`[OPENAI GPT-IMAGE] Responses completed in ${Date.now() - startedAt}ms`);

  const imageCall = response.output?.find(output => output.type === 'image_generation_call');
  const b64 = imageCall?.result;
  if (b64) {
    return `data:image/png;base64,${b64}`;
  }

  console.error('[OPENAI GPT-IMAGE] No image in response', {
    outputTypes: response.output?.map(output => output.type) || [],
    responseKeys: response ? Object.keys(response) : [],
  });
  return null;
}

// ========================================
// GEMINI FALLBACK (chat completions API)
// ========================================

async function generateWithGemini({ prompt, imageBase64, mimeType }) {
  const model = process.env.IMAGE_GEN_MODEL_GEMINI || process.env.IMAGE_GEN_MODEL || 'gemini-3-pro-image-preview';

  const response = await apiyiClient.chat.completions.create({
    model,
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
  cardStyle = 'infographic',
  creativity = 0.5,
  noText = false,
}) {
  let prompt;

  if (type === 'ads') {
    const override = getPromptOverride(`ads.${templateId}`);
    if (override) {
      prompt = override;
    } else {
      const promptFn = AD_PROMPTS[templateId] || AD_PROMPTS['ad-minimal'];
      prompt = typeof promptFn === 'function'
        ? promptFn(productName, headline, cta, lang, { price, showButton, category })
        : promptFn;
    }
    prompt += `\n\n${lang === 'en' ? PRODUCT_FIDELITY_EN : PRODUCT_FIDELITY_RU}\n${lang === 'en' ? AD_SAFE_ZONE_EN : AD_SAFE_ZONE_RU}`;
  } else if (type === 'card') {
    prompt = getPromptOverride(`card.${cardStyle}`)
      || getCardPrompt({ productName, bullets, lang, cardText, cardStyle, creativity, wishes, category });
  } else {
    // 'photo' — category-aware
    prompt = getPromptOverride(`photo.${templateId}`)
      || getPhotoPrompt({ conceptId: templateId, category, productName, bullets, lang, wishes });
  }

  // Inject aspect ratio
  prompt += `\n\nIMPORTANT: Generate the image in ${aspectRatio} aspect ratio.`;

  // No text mode: override to remove all text from the image
  if (noText) {
    prompt += `\n\nCRITICAL OVERRIDE: Do NOT place ANY text, letters, words, numbers, headlines, labels, watermarks, or typography on the image. The image must be completely free of any written content. Only the product and visual design elements are allowed.`;
  }

  // === MODEL ROUTING ===
  // Rule: card/ads → OpenAI gpt-image-2 (better typography and layouts).
  //       photo → Gemini (cheaper, better photorealism).
  // Env overrides:
  //   IMAGE_GEN_MODEL_FORCE=gpt-image → force OpenAI for everything
  //   IMAGE_GEN_MODEL_FORCE=gemini    → force Gemini for everything
  //   ALLOW_GPT_IMAGE_FALLBACK=true → allow fallback to Gemini after GPT Image failure
  const adminProvider = getSetting('image_layout_provider') || 'openai';
  const forced = (process.env.IMAGE_GEN_MODEL_FORCE || '').toLowerCase();
  const needsLayout = type === 'ads' || type === 'card';
  const allowGptFallback = process.env.ALLOW_GPT_IMAGE_FALLBACK === 'true';
  const useGptImage = forced.startsWith('gpt-image') ? true
                    : forced.startsWith('gemini')    ? false
                    : needsLayout ? adminProvider !== 'gemini' : false;

  const GPT_IMAGE_MODEL = process.env.IMAGE_GEN_MODEL_OPENAI || 'gpt-image-2';
  const GEMINI_MODEL    = process.env.IMAGE_GEN_MODEL_GEMINI || process.env.IMAGE_GEN_MODEL || 'gemini-3-pro-image-preview';

  const COST_GPT_IMAGE = parseFloat(process.env.COST_GPT_IMAGE || '0.19');
  const COST_GEMINI    = parseFloat(process.env.COST_GEMINI    || '0.09');

  console.log(`[AI] ${type} | concept: ${templateId} | cat: ${category} | ratio: ${aspectRatio} | lang: ${lang} | forced: ${forced || 'auto'} | adminProvider: ${adminProvider} | needsLayout: ${needsLayout} | route: ${useGptImage ? 'openai-direct' : 'apiyi-gemini'}`);
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
      if (needsLayout && !allowGptFallback) {
        return {
          success: false,
          imageData: null,
          model: GPT_IMAGE_MODEL,
          costUsd: 0,
          rawContent: `[GPT-IMAGE-2 failed] ${err.message}`,
        };
      }
      console.log('[AI] Falling back to APIYI Gemini...');
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

  const response = await apiyiClient.chat.completions.create({
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

  const response = await apiyiClient.chat.completions.create({
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

export default apiyiClient;

