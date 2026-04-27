/**
 * APIYI Client — AI Image & Text Generation
 * Uses Nano Banana Pro (gemini-3-pro-image-preview) for product card generation
 * OpenAI-compatible SDK
 */

import OpenAI from 'openai';
import { MARKETPLACE_PROMPTS, AD_PROMPTS } from './prompts.js';

const client = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: process.env.APIYI_BASE_URL || 'https://api.apiyi.com/v1',
});

// ========================================
// GENERATION FUNCTION
// ========================================

/**
 * Generate a complete product card or ad creative via AI
 */
export async function generateProductCard({
  imageBase64,
  mimeType = 'image/png',
  templateId,
  productName,
  bullets = [],
  type = 'photo',
  headline = '',
  cta = '',
  lang = 'ru',
  aspectRatio = '3:4',
}) {
  let prompt;

  if (type === 'ads') {
    const promptFn = AD_PROMPTS[templateId] || AD_PROMPTS['ad-minimal'];
    prompt = typeof promptFn === 'function' ? promptFn(productName, headline, cta, lang) : promptFn;
  } else {
    // 'photo' and 'card' both use MARKETPLACE_PROMPTS
    const fallback = type === 'card' ? 'infographic' : 'in-context';
    const promptFn = MARKETPLACE_PROMPTS[templateId] || MARKETPLACE_PROMPTS[fallback];
    prompt = typeof promptFn === 'function' ? promptFn(productName, bullets, lang) : promptFn;
  }

  // Inject aspect ratio instruction
  prompt += `\n\nIMPORTANT: Generate the image in ${aspectRatio} aspect ratio.`;

  console.log(`[APIYI] Generating ${type} | template: ${templateId} | ratio: ${aspectRatio} | lang: ${lang}`);
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
