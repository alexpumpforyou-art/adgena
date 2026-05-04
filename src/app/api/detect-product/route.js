import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: process.env.APIYI_BASE_URL || 'https://api.apiyi.com/v1',
});

const CATEGORIES = [
  { id: 'clothing', name: 'Одежда и обувь' },
  { id: 'accessories', name: 'Аксессуары' },
  { id: 'food', name: 'Еда и напитки' },
  { id: 'beauty', name: 'Косметика и уход' },
  { id: 'gadgets', name: 'Гаджеты и техника' },
  { id: 'home', name: 'Дом и сад' },
  { id: 'kids', name: 'Детские товары' },
  { id: 'other', name: 'Прочее' },
];

const CATEGORY_IDS = CATEGORIES.map(c => c.id);

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    if (!file) {
      return NextResponse.json({ error: 'No image' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';

    const response = await client.chat.completions.create({
      model: process.env.VISION_MODEL || 'gpt-4o-mini',
      max_tokens: 150,
      messages: [
        {
          role: 'system',
          content: `Ты эксперт по товарам. Анализируй фото и определи конкретное название товара и его категорию.

Правила для name:
- Будь КОНКРЕТНЫМ: не "рубашка" а "Поло с коротким рукавом", не "наушники" а "Беспроводные наушники накладные"
- Укажи тип/вид товара + ключевую характеристику (цвет, форма, материал)
- 2-5 слов, на русском, с большой буквы
- Примеры: "Кожаный рюкзак чёрный", "Кроссовки беговые белые", "Худи оверсайз серое"

Категории: ${CATEGORY_IDS.join(', ')}

Ответь ТОЛЬКО JSON: {"name":"...","category":"..."}`,
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
            { type: 'text', text: 'Определи точное название и категорию этого товара.' },
          ],
        },
      ],
    });

    const text = response.choices?.[0]?.message?.content?.trim() || '';
    console.log('[Detect] Raw response:', text);

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonStr = text.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback: try to extract name
      parsed = { name: text.slice(0, 50), category: 'other' };
    }

    // Validate category
    if (!CATEGORY_IDS.includes(parsed.category)) {
      parsed.category = 'other';
    }

    return NextResponse.json({
      success: true,
      name: parsed.name || '',
      category: parsed.category || 'other',
    });
  } catch (error) {
    console.error('[Detect] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
