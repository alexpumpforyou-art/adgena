import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isStaff } from '@/lib/db';
import { getPhotoPrompt, getCardPrompt } from '@/lib/prompts';

// GET — return all prompt templates for admin review
export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user || !isStaff(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sampleProduct = 'Пример товара';
  const sampleBullets = ['качество', 'натуральный состав', 'быстрый эффект'];
  const categories = ['clothing', 'accessories', 'food', 'beauty', 'gadgets', 'home', 'kids', 'other'];

  const photoConcepts = ['on-model', 'in-store', 'flat-lay', 'studio', 'in-use', 'in-context', 'texture', 'plated'];
  const adConcepts = ['story-ad', 'promo-banner', 'comparison'];
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
        style,
        productName: sampleProduct,
        bullets: sampleBullets,
        lang: 'ru',
      });
      if (prompt) prompts.card[style] = prompt;
    } catch { /* skip */ }
  }

  return NextResponse.json({ prompts });
}
