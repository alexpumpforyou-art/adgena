import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isStaff } from '@/lib/db';
import { getPhotoPrompt, getCardPrompt, AD_PROMPTS } from '@/lib/prompts';
import fs from 'fs';
import path from 'path';

const OVERRIDES_PATH = path.join(process.cwd(), 'data', 'prompt-overrides.json');

function loadOverrides() {
  try {
    if (fs.existsSync(OVERRIDES_PATH)) {
      return JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {};
}

function saveOverrides(data) {
  const dir = path.dirname(OVERRIDES_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET — return all prompt templates for admin review
export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user || !isStaff(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sampleProduct = 'Пример товара';
  const sampleBullets = ['качество', 'натуральный состав', 'быстрый эффект'];

  const photoConcepts = ['on-model', 'in-store', 'flat-lay', 'studio', 'in-use', 'in-context', 'close-up', 'in-interior', 'texture', 'plated'];
  const adConcepts = ['ad-sale', 'ad-minimal', 'ad-story'];
  const cardStyles = ['classic', 'premium'];

  const prompts = {
    photo: {},
    card: {},
    ads: {},
  };

  // Photo prompts
  for (const concept of photoConcepts) {
    try {
      const prompt = getPhotoPrompt({
        conceptId: concept,
        category: 'beauty',
        productName: sampleProduct,
        bullets: sampleBullets,
        lang: 'ru',
        wishes: '',
      });
      if (prompt) prompts.photo[concept] = prompt;
    } catch { /* concept not available for this category */ }
  }

  // Card prompts
  for (const style of cardStyles) {
    try {
      const prompt = getCardPrompt({
        productName: sampleProduct,
        bullets: sampleBullets,
        lang: 'ru',
        cardStyle: style,
        cardText: 'Тестовый текст',
        creativity: 0.5,
        wishes: '',
      });
      if (prompt) prompts.card[style] = prompt;
    } catch { /* skip */ }
  }

  // Ad prompts
  for (const adId of adConcepts) {
    try {
      const promptFn = AD_PROMPTS[adId];
      if (typeof promptFn === 'function') {
        prompts.ads[adId] = promptFn(sampleProduct, 'Заголовок', 'Купить', 'ru');
      }
    } catch { /* skip */ }
  }

  // Load overrides
  const overrides = loadOverrides();

  return NextResponse.json({ prompts, overrides });
}

// PUT — save prompt overrides
export async function PUT(request) {
  const user = await getCurrentUser(request);
  if (!user || !isStaff(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof value !== 'string') {
      return NextResponse.json({ error: 'key and value required' }, { status: 400 });
    }

    const overrides = loadOverrides();
    
    if (value.trim() === '') {
      // Remove override — revert to default
      delete overrides[key];
    } else {
      overrides[key] = value;
    }

    saveOverrides(overrides);

    return NextResponse.json({ success: true, overrides });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
