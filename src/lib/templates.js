/**
 * Categories & context-dependent photo concepts (Aidentika-style)
 */

// ========================================
// PRODUCT CATEGORIES
// ========================================

export const CATEGORIES = [
  { id: 'clothing',    name: 'Одежда и обувь',       nameEn: 'Clothing & Shoes',   icon: '👗' },
  { id: 'accessories', name: 'Аксессуары',            nameEn: 'Accessories',         icon: '💍' },
  { id: 'food',        name: 'Еда и напитки',         nameEn: 'Food & Drinks',       icon: '🍕' },
  { id: 'beauty',      name: 'Косметика и уход',      nameEn: 'Beauty & Care',       icon: '💄' },
  { id: 'gadgets',     name: 'Гаджеты и техника',     nameEn: 'Gadgets & Tech',      icon: '📱' },
  { id: 'home',        name: 'Дом и сад',             nameEn: 'Home & Garden',       icon: '🏠' },
  { id: 'kids',        name: 'Детские товары',         nameEn: 'Kids',                icon: '🧸' },
  { id: 'other',       name: 'Прочее',                nameEn: 'Other',               icon: '📦' },
];

// ========================================
// PHOTO CONCEPTS PER CATEGORY
// ========================================

export const PHOTO_CONCEPTS = {
  clothing: [
    { id: 'on-model',   name: 'На модели',           nameEn: 'On Model',        icon: '👤', desc: 'Носимый контекст, акцент на посадке',   descEn: 'Worn context, fit focus' },
    { id: 'in-store',   name: 'Как в магазине',      nameEn: 'In Store',        icon: '🏪', desc: 'На вешалке или подставке',              descEn: 'On hanger or mannequin' },
    { id: 'flat-lay',   name: 'Раскладка сверху',    nameEn: 'Flat Lay',        icon: '📐', desc: 'Вид строго сверху',                    descEn: 'Top-down view' },
    { id: 'studio',     name: 'Каталог (студийно)',   nameEn: 'Studio Catalog',  icon: '📸', desc: 'Чистый объект на нейтральном фоне',    descEn: 'Clean neutral background' },
  ],
  accessories: [
    { id: 'on-model',   name: 'На модели',           nameEn: 'On Model',        icon: '👤', desc: 'На руке, шее, в ушах',                 descEn: 'On hand, neck, ears' },
    { id: 'flat-lay',   name: 'Раскладка сверху',    nameEn: 'Flat Lay',        icon: '📐', desc: 'Flat lay с аксессуарами',              descEn: 'Flat lay arrangement' },
    { id: 'in-context', name: 'В окружении',         nameEn: 'In Context',      icon: '🏠', desc: 'На столе, у зеркала',                  descEn: 'On table, by mirror' },
    { id: 'studio',     name: 'Каталог (студийно)',   nameEn: 'Studio Catalog',  icon: '📸', desc: 'Чистый объект на нейтральном фоне',    descEn: 'Clean neutral background' },
  ],
  food: [
    { id: 'plated',     name: 'Сервировка',          nameEn: 'Plated',          icon: '🍽️', desc: 'На тарелке, в бокале, готово к подаче', descEn: 'Ready to serve' },
    { id: 'in-context', name: 'В окружении',         nameEn: 'In Context',      icon: '🏠', desc: 'На кухне, с ингредиентами',            descEn: 'Kitchen, with ingredients' },
    { id: 'flat-lay',   name: 'Раскладка сверху',    nameEn: 'Flat Lay',        icon: '📐', desc: 'Вид сверху с ингредиентами',           descEn: 'Top-down with ingredients' },
    { id: 'studio',     name: 'Каталог (студийно)',   nameEn: 'Studio Catalog',  icon: '📸', desc: 'Упаковка на чистом фоне',             descEn: 'Packaging on clean bg' },
  ],
  beauty: [
    { id: 'in-use',     name: 'В использовании',     nameEn: 'In Use',          icon: '👤', desc: 'Нанесение на кожу, в руках',           descEn: 'Applied on skin, in hands' },
    { id: 'in-context', name: 'В окружении',         nameEn: 'In Context',      icon: '🏠', desc: 'Ванная, полка, зеркало',               descEn: 'Bathroom, shelf, mirror' },
    { id: 'texture',    name: 'Текстура крупно',     nameEn: 'Texture Close-up',icon: '🧪', desc: 'Текстура крема, масла, средства',      descEn: 'Cream, oil texture macro' },
    { id: 'studio',     name: 'Каталог (студийно)',   nameEn: 'Studio Catalog',  icon: '📸', desc: 'Чистый объект на нейтральном фоне',    descEn: 'Clean neutral background' },
  ],
  gadgets: [
    { id: 'in-use',     name: 'В использовании',     nameEn: 'In Use',          icon: '👐', desc: 'Руки, рабочий процесс',                descEn: 'Hands, work process' },
    { id: 'in-context', name: 'В окружении',         nameEn: 'In Context',      icon: '🏠', desc: 'Стол, рабочее место',                  descEn: 'Desk, workspace' },
    { id: 'close-up',   name: 'Крупный план',        nameEn: 'Close-up',        icon: '🔍', desc: 'Кнопки, экраны, детали',               descEn: 'Buttons, screens, details' },
    { id: 'studio',     name: 'Каталог (студийно)',   nameEn: 'Studio Catalog',  icon: '📸', desc: 'Чистый объект на нейтральном фоне',    descEn: 'Clean neutral background' },
  ],
  home: [
    { id: 'in-interior',name: 'В интерьере',         nameEn: 'In Interior',     icon: '🏠', desc: 'В комнате, на своём месте',            descEn: 'In room, in place' },
    { id: 'in-use',     name: 'В использовании',     nameEn: 'In Use',          icon: '👤', desc: 'Человек использует предмет',           descEn: 'Person using the item' },
    { id: 'close-up',   name: 'Крупный план',        nameEn: 'Close-up',        icon: '🔍', desc: 'Текстура, материал, детали',           descEn: 'Texture, material, details' },
    { id: 'studio',     name: 'Каталог (студийно)',   nameEn: 'Studio Catalog',  icon: '📸', desc: 'Чистый объект на нейтральном фоне',    descEn: 'Clean neutral background' },
  ],
  kids: [
    { id: 'in-use',     name: 'Ребёнок с товаром',   nameEn: 'Child Using',     icon: '👶', desc: 'Ребёнок играет, использует',           descEn: 'Child playing, using' },
    { id: 'in-context', name: 'В детской',           nameEn: 'In Nursery',      icon: '🏠', desc: 'В детской комнате',                    descEn: 'In kids room' },
    { id: 'flat-lay',   name: 'Раскладка сверху',    nameEn: 'Flat Lay',        icon: '📐', desc: 'Вид сверху среди игрушек',             descEn: 'Top-down among toys' },
    { id: 'studio',     name: 'Каталог (студийно)',   nameEn: 'Studio Catalog',  icon: '📸', desc: 'Чистый объект на нейтральном фоне',    descEn: 'Clean neutral background' },
  ],
  other: [
    { id: 'in-use',     name: 'В использовании',     nameEn: 'In Use',          icon: '👤', desc: 'Товар в процессе использования',       descEn: 'Product being used' },
    { id: 'in-context', name: 'В окружении',         nameEn: 'In Context',      icon: '🏠', desc: 'В подходящей обстановке',              descEn: 'In fitting environment' },
    { id: 'flat-lay',   name: 'Раскладка сверху',    nameEn: 'Flat Lay',        icon: '📐', desc: 'Вид строго сверху',                    descEn: 'Top-down view' },
    { id: 'studio',     name: 'Каталог (студийно)',   nameEn: 'Studio Catalog',  icon: '📸', desc: 'Чистый объект на нейтральном фоне',    descEn: 'Clean neutral background' },
  ],
};

// ========================================
// CARD STYLES
// ========================================

export const CARD_STYLES = [
  { id: 'classic', name: 'Классический', nameEn: 'Classic' },
  { id: 'premium', name: 'Премиум',     nameEn: 'Premium' },
];

// ========================================
// ASPECT RATIOS
// ========================================

export const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16', desc: 'Stories' },
  { id: '3:4',  label: '3:4',  desc: 'WB / Ozon' },
  { id: '1:1',  label: '1:1',  desc: 'Amazon / eBay' },
  { id: '4:3',  label: '4:3',  desc: 'Горизонтальный' },
  { id: '16:9', label: '16:9', desc: 'Баннер' },
];

// ========================================
// PLATFORM SIZES (for sharp resize)
// ========================================

export const PLATFORM_SIZES = {
  wb:         { w: 900,  h: 1200, aspect: '3:4' },
  ozon:       { w: 900,  h: 1200, aspect: '3:4' },
  amazon:     { w: 2000, h: 2000, aspect: '1:1' },
  ebay:       { w: 1600, h: 1600, aspect: '1:1' },
  'fb-feed':  { w: 1080, h: 1080, aspect: '1:1' },
  'fb-story': { w: 1080, h: 1920, aspect: '9:16' },
  'google':   { w: 1200, h: 628,  aspect: '16:9' },
  'vk':       { w: 1080, h: 607,  aspect: '16:9' },
};
