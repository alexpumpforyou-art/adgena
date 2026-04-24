/**
 * Template definitions for product cards and ad creatives
 * Supports both RU (WB, Ozon) and International (Amazon, eBay, Etsy) marketplaces
 */

// ========================================
// MARKETPLACE SIZES
// ========================================

export const MARKETPLACE_SIZES = {
  // РФ / СНГ
  wb:       { width: 900,  height: 1200, name: 'Wildberries',   aspect: '3:4',  region: 'ru' },
  ozon:     { width: 900,  height: 1200, name: 'Ozon',          aspect: '3:4',  region: 'ru' },
  ymarket:  { width: 800,  height: 800,  name: 'Яндекс Маркет', aspect: '1:1',  region: 'ru' },
  avito:    { width: 800,  height: 800,  name: 'Авито',         aspect: '1:1',  region: 'ru' },

  // International
  amazon:   { width: 2000, height: 2000, name: 'Amazon',        aspect: '1:1',  region: 'en' },
  ebay:     { width: 1600, height: 1600, name: 'eBay',          aspect: '1:1',  region: 'en' },
  etsy:     { width: 2000, height: 2000, name: 'Etsy',          aspect: '1:1',  region: 'en' },
  shopify:  { width: 2048, height: 2048, name: 'Shopify',       aspect: '1:1',  region: 'en' },
  walmart:  { width: 2000, height: 2000, name: 'Walmart',       aspect: '1:1',  region: 'en' },
};

// ========================================
// AD SIZES
// ========================================

export const AD_SIZES = {
  'fb-feed':    { width: 1080, height: 1080, name: 'Facebook/Instagram Feed', aspect: '1:1',  region: 'all' },
  'fb-story':   { width: 1080, height: 1920, name: 'Facebook/Instagram Story', aspect: '9:16', region: 'all' },
  'google-gdn': { width: 1200, height: 628,  name: 'Google Display',          aspect: '1.91:1', region: 'en' },
  'tiktok':     { width: 1080, height: 1920, name: 'TikTok',                  aspect: '9:16', region: 'all' },
  'vk-post':    { width: 1080, height: 607,  name: 'ВКонтакте',               aspect: '16:9', region: 'ru' },
  'tg-post':    { width: 800,  height: 600,  name: 'Telegram',                aspect: '4:3',  region: 'ru' },
  'pinterest':  { width: 1000, height: 1500, name: 'Pinterest',               aspect: '2:3',  region: 'en' },
};

// ========================================
// CARD TEMPLATES
// ========================================

export const CARD_TEMPLATES = [
  // ---- UNIVERSAL ----
  {
    id: 'white-studio',
    name: { ru: 'Студийное фото', en: 'Studio White' },
    cat: 'marketplace',
    pro: false,
    region: 'all',
    bestFor: ['amazon', 'ebay', 'walmart', 'ozon'],
    icon: '⬜',
    description: {
      ru: 'Чистый белый фон, обязателен для Amazon/eBay',
      en: 'Clean white background, required for Amazon/eBay main image',
    },
  },
  {
    id: 'minimal-clean',
    name: { ru: 'Минимализм', en: 'Minimalist' },
    cat: 'marketplace',
    pro: false,
    region: 'all',
    bestFor: ['wb', 'ozon', 'shopify'],
    icon: '✨',
    description: {
      ru: 'Минимализм с буллетами и чекмарками',
      en: 'Clean minimal with bullet points and checkmarks',
    },
  },
  {
    id: 'gradient-modern',
    name: { ru: 'Градиент', en: 'Gradient Modern' },
    cat: 'marketplace',
    pro: false,
    region: 'all',
    bestFor: ['wb', 'ozon'],
    icon: '🎨',
    description: {
      ru: 'Яркий градиент для привлечения внимания',
      en: 'Vibrant gradient background for maximum attention',
    },
  },
  {
    id: 'dark-premium',
    name: { ru: 'Премиум', en: 'Dark Premium' },
    cat: 'marketplace',
    pro: true,
    region: 'all',
    bestFor: ['wb', 'shopify', 'etsy'],
    icon: '👑',
    description: {
      ru: 'Тёмный премиальный стиль с золотыми акцентами',
      en: 'Dark luxury style with golden accents',
    },
  },
  {
    id: 'neon-vibrant',
    name: { ru: 'Неон', en: 'Neon Vibrant' },
    cat: 'marketplace',
    pro: true,
    region: 'all',
    bestFor: ['wb', 'shopify'],
    icon: '⚡',
    description: {
      ru: 'Кибер/неон стиль для техники и гейминга',
      en: 'Cyberpunk neon style for tech and gaming',
    },
  },
  {
    id: 'nature-organic',
    name: { ru: 'Эко/Органик', en: 'Nature Organic' },
    cat: 'marketplace',
    pro: false,
    region: 'all',
    bestFor: ['wb', 'etsy', 'shopify'],
    icon: '🌿',
    description: {
      ru: 'Натуральный эко-стиль для органических товаров',
      en: 'Natural eco style for organic products',
    },
  },
  {
    id: 'lifestyle-context',
    name: { ru: 'Lifestyle', en: 'Lifestyle Context' },
    cat: 'marketplace',
    pro: true,
    region: 'all',
    bestFor: ['etsy', 'shopify', 'pinterest'],
    icon: '🏠',
    description: {
      ru: 'Товар в контексте — интерьер, быт, использование',
      en: 'Product in real-life context — interior, lifestyle',
    },
  },
  {
    id: 'infographic-pro',
    name: { ru: 'Инфографика', en: 'Infographic Pro' },
    cat: 'marketplace',
    pro: true,
    region: 'all',
    bestFor: ['wb', 'ozon', 'amazon'],
    icon: '📊',
    description: {
      ru: 'Полная инфографика с иконками и характеристиками',
      en: 'Full infographic with icons and specifications',
    },
  },
  {
    id: 'amazon-a-plus',
    name: { ru: 'Amazon A+', en: 'Amazon A+ Content' },
    cat: 'marketplace',
    pro: true,
    region: 'en',
    bestFor: ['amazon'],
    icon: '🅰️',
    description: {
      ru: 'Контент для расширенного описания Amazon A+',
      en: 'Enhanced Brand Content for Amazon A+ listings',
    },
  },
  {
    id: 'comparison-split',
    name: { ru: 'Сравнение', en: 'Comparison Split' },
    cat: 'marketplace',
    pro: true,
    region: 'all',
    bestFor: ['wb', 'amazon', 'shopify'],
    icon: '⚖️',
    description: {
      ru: 'Карточка сравнения / до и после',
      en: 'Before/after or comparison card',
    },
  },
];

// ========================================
// AD TEMPLATES
// ========================================

export const AD_TEMPLATES = [
  {
    id: 'ad-bold-sale',
    name: { ru: 'Распродажа', en: 'Bold Sale' },
    cat: 'ads',
    pro: false,
    region: 'all',
    icon: '🔥',
    description: {
      ru: 'Яркий баннер для распродажи/скидок',
      en: 'Bold banner for sales and discounts',
    },
  },
  {
    id: 'ad-minimal-product',
    name: { ru: 'Продуктовый минимал', en: 'Minimal Product' },
    cat: 'ads',
    pro: false,
    region: 'all',
    icon: '🤍',
    description: {
      ru: 'Apple-стиль минимализм',
      en: 'Apple-style minimalist product focus',
    },
  },
  {
    id: 'ad-dark-luxury',
    name: { ru: 'Люкс', en: 'Dark Luxury' },
    cat: 'ads',
    pro: true,
    region: 'all',
    icon: '🖤',
    description: {
      ru: 'Тёмный люксовый стиль',
      en: 'Dark luxury premium aesthetic',
    },
  },
  {
    id: 'ad-social-story',
    name: { ru: 'Stories/Reels', en: 'Social Story' },
    cat: 'ads',
    pro: false,
    region: 'all',
    icon: '📱',
    description: {
      ru: 'Вертикальный для сторис',
      en: 'Vertical story/reel format',
    },
  },
  {
    id: 'ad-google-banner',
    name: { ru: 'Google Баннер', en: 'Google Display' },
    cat: 'ads',
    pro: true,
    region: 'en',
    icon: '🖼️',
    description: {
      ru: 'Баннер для Google Display Network',
      en: 'Banner for Google Display Network',
    },
  },
  {
    id: 'ad-retargeting',
    name: { ru: 'Ретаргетинг', en: 'Retargeting' },
    cat: 'ads',
    pro: true,
    region: 'all',
    icon: '🎯',
    description: {
      ru: 'Креатив для ретаргетинга с CTA',
      en: 'Retargeting creative with strong CTA',
    },
  },
];

// ========================================
// ALL TEMPLATES
// ========================================

export const ALL_TEMPLATES = [...CARD_TEMPLATES, ...AD_TEMPLATES];

/**
 * Get templates filtered by region and category
 */
export function getTemplatesForRegion(region = 'all', category = null) {
  let templates = ALL_TEMPLATES.filter(t => t.region === 'all' || t.region === region);
  if (category) templates = templates.filter(t => t.cat === category);
  return templates;
}

/**
 * Get sizes for a marketplace
 */
export function getSizesForRegion(region = 'all') {
  const sizes = {};
  for (const [key, val] of Object.entries({ ...MARKETPLACE_SIZES, ...AD_SIZES })) {
    if (val.region === 'all' || val.region === region) {
      sizes[key] = val;
    }
  }
  return sizes;
}
