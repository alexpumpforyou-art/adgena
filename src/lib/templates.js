/**
 * Template definitions — matching real competitor concepts
 * 3 photo types + infographic card
 */

export const MARKETPLACE_SIZES = {
  wb:       { width: 900,  height: 1200, name: 'Wildberries',   aspect: '3:4',  region: 'ru' },
  ozon:     { width: 900,  height: 1200, name: 'Ozon',          aspect: '3:4',  region: 'ru' },
  ymarket:  { width: 800,  height: 800,  name: 'Яндекс Маркет', aspect: '1:1',  region: 'ru' },
  avito:    { width: 800,  height: 800,  name: 'Авито',         aspect: '1:1',  region: 'ru' },
  amazon:   { width: 2000, height: 2000, name: 'Amazon',        aspect: '1:1',  region: 'en' },
  ebay:     { width: 1600, height: 1600, name: 'eBay',          aspect: '1:1',  region: 'en' },
  etsy:     { width: 2000, height: 2000, name: 'Etsy',          aspect: '1:1',  region: 'en' },
  shopify:  { width: 2048, height: 2048, name: 'Shopify',       aspect: '1:1',  region: 'en' },
};

export const AD_SIZES = {
  'fb-feed':    { width: 1080, height: 1080, name: 'Facebook/Instagram Feed', aspect: '1:1' },
  'fb-story':   { width: 1080, height: 1920, name: 'Stories/Reels',           aspect: '9:16' },
  'google-gdn': { width: 1200, height: 628,  name: 'Google Display',          aspect: '1.91:1' },
  'vk-post':    { width: 1080, height: 607,  name: 'ВКонтакте',               aspect: '16:9' },
};

// ========================================
// PHOTO CONCEPTS (like Aidentika)
// ========================================

export const PHOTO_TEMPLATES = [
  {
    id: 'in-use',
    name: { ru: 'В использовании', en: 'In Use' },
    icon: '👤',
    description: {
      ru: 'Товар в руках у человека, в процессе использования',
      en: 'Product being used by a person in a natural setting',
    },
  },
  {
    id: 'in-context',
    name: { ru: 'В окружении', en: 'In Context' },
    icon: '🏠',
    description: {
      ru: 'Товар в красивом окружении — на столе, в интерьере, flat lay',
      en: 'Product in a styled environment — table, interior, flat lay',
    },
  },
  {
    id: 'studio',
    name: { ru: 'Каталог (студийно)', en: 'Studio Catalog' },
    icon: '📸',
    description: {
      ru: 'Чистое студийное фото на нейтральном фоне',
      en: 'Clean studio photo on neutral background',
    },
  },
];

// ========================================
// CARD TEMPLATES (infographic overlays)
// ========================================

export const CARD_TEMPLATES = [
  {
    id: 'infographic',
    name: { ru: 'Инфографика', en: 'Infographic' },
    icon: '📊',
    description: {
      ru: 'Карточка с иконками, выносками и характеристиками',
      en: 'Card with icons, callouts, and feature highlights',
    },
  },
  {
    id: 'minimal-card',
    name: { ru: 'Минималистичная', en: 'Minimal Card' },
    icon: '✨',
    description: {
      ru: 'Чистая карточка с названием и буллетами',
      en: 'Clean card with title and bullet points',
    },
  },
  {
    id: 'gradient-card',
    name: { ru: 'Градиентная', en: 'Gradient Card' },
    icon: '🎨',
    description: {
      ru: 'Яркая карточка с градиентным фоном',
      en: 'Vibrant card with gradient background',
    },
  },
];

// ========================================
// AD TEMPLATES
// ========================================

export const AD_TEMPLATES = [
  {
    id: 'ad-sale',
    name: { ru: 'Распродажа', en: 'Sale' },
    icon: '🔥',
    description: {
      ru: 'Яркий баннер для скидок и акций',
      en: 'Bold banner for sales and discounts',
    },
  },
  {
    id: 'ad-minimal',
    name: { ru: 'Минимал', en: 'Minimal Ad' },
    icon: '🤍',
    description: {
      ru: 'Фокус на товаре, Apple-стиль',
      en: 'Product focus, Apple style',
    },
  },
  {
    id: 'ad-story',
    name: { ru: 'Stories', en: 'Story Ad' },
    icon: '📱',
    description: {
      ru: 'Вертикальный для сторис и рилс',
      en: 'Vertical for stories and reels',
    },
  },
];

export const ALL_TEMPLATES = [...PHOTO_TEMPLATES, ...CARD_TEMPLATES, ...AD_TEMPLATES];
