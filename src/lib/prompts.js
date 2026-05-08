import fs from 'fs';
import path from 'path';

const OVERRIDES_PATH = path.join(process.cwd(), 'data', 'prompt-overrides.json');
const PRODUCT_FIDELITY_RU = `Сохрани точную идентичность товара с референса: форму, пропорции, цвет, материал, упаковку, расположение этикетки/логотипа и узнаваемые детали. Не редизайни товар, не меняй цвет и не добавляй несуществующие элементы.`;
const PRODUCT_FIDELITY_EN = `Preserve the exact product identity from the reference image: shape, proportions, color, material, packaging, label placement, logo position and distinctive details. Do not redesign the product, change its color, or add non-existing elements.`;
const MARKETPLACE_SAFE_RU = `ВАЖНО ДЛЯ МАРКЕТПЛЕЙСА: товар должен быть главным объектом и занимать 55-70% кадра. Используй максимум 3-5 коротких преимуществ, не больше 2-4 слов каждое. Не добавляй мелкий нечитаемый текст, случайные цифры, артикулы, SKU, штрихкоды, выдуманные сертификаты или характеристики. Артикул/код товара можно писать только если пользователь явно указал его в тексте. Оставь безопасные поля минимум 10% от боковых и нижнего края и минимум 14% от верхнего края, чтобы текст не обрезался. Дизайн должен выглядеть как готовая карточка для Wildberries/Ozon: чисто, контрастно, продающе.`;
const MARKETPLACE_SAFE_EN = `MARKETPLACE REQUIREMENTS: the product must be the main object and occupy 55-70% of the frame. Use up to 3-5 short benefits, 2-4 words each. Do not add tiny unreadable text, random numbers, article numbers, SKUs, barcodes, fake certifications, or invented specs. Product article/SKU may be written only if the user explicitly provided it in text. Keep safe margins of at least 10% from side/bottom edges and at least 14% from the top edge so text is not cropped. The design must look like a finished marketplace card: clean, high-contrast, conversion-focused.`;
const SAFE_ZONE_RU = `Держи весь текст, цену и CTA внутри безопасных полей: минимум 14% сверху и минимум 10% слева, справа и снизу. Не размещай заголовок у самого верхнего края. Не обрезай текст, товар, ценник или кнопку.`;
const SAFE_ZONE_EN = `Keep all text, price and CTA inside safe margins: at least 14% from the top and at least 10% from left, right and bottom edges. Do not place the headline against the top edge. Do not crop text, product, price badge or CTA.`;
const NEGATIVES = `Avoid: distorted shapes, wrong product color, changed packaging, incorrect logo, extra labels, fake article numbers, fake SKUs, fake barcodes, fake certifications, warped text, unreadable small text, misspelled text, blurry edges, low resolution, cartoon style, watermarks, AI artifacts, gibberish text, cropped product, cropped text, cluttered composition, duplicated products unless requested, extra fingers, deformed products.`;
const PHOTO_TECH = `photorealistic, ultra-sharp focus, 8k resolution, high-end commercial photography, professional color grading, shot on Canon EOS R5 with 85mm lens`;

export function getPromptOverride(key) {
  try {
    if (!fs.existsSync(OVERRIDES_PATH)) return null;
    const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8'));
    const value = overrides?.[key];
    return typeof value === 'string' && value.trim() ? value : null;
  } catch {
    return null;
  }
}

// Category-specific scene hints
const CATEGORY_CONTEXT = {
  clothing:    { scene: 'fashion studio or urban setting', surface: 'clean floor or simple backdrop', person: 'model wearing the clothing naturally' },
  accessories: { scene: 'elegant vanity or styled surface', surface: 'marble, velvet, or polished wood', person: 'person wearing the accessory elegantly' },
  food:        { scene: 'kitchen or dining table', surface: 'wooden table, marble counter, or ceramic plate', person: 'person enjoying or preparing the food' },
  beauty:      { scene: 'bathroom, vanity, or spa setting', surface: 'marble shelf, glass tray, or soft towel', person: 'person applying the product on skin' },
  gadgets:     { scene: 'modern desk or workspace', surface: 'clean desk, dark surface, or tech setup', person: 'person holding or operating the device' },
  home:        { scene: 'living room, bedroom, or garden', surface: 'shelf, table, or floor in a styled room', person: 'person using the item in their home' },
  kids:        { scene: 'bright kids room or playground', surface: 'colorful play mat or nursery shelf', person: 'happy child playing with the product' },
  other:       { scene: 'appropriate everyday setting', surface: 'clean surface matching the product', person: 'person naturally using the product' },
};

function fmt(name, bullets) {
  let s = `Product: "${name}"`;
  if (bullets?.length) s += `\nKey features:\n${bullets.map(b => `• ${b}`).join('\n')}`;
  return s;
}

function ctx(category) {
  return CATEGORY_CONTEXT[category] || CATEGORY_CONTEXT.other;
}

// ========================================
// PHOTO PROMPTS (concept + category aware)
// ========================================

export function getPhotoPrompt({ conceptId, category, productName, bullets, lang, wishes }) {
  const p = fmt(productName, bullets);
  const c = ctx(category);
  const wishBlock = wishes ? `\n\nAdditional requirements from user: ${wishes}` : '';
  const isRu = lang !== 'en';
  const fidelity = isRu ? PRODUCT_FIDELITY_RU : PRODUCT_FIDELITY_EN;

  const prompts = {

    // --- НА МОДЕЛИ / ON MODEL ---
    'on-model': isRu
      ? `Профессиональная fashion-фотография. ${p}

${fidelity}

Покажи модель (мужчину или женщину — выбери подходящий пол) в этом товаре. Модель стоит или идёт в ${c.scene}. Акцент на посадке и фактуре ткани. Естественная поза, не постановочная.

Освещение: мягкий студийный или естественный свет. Малая глубина резкости — товар и модель резкие, фон размыт. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional fashion photography. ${p}

${fidelity}

Show a model (choose appropriate gender) wearing this product. Model standing or walking in ${c.scene}. Focus on fit and fabric texture. Natural, not overly posed.

Lighting: soft studio or natural light. Shallow depth of field. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- КАК В МАГАЗИНЕ / IN STORE ---
    'in-store': isRu
      ? `Профессиональная фотография товара как в магазине. ${p}

${fidelity}

Товар аккуратно висит на вешалке или расположен на подставке/манекене в стильном бутике. Фон — магазинный интерьер, слегка размытый. Аккуратная выкладка. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional in-store product photography. ${p}

${fidelity}

Product neatly displayed on a hanger or mannequin in a stylish boutique setting. Blurred store interior background. Neat presentation. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- РАСКЛАДКА СВЕРХУ / FLAT LAY ---
    'flat-lay': isRu
      ? `Профессиональная flat lay фотография строго сверху. ${p}

${fidelity}

Товар разложен на ${c.surface}, снято строго сверху (вид сверху, 90°). Вокруг — 2-3 подходящих дополняющих предмета. Аккуратная симметричная композиция. Равномерное мягкое освещение без резких теней. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional flat lay photography, strictly top-down. ${p}

${fidelity}

Product laid out on ${c.surface}, shot from directly above (90° overhead). Surrounded by 2-3 complementary props. Neat, symmetrical composition. Even, soft lighting. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- КАТАЛОГ СТУДИЙНО / STUDIO ---
    'studio': isRu
      ? `Профессиональная студийная каталожная фотография. ${p}

${fidelity}

Товар на чисто белом или светло-сером бесшовном фоне. Трёхточечный студийный свет: ключевой сверху-слева, заполняющий справа, контровой для отделения от фона. Контактная тень. Товар по центру, занимает 80-85% кадра. Резкий фокус. Без текста, без реквизита. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional studio catalog photography. ${p}

${fidelity}

Product on pure white or light gray seamless background. Three-point studio lighting. Contact shadow. Centered, filling 80-85% of frame. Tack-sharp focus. No text, no props. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- В ИСПОЛЬЗОВАНИИ / IN USE ---
    'in-use': isRu
      ? `Профессиональная lifestyle-фотография. ${p}

${fidelity}

${c.person} в ${c.scene}. Человек выглядит естественно, не постановочно. Товар — главный фокус. Тёплый естественный свет. Малая глубина резкости (f/2.8). Средний план. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional lifestyle photography. ${p}

${fidelity}

${c.person} in ${c.scene}. Person looks natural, not overly posed. Product is the clear focal point. Warm natural light. Shallow depth of field (f/2.8). Medium shot. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- В ОКРУЖЕНИИ / IN CONTEXT ---
    'in-context': isRu
      ? `Профессиональная стилизованная фотография товара. ${p}

${fidelity}

Товар размещён на ${c.surface} в ${c.scene}. Рядом 2-3 дополняющих предмета. Мягкий естественный свет. Тёплая уютная атмосфера, достойная журнала. Товар — главный фокус. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional styled product photography. ${p}

${fidelity}

Product placed on ${c.surface} in ${c.scene}. 2-3 complementary props nearby. Soft natural light. Warm, magazine-worthy atmosphere. Product is the focal point. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- КРУПНЫЙ ПЛАН / CLOSE-UP ---
    'close-up': isRu
      ? `Макро-фотография товара, крупный план. ${p}

${fidelity}

Снять одну ключевую деталь крупным планом: текстура, кнопки, экран, поверхность, швы, материал. Малая глубина резкости, размытый фон. Драматичное боковое освещение подчёркивает текстуру. ${PHOTO_TECH}, макро-объектив 100мм.${wishBlock}

${NEGATIVES}`
      : `Macro product photography, close-up. ${p}

${fidelity}

Capture one key detail: texture, buttons, screen, surface, stitching, material. Shallow DOF, blurred background. Dramatic side lighting to highlight texture. ${PHOTO_TECH}, 100mm macro lens.${wishBlock}

${NEGATIVES}`,

    // --- В ИНТЕРЬЕРЕ / IN INTERIOR ---
    'in-interior': isRu
      ? `Интерьерная фотография товара. ${p}

${fidelity}

Товар естественно размещён в ${c.scene} — на своём месте, как будто это реальный интерьер. Мягкий свет из окна. Стильный современный интерьер. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Interior product photography. ${p}

${fidelity}

Product naturally placed in ${c.scene} — in its proper place, like a real interior. Soft window light. Modern stylish interior. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- СЕРВИРОВКА (еда) / PLATED ---
    'plated': isRu
      ? `Профессиональная food-фотография. ${p}

${fidelity}

Товар красиво сервирован: на тарелке, в бокале, или готов к подаче на ${c.surface}. Свежие ингредиенты рядом. Тёплое аппетитное освещение. ${PHOTO_TECH}, food photography style.${wishBlock}

${NEGATIVES}`
      : `Professional food photography. ${p}

${fidelity}

Product beautifully plated or served on ${c.surface}. Fresh ingredients nearby. Warm appetizing lighting. ${PHOTO_TECH}, food photography style.${wishBlock}

${NEGATIVES}`,

    // --- ТЕКСТУРА (косметика) / TEXTURE ---
    'texture': isRu
      ? `Макро-фотография текстуры косметического средства. ${p}

${fidelity}

Крупный план текстуры: крем, масло, гель, или сыворотка. Мазок или капля на чистой поверхности. Видна консистенция и цвет. Мягкий рассеянный свет. ${PHOTO_TECH}, макро.${wishBlock}

${NEGATIVES}`
      : `Macro texture photography of beauty product. ${p}

${fidelity}

Close-up of texture: cream, oil, gel, or serum. Swatch or drop on clean surface. Showing consistency and color. Soft diffused light. ${PHOTO_TECH}, macro.${wishBlock}

${NEGATIVES}`,
  };

  return prompts[conceptId] || prompts['studio'];
}

// ========================================
// CARD PROMPTS (infographic with style)
// ========================================

function getCardStyleHint(cardStyle, category, isRu) {
  const categoryHintsRu = {
    clothing: 'Категория одежда/обувь: сохрани фасон, длину, посадку, принт, цвет, ремешки, швы и пропорции. Используй нейтральные подписи к видимым деталям: крой, воротник, рукав, принт, фактура, посадка. Не указывай размерный ряд, материал, сезон, состав ткани или свойства ткани, если пользователь явно не написал это в тексте.',
    accessories: 'Категория аксессуары: сохрани форму, фурнитуру, камни, застёжки, логотипы и масштаб. Используй нейтральные подписи к видимым деталям. Не указывай материал, размер, комплектность или покрытие, если пользователь явно не написал это в тексте.',
    food: 'Категория еда/напитки: сохрани упаковку, этикетку, форму продукта и бренд. Используй только видимые детали и текст пользователя. Не указывай состав, вкус, вес, объём, калорийность или натуральность, если пользователь явно не написал это в тексте.',
    beauty: 'Категория косметика/уход: сохрани упаковку, этикетку, дозатор, цвет и форму флакона. Используй только видимые детали и текст пользователя. Не указывай эффект, тип кожи/волос, активный компонент, объём или способ применения, если пользователь явно не написал это в тексте.',
    gadgets: 'Категория гаджеты/техника: сохрани форму устройства, экран, кнопки, порты и материалы. Используй только видимые детали и текст пользователя. Не указывай мощность, ёмкость, совместимость, гарантию или технические характеристики, если пользователь явно не написал это в тексте.',
    home: 'Категория дом/сад: сохрани цвет, форму, фактуру и масштаб товара. Используй только видимые детали и текст пользователя. Не указывай материал, размер, назначение, стиль интерьера или уход, если пользователь явно не написал это в тексте.',
    kids: 'Категория детские товары: мягкий дружелюбный дизайн, пастельные цвета, округлые формы. Используй только видимые детали и текст пользователя. Не указывай возраст, материал, безопасность, размер или сертификацию, если пользователь явно не написал это в тексте.',
    other: 'Универсальная категория: товар главный, подписи только к видимым деталям и данным пользователя, без выдуманных параметров.',
  };
  const categoryHintsEn = {
    clothing: 'Clothing/footwear category: preserve cut, length, fit, print, color, straps, seams and proportions. Use neutral labels for visible details: cut, collar, sleeve, print, texture, fit. Do not mention size range, material, season, fabric composition or fabric properties unless the user explicitly wrote them.',
    accessories: 'Accessories category: preserve shape, hardware, stones, clasp, logos and scale. Use neutral labels for visible details. Do not mention material, size, set contents or coating unless the user explicitly wrote them.',
    food: 'Food/drinks category: preserve packaging, label, product shape and brand. Use only visible details and user text. Do not mention ingredients, taste, weight, volume, calories or naturalness unless the user explicitly wrote them.',
    beauty: 'Beauty category: preserve packaging, label, pump, bottle shape and color. Use only visible details and user text. Do not mention effect, skin/hair type, active ingredient, volume or usage unless the user explicitly wrote them.',
    gadgets: 'Gadgets/electronics category: preserve device shape, screen, buttons, ports and materials. Use only visible details and user text. Do not mention power, capacity, compatibility, warranty or specs unless the user explicitly wrote them.',
    home: 'Home/garden category: preserve color, shape, texture and scale. Use only visible details and user text. Do not mention material, size, purpose, interior style or care unless the user explicitly wrote them.',
    kids: 'Kids category: soft friendly design, pastel colors, rounded shapes. Use only visible details and user text. Do not mention age, material, safety, size or certification unless the user explicitly wrote them.',
    other: 'Universal category: product is the hero, labels only for visible details and user-provided data, no invented parameters.',
  };
  const styleHintsRu = {
    infographic: 'Инфографичная карточка как в fashion-примере: серый/нейтральный фон, товар крупно по центру, 3-4 круглые zoom-выноски видимых деталей, аккуратные подписи сбоку/снизу. Главный заголовок размещай заметно ниже верхнего края, внутри safe area, не ближе 14% от верха; лучше 1-2 строки без касания рамки. Не добавляй блоки размеров, материала, сезона или характеристик без явного текста пользователя.',
    typography: 'Типографичная карточка: огромная полупрозрачная фоновая типографика за товаром, товар поверх букв, сверху 2-3 короткие нейтральные фразы только на основе текста пользователя или визуально очевидного назначения, минимум мелкого текста. Фоновая типографика должна быть очень светлой, низкоконтрастной, декоративной, не мешать читаемости, не спорить с товаром и не перекрывать важные детали товара. Не делай фоновую типографику слишком темной, слишком плотной или визуально агрессивной. Типографика должна быть чистой, крупной, аккуратной и современной, в стиле сильной маркетплейс-карточки. Используй короткие русские фразы, максимум 2 строки в одном блоке. Не создавай длинные абзацы. Не перегружай карточку текстом. Избегай сложной мелкой кириллицы, длинных описаний и плотных текстовых массивов. Все текстовые блоки должны быть легко читаемыми с первого взгляда. Иерархия текста: 1 главный верхний заголовок или 2 короткие верхние строки; 1 крупное акцентное слово или фраза; 2-3 короткие подписи к видимым деталям товара; минимум мелкого текста; не более 5 текстовых блоков на всей карточке. Композиция должна быть вертикальной, чистой и сбалансированной: товар в центре внимания, фоновая типографика позади, короткие подписи расположены так, чтобы не мешать товару и не выходить за safe zone. Не ставь текст вплотную к краям. Не делай слишком плотную или хаотичную верстку.',
    lifestyle: 'Lifestyle-карточка: создай реалистичную premium lifestyle/editorial сцену, как брендовая съёмка товара в естественном окружении. Это НЕ инфографика и НЕ typography-постер. Запрещены стрелки, линии-указатели, zoom-выноски, подписи деталей, технические callout-блоки, огромные слова на весь кадр и перечисление характеристик. Товар должен быть в красивом жизненном контексте: для обуви — на улице, в спортивной раздевалке, рядом с беговой дорожкой, на стильной поверхности или в динамичной fashion/editorial композиции; для других категорий — подходящее реальное окружение. Фон должен быть полноценной сценой с глубиной, естественным светом, мягкими тенями и атмосферой дорогой рекламной фотосъёмки. Текст лучше не добавлять; если очень нужен — максимум одна короткая аккуратная фраза мелко/средне, без доминирования над товаром.',
  };
  const styleHintsEn = {
    infographic: 'Infographic card like a fashion example: gray/neutral background, large centered product, 3-4 circular zoom callouts for visible details, clean labels on side/bottom. Place the main headline clearly below the top edge, inside the safe area, at least 14% from the top; prefer 1-2 lines that never touch the frame. Do not add size, material, season or specs blocks without explicit user text.',
    typography: 'Typography card: huge translucent background typography behind the product, product over the letters, 2-3 short neutral phrases only based on user text or visually obvious purpose, minimal small text.',
    lifestyle: 'Lifestyle card: create a realistic premium lifestyle/editorial scene, like a branded product photoshoot in a natural environment. This is NOT an infographic and NOT a typography poster. No arrows, pointer lines, zoom callouts, detail labels, technical callout blocks, huge words across the image, or feature lists. Place the product in a beautiful real-life context: for shoes — outdoors, locker room, near a running track, on a stylish surface, or in a dynamic fashion/editorial composition; for other categories — use an appropriate real environment. The background must be a full scene with depth, natural light, soft shadows, and an expensive advertising photoshoot mood. Prefer no text; if text is necessary — at most one short subtle phrase, small/medium, never dominating the product.',
  };
  const categoryHint = isRu
    ? (categoryHintsRu[category] || categoryHintsRu.other)
    : (categoryHintsEn[category] || categoryHintsEn.other);
  const styleHint = isRu
    ? (styleHintsRu[cardStyle] || styleHintsRu.infographic)
    : (styleHintsEn[cardStyle] || styleHintsEn.infographic);
  return `${styleHint}\n\n${categoryHint}`;
}

export function getCardPrompt({ productName, bullets, lang, cardText, cardStyle, creativity, wishes, category = 'other' }) {
  const p = fmt(productName, bullets);
  const isRu = lang !== 'en';
  const fidelity = isRu ? PRODUCT_FIDELITY_RU : PRODUCT_FIDELITY_EN;
  const marketplaceSafe = isRu ? MARKETPLACE_SAFE_RU : MARKETPLACE_SAFE_EN;
  const safeZone = isRu ? SAFE_ZONE_RU : SAFE_ZONE_EN;
  const styleHint = getCardStyleHint(cardStyle, category, isRu);

  const creativityHint = creativity > 0.7
    ? (isRu ? 'Будь креативным и экспериментируй с дизайном.' : 'Be creative and experiment with design.')
    : creativity < 0.3
      ? (isRu ? 'Строго следуй стандартному маркетплейс-дизайну, минимум вольностей.' : 'Strictly follow standard marketplace design, minimal creative liberties.')
      : '';

  const hasUserText = Boolean(cardText?.trim() || bullets?.length);
  const userText = cardText || (bullets?.length ? bullets.join(', ') : '');
  const layoutBlock = cardStyle === 'lifestyle'
    ? (isRu
      ? 'КОМПОНОВКА: Товар должен быть главным героем lifestyle-сцены. Не делай инфографику, не добавляй стрелки, подписи деталей, выноски, списки преимуществ или крупную типографику. Сохрани фокус на реалистичной рекламной фотографии и атмосфере.'
      : 'LAYOUT: The product must be the hero of the lifestyle scene. Do not make an infographic, do not add arrows, detail labels, callouts, benefit lists, or large typography. Keep the focus on realistic advertising photography and mood.')
    : (isRu
      ? 'КОМПОНОВКА: Товар должен быть главным героем карточки. Все тексты короткие, крупные и читаемые. Используй только данные из текста пользователя и очевидные визуальные свойства товара. Если текст пользователя не указан — не добавляй конкретные размеры, размерный ряд, материал, состав, сезон, цену, скидку, свойства ткани/состава, технические характеристики, гарантии или сертификаты. Если характеристика не указана пользователем и не написана на самом товаре/упаковке — не выдумывай её. Лучше используй нейтральные подписи к видимым деталям.'
      : 'LAYOUT: The product must be the hero of the card. All text must be short, large and readable. Use only user-provided data and obvious visual properties of the product. If user text is not provided — do not add specific sizes, size ranges, material, composition, season, price, discount, fabric/composition properties, technical specs, warranties or certificates. If a specification is not provided by the user and not written on the product/packaging itself — do not invent it. Prefer neutral labels for visible details.');

  const wishBlock = wishes ? `\n\nДополнительно: ${wishes}` : '';

  return isRu
    ? `Создай профессиональную карточку товара для маркетплейса. На основе товара с референсного изображения. ${p}

Текст пользователя для карточки: "${userText || 'не указан'}"

${fidelity}

${styleHint}

${layoutBlock}

${marketplaceSafe}
${safeZone}

${creativityHint}
${PHOTO_TECH}. Текст на РУССКОМ.${hasUserText ? '' : ' Не добавляй неподтверждённые преимущества.'}${wishBlock}

${NEGATIVES}`
    : `Create a professional product card for marketplace. Based on product from reference image. ${p}

User card text: "${userText || 'not provided'}"

${fidelity}

${styleHint}

${layoutBlock}

${marketplaceSafe}
${safeZone}

${creativityHint}
${PHOTO_TECH}.${hasUserText ? '' : ' Do not add unverified benefits.'}${wishBlock}

${NEGATIVES}`;
}

// ========================================
// AD PROMPTS
// ========================================

// Helper: build optional price/button blocks for ad prompts
function adExtras({ price, showButton, cta }, lang) {
  const en = lang === 'en';
  const parts = [];
  if (price) {
    parts.push(en
      ? `- Price badge: a perfectly circular badge (~15-18% of frame height) in bright yellow (#FACC15) with a thin glowing outer ring and soft drop shadow. Inside: bold ultra-condensed dark text reading EXACTLY "${price}". Use this exact price — do not invent a different number. Optionally add tiny starburst rays emanating from the badge outline for extra visual energy.`
      : `- Бейдж цены: идеально круглый бейдж (~15-18% высоты кадра) насыщенно-жёлтый (#FACC15) с тонким светящимся внешним кольцом и мягкой тенью. Внутри: жирный ультра-узкий тёмный текст РОВНО "${price}". Использовать именно эту цену — не придумывать другие цифры. Опционально добавь маленькие лучики-звезду по контуру бейджа для энергии.`);
  }
  if (showButton && cta) {
    parts.push(en
      ? `- CTA button "${cta}" — large rounded pill shape, solid bright yellow (#FACC15) fill with a subtle gradient highlight on the top edge, bold dark text, clear drop shadow underneath, and a small right-arrow icon "→" after the text. The button should look clickable and substantial.`
      : `- CTA-кнопка "${cta}" — крупный скруглённый pill, залитый ярко-жёлтым (#FACC15) с лёгким градиентным бликом по верху, жирный тёмный текст, отчётливая тень под кнопкой, маленькая иконка-стрелка "→" после текста. Кнопка должна выглядеть кликабельной и весомой.`);
  }
  const forbid = [];
  if (!price)          forbid.push(en ? 'no price tags or discount numbers anywhere' : 'никаких ценников и процентов скидок');
  if (!showButton)     forbid.push(en ? 'no CTA buttons' : 'никаких CTA-кнопок');
  const forbidStr = forbid.length ? (en ? `STRICT: ${forbid.join(', ')}.` : `СТРОГО: ${forbid.join(', ')}.`) : '';
  return { extras: parts.join('\n'), forbid: forbidStr };
}

function adPalette(category = 'other', style = 'sale', lang = 'ru') {
  const en = lang === 'en';
  const palettes = {
    sale: {
      clothing: en ? 'fashion sale palette: raspberry, coral, warm cream, with editorial poster energy' : 'fashion sale palette: малина, коралл, тёплый крем, энергия fashion-постера',
      accessories: en ? 'premium accessory sale palette: graphite, amber gold, deep red accents' : 'premium accessory sale palette: графит, янтарное золото, глубокие красные акценты',
      food: en ? 'appetizing sale palette: juicy red, orange, honey yellow, cream highlights' : 'аппетитная sale-палитра: сочный красный, оранжевый, медово-жёлтый, кремовые блики',
      beauty: en ? 'beauty sale palette: soft rose, peach, champagne gold, glossy highlights' : 'beauty sale palette: мягкий розовый, персик, шампань-золото, глянцевые блики',
      gadgets: en ? 'tech sale palette: deep navy, electric cyan, violet glow, small amber accent for price' : 'tech sale palette: глубокий navy, электрический cyan, фиолетовое свечение, янтарный акцент для цены',
      home: en ? 'home sale palette: warm terracotta, beige, sage green, sunlight glow' : 'home sale palette: тёплая терракота, беж, шалфейный зелёный, солнечное свечение',
      kids: en ? 'kids sale palette: playful sky blue, lemon yellow, coral, rounded soft shapes' : 'kids sale palette: игровой небесно-голубой, лимонный, коралл, мягкие округлые формы',
      other: en ? 'high-energy e-commerce sale palette adapted to the product colors' : 'энергичная e-commerce sale-палитра, адаптированная под цвета товара',
    },
    premium: {
      clothing: en ? 'editorial black, ivory, muted gold, boutique fashion lighting' : 'editorial black, айвори, приглушённое золото, бутик-fashion свет',
      accessories: en ? 'luxury graphite black, champagne gold, subtle reflections' : 'люксовый графитово-чёрный, шампань-золото, тонкие отражения',
      food: en ? 'premium warm dark brown, cream, copper, restaurant menu mood' : 'премиальный тёмно-коричневый, кремовый, медь, вайб ресторанного меню',
      beauty: en ? 'champagne beige, pearl pink, soft gold, glossy cosmetic lighting' : 'шампань-беж, жемчужно-розовый, мягкое золото, глянцевый cosmetic-свет',
      gadgets: en ? 'matte black, deep blue, electric cyan rim light, futuristic premium' : 'матовый чёрный, глубокий синий, cyan-контровой свет, футуристичный premium',
      home: en ? 'warm greige, walnut brown, linen white, premium interior catalog' : 'тёплый greige, ореховый коричневый, льняной белый, premium interior catalog',
      kids: en ? 'soft premium pastel, cream, muted sage, gentle shadows' : 'мягкая премиальная пастель, кремовый, приглушённый шалфей, деликатные тени',
      other: en ? 'luxury dark neutral palette with one refined metallic accent' : 'люксовая тёмная нейтральная палитра с одним металлическим акцентом',
    },
    fresh: {
      clothing: en ? 'light editorial pastel, sky blue, blush, warm daylight' : 'лёгкая editorial-пастель, небесный голубой, blush, тёплый дневной свет',
      accessories: en ? 'clean beige, pale blue, soft gold, airy lifestyle feel' : 'чистый беж, светло-голубой, мягкое золото, воздушный lifestyle',
      food: en ? 'fresh cream, mint, citrus yellow, juicy natural daylight' : 'свежий кремовый, мята, цитрусово-жёлтый, сочный натуральный daylight',
      beauty: en ? 'spa palette: milk white, blush pink, mint, pearl highlights' : 'spa-палитра: молочный белый, blush pink, мята, жемчужные блики',
      gadgets: en ? 'clean light tech palette: white, ice blue, soft cyan, minimal glow' : 'чистая light tech palette: белый, ледяной голубой, мягкий cyan, минимальное свечение',
      home: en ? 'natural home palette: linen, sage, warm sunlight, beige shadows' : 'натуральная home-палитра: лён, шалфей, тёплое солнце, бежевые тени',
      kids: en ? 'soft playful pastel: baby blue, lemon, peach, rounded sticker accents' : 'мягкая игровая пастель: baby blue, лимонный, персик, округлые sticker-акценты',
      other: en ? 'fresh airy palette adapted to product colors, soft daylight' : 'свежая воздушная палитра под цвета товара, мягкий daylight',
    },
  };
  return palettes[style]?.[category] || palettes[style]?.other || palettes.sale.other;
}

export const AD_PROMPTS = {
  'ad-sale': (name, headline, cta, lang, opts = {}) => {
    const h = headline || (lang === 'en' ? 'SPECIAL OFFER' : 'ВЫГОДНОЕ ПРЕДЛОЖЕНИЕ');
    const { extras, forbid } = adExtras({ ...opts, cta }, lang);
    const palette = adPalette(opts.category, 'sale', lang);
    const fidelity = lang === 'en' ? PRODUCT_FIDELITY_EN : PRODUCT_FIDELITY_RU;
    const safeZone = lang === 'en' ? SAFE_ZONE_EN : SAFE_ZONE_RU;
    return lang === 'en'
      ? `Create a premium, visually rich high-conversion SALE advertising banner worthy of a major e-commerce brand. Use the product from the reference image.

Product: "${name}"

${fidelity}

COMPOSITION (layered & dynamic):
- Hero product on the left, ~45% of frame width, slightly tilted 5-10° for energy, floating above a circular soft contact shadow and a glowing radial halo behind it (like a spotlight).
- Right half: vertical hierarchy — large headline top, supporting tagline below it, then price/CTA zone.
- Add 4-6 decorative graphic accents scattered across the background: small sparkle stars, tiny geometric shapes (triangles, circles, plus signs), abstract motion lines or diagonal light streaks. They should feel designed, not random.

TYPOGRAPHY (multi-layer):
- Main headline "${h}" — top-right, bold condensed sans-serif (Montserrat Black / Bebas Neue vibe), pure white, oversized, tight leading. If the headline is two words, stack them for impact.
- Supporting tagline underneath the headline — 1 short line in lighter weight (e.g. "Limited time", "Free shipping", "New collection") — pick something relevant to the product category, half the size, slightly muted white.
${extras}

BACKGROUND (rich, not flat):
- Category-aware palette direction: ${palette}. Keep it energetic and promotional, but harmonize it with the product colors from the reference image.
- Main gradient should follow that palette in a soft diagonal sweep.
- Add a large subtle radial glow behind the product (like soft sunlight).
- Overlay: very faint diagonal light rays emanating from the upper-right corner, plus soft bokeh circles of light in the background at low opacity.
- Optional: fine film grain / noise texture at low opacity for a premium print feel.

LIGHTING & DEPTH:
- Product: soft key light top-left, warm rim light on the right edge matching the gradient, sharp but soft contact shadow directly beneath, subtle reflection if the product has a glossy surface.
- 2-3 levels of depth: background layer (gradient + glow), midground (rays, bokeh, particles), foreground (product + text + badges).

Despite the energetic style, keep the layout clean and readable. Do not overcrowd the design. Maximum 6 decorative elements total.
${safeZone}
${forbid}
${PHOTO_TECH}. All text must be sharp, perfectly legible, and professionally kerned. ${NEGATIVES}`
      : `Создай премиальный, визуально насыщенный продающий рекламный баннер уровня крупного e-commerce бренда. Используй товар с референсного изображения.

Товар: "${name}"

${fidelity}

КОМПОЗИЦИЯ (многослойная, динамичная):
- Герой-товар слева, ~45% ширины кадра, с лёгким наклоном 5-10° для энергии, парит над круглой мягкой контактной тенью, а за ним — радиальное свечение-гало (как софитом подсвечен).
- Правая половина: вертикальная иерархия — крупный заголовок сверху, подзаголовок под ним, ниже зона цены/CTA.
- Добавь 4-6 декоративных графических акцентов, разбросанных по фону: маленькие звёздочки-искры, мелкие геометрические фигуры (треугольники, кружки, плюсы), диагональные световые штрихи. Они должны выглядеть дизайнерски продуманными, а не случайно.

ТИПОГРАФИКА (многоуровневая):
- Главный заголовок "${h}" — справа сверху, жирный узкий шрифт без засечек (в духе Montserrat Black / Bebas Neue), чисто белый, крупный, плотный межстрочный. Если заголовок из двух слов — раздели на две строки.
- Подзаголовок под заголовком — одна короткая строка более тонким шрифтом (например «Ограниченное предложение», «Бесплатная доставка», «Новая коллекция») — выбери релевантное категории товара, в два раза меньше, слегка приглушённо-белый.
${extras}

ФОН (насыщенный, не плоский):
- Палитра под категорию: ${palette}. Сохрани энергичный промо-характер, но гармонизируй цвета с товаром из референса.
- Основной градиент должен следовать этой палитре мягкой диагональной волной.
- Большое мягкое радиальное свечение за товаром (как солнечный свет).
- Оверлей: очень лёгкие диагональные световые лучи из правого верхнего угла плюс мягкие боке-круги на фоне с низкой прозрачностью.
- Опционально: тонкий зерно-шум для премиум-полиграфического эффекта.

СВЕТ И ГЛУБИНА:
- Товар: мягкий ключевой свет сверху-слева, тёплый контровой по правому краю в цвет градиента, чёткая но мягкая тень прямо под ним, лёгкое отражение если поверхность глянцевая.
- 3 плана глубины: фон (градиент + свечение), средний (лучи, боке, частицы), передний (товар + текст + бейджи).

Несмотря на энергичный стиль, сохраняй чистоту и читаемость. Не перегружай дизайн. Максимум 6 декоративных элементов всего.
${safeZone}
${forbid}
${PHOTO_TECH}. Весь текст — острый, идеально читаемый, профессиональный кернинг, на РУССКОМ языке. ${NEGATIVES}`;
  },

  'ad-premium': (name, headline, cta, lang, opts = {}) => {
    const h = headline || (lang === 'en' ? 'PREMIUM CHOICE' : 'ПРЕМИУМ ВЫБОР');
    const { extras, forbid } = adExtras({ ...opts, cta }, lang);
    const palette = adPalette(opts.category, 'premium', lang);
    const fidelity = lang === 'en' ? PRODUCT_FIDELITY_EN : PRODUCT_FIDELITY_RU;
    const safeZone = lang === 'en' ? SAFE_ZONE_EN : SAFE_ZONE_RU;
    return lang === 'en'
      ? `Create a premium luxury advertising banner for an e-commerce product. Use the product from the reference image.

Product: "${name}"

COMPOSITION:
- Hero product slightly off-center, large and elegant, with generous negative space and a calm editorial layout.
- Add subtle depth: refined contact shadow, soft reflection on a glossy or satin surface, and one elegant geometric frame or arc behind the product.
- Keep decorative elements minimal: 1-2 thin metallic lines, subtle glow, or premium texture. No noisy confetti.

TYPOGRAPHY:
- Main headline "${h}" — elegant high-contrast sans-serif or modern serif, restrained size, precise spacing.
- Add one short premium tagline underneath (e.g. "Selected quality", "Designed to impress", "Limited edition") relevant to the product.
${extras}

BACKGROUND:
- Category-aware luxury palette: ${palette}. Harmonize with the product colors, avoid cheap aggressive colors.
- Use a smooth dark/light editorial gradient, subtle vignette, premium material texture (silk, stone, brushed metal, paper grain) when relevant.

LIGHTING:
- Soft cinematic key light, elegant rim light, controlled shadows, premium studio/product photography mood.

${safeZone}
${forbid}
${PHOTO_TECH}. All text must be sharp, perfectly legible, and professionally kerned. ${NEGATIVES}`
      : `Создай премиальный люксовый рекламный баннер для e-commerce товара. Используй товар с референсного изображения.

Товар: "${name}"

КОМПОЗИЦИЯ:
- Герой-товар слегка смещён от центра, крупный и элегантный, много воздуха и спокойная editorial-композиция.
- Добавь глубину: аккуратная контактная тень, мягкое отражение на глянцевой/сатиновой поверхности, один элегантный геометрический контур или дуга за товаром.
- Декор минимальный: 1-2 тонкие металлические линии, деликатное свечение или премиальная текстура. Никакого шумного конфетти.

ТИПОГРАФИКА:
- Главный заголовок "${h}" — элегантный контрастный sans-serif или современный serif, сдержанный размер, точная разрядка.
- Под ним один короткий премиальный подзаголовок (например «Отборное качество», «Создано впечатлять», «Лимитированная серия») релевантно товару.
${extras}

ФОН:
- Люксовая палитра под категорию: ${palette}. Гармонизируй с цветами товара, избегай дешёвых агрессивных цветов.
- Плавный editorial-градиент, лёгкая виньетка, премиальная материальная текстура (шёлк, камень, матовый металл, бумажное зерно), если уместно.

СВЕТ:
- Мягкий кинематографичный ключевой свет, элегантный контровой, контролируемые тени, настроение премиальной предметной фотографии.

${safeZone}
${forbid}
${PHOTO_TECH}. Весь текст — острый, идеально читаемый, профессиональный кернинг, на РУССКОМ языке. ${NEGATIVES}`;
  },

  'ad-fresh': (name, headline, cta, lang, opts = {}) => {
    const h = headline || (lang === 'en' ? 'FRESH PICK' : 'СВЕЖИЙ ВЫБОР');
    const { extras, forbid } = adExtras({ ...opts, cta }, lang);
    const palette = adPalette(opts.category, 'fresh', lang);
    const fidelity = lang === 'en' ? PRODUCT_FIDELITY_EN : PRODUCT_FIDELITY_RU;
    const safeZone = lang === 'en' ? SAFE_ZONE_EN : SAFE_ZONE_RU;
    return lang === 'en'
      ? `Create a fresh, airy lifestyle advertising banner. Use the product from the reference image.

Product: "${name}"

COMPOSITION:
- Product centered or slightly left, clean and approachable, surrounded by soft organic shapes and airy negative space.
- Add 3-5 gentle category-relevant accents: soft leaves, light blobs, rounded stickers, subtle waves, fresh sparkles, or daylight bokeh. Keep it clean, not childish unless the category is kids.
- If price/CTA is present, integrate it as a friendly card/badge, not an aggressive sale sticker.

TYPOGRAPHY:
- Main headline "${h}" — friendly rounded sans-serif, clear and modern, not too heavy.
- Add one short positive tagline underneath (e.g. "For everyday comfort", "Light and natural", "Made for your routine") relevant to the product.
${extras}

BACKGROUND:
- Category-aware fresh palette: ${palette}. Harmonize with the product colors and keep contrast high enough for readable text.
- Bright soft gradient, clean daylight, subtle shadows, calm lifestyle mood.

LIGHTING:
- Soft natural daylight, gentle shadow, clean commercial look, realistic product material.

${safeZone}
${forbid}
${PHOTO_TECH}. All text must be sharp, perfectly legible, and professionally kerned. ${NEGATIVES}`
      : `Создай свежий, воздушный lifestyle-рекламный баннер. Используй товар с референсного изображения.

Товар: "${name}"

КОМПОЗИЦИЯ:
- Товар по центру или слегка слева, чистый и дружелюбный, вокруг мягкие органические формы и много воздуха.
- Добавь 3-5 мягких акцентов по категории: нежные листья, светлые blobs-формы, округлые стикеры, лёгкие волны, свежие искры или daylight-боке. Чисто, не по-детски, кроме категории детских товаров.
- Если есть цена/CTA — интегрируй как дружелюбную карточку/бейдж, не как агрессивную sale-наклейку.

ТИПОГРАФИКА:
- Главный заголовок "${h}" — дружелюбный округлый sans-serif, чистый и современный, не слишком тяжёлый.
- Под ним один короткий позитивный подзаголовок (например «Для комфорта каждый день», «Легко и натурально», «Для вашего ритма») релевантно товару.
${extras}

ФОН:
- Свежая палитра под категорию: ${palette}. Гармонизируй с цветами товара и сохраняй достаточный контраст для читаемости текста.
- Светлый мягкий градиент, чистый daylight, деликатные тени, спокойный lifestyle mood.

СВЕТ:
- Мягкий естественный дневной свет, нежная тень, чистый коммерческий вид, реалистичные материалы товара.

${safeZone}
${forbid}
${PHOTO_TECH}. Весь текст — острый, идеально читаемый, профессиональный кернинг, на РУССКОМ языке. ${NEGATIVES}`;
  },

  'ad-minimal': (name, headline, cta, lang, opts = {}) => {
    const h = headline || name;
    const { extras, forbid } = adExtras({ ...opts, cta }, lang);
    const fidelity = lang === 'en' ? PRODUCT_FIDELITY_EN : PRODUCT_FIDELITY_RU;
    const safeZone = lang === 'en' ? SAFE_ZONE_EN : SAFE_ZONE_RU;
    return lang === 'en'
      ? `Create a minimalist, premium advertising creative in Apple/MUJI style. Use the product from the reference image.

Product: "${name}"

${fidelity}

COMPOSITION: Product perfectly centered, occupying ~60% of the frame height. Floating on pure white (#FFFFFF) background with a very subtle contact shadow beneath. Lots of negative space (whitespace).

TYPOGRAPHY:
- Product name "${h}" — thin, elegant sans-serif (like SF Pro Display Thin or Helvetica Neue Light), dark gray (#1A1A1A), centered above the product, modest size.
- One line of subtle description or tagline below the product name in lighter gray. If no tagline is provided, use a very generic neutral phrase or omit it. Do not invent specific claims.
${extras}

BACKGROUND: Pure white, no gradients, no patterns. Absolute minimalism.

LIGHTING: Even, diffused studio lighting. No dramatic shadows.

${safeZone}
${forbid}
${PHOTO_TECH}. Ultra-clean, gallery-quality. ${NEGATIVES}`
      : `Создай минималистичный премиальный рекламный креатив в стиле Apple/MUJI. Используй товар с референсного изображения.

Товар: "${name}"

${fidelity}

КОМПОЗИЦИЯ: Товар идеально по центру, ~60% высоты кадра. Парит на чисто белом фоне (#FFFFFF) с едва заметной контактной тенью.

ТИПОГРАФИКА:
- Название "${h}" — тонкий элегантный шрифт без засечек, тёмно-серый (#1A1A1A), по центру над товаром.
- Одна строка лёгкого описания ниже — светло-серый. Если описание не задано, используй очень нейтральную фразу или пропусти её. Не выдумывай конкретные обещания.
${extras}

ФОН: Чисто белый. Никаких градиентов. Абсолютный минимализм.

СВЕТ: Равномерный рассеянный студийный свет.

${safeZone}
${forbid}
${PHOTO_TECH}. Галерейное качество. Текст на РУССКОМ. ${NEGATIVES}`;
  },

  'ad-story': (name, headline, cta, lang, opts = {}) => {
    const h = headline || name;
    const { extras, forbid } = adExtras({ ...opts, cta }, lang);
    const palette = adPalette(opts.category, 'fresh', lang);
    const fidelity = lang === 'en' ? PRODUCT_FIDELITY_EN : PRODUCT_FIDELITY_RU;
    const safeZone = lang === 'en' ? SAFE_ZONE_EN : SAFE_ZONE_RU;
    return lang === 'en'
      ? `Create a vertical STORY/REELS advertising creative (9:16 format). Use the product from the reference image.

Product: "${name}"

${fidelity}

COMPOSITION: Vertical format. Product centered in the middle third of the frame, slightly enlarged, with a soft glow or light halo behind it. Top third: headline. Bottom third: optional CTA area.

TYPOGRAPHY:
- Headline "${h}" — bold condensed sans-serif, white, positioned in the top quarter. Maximum 2 lines. Drop shadow for readability.
${extras}

BACKGROUND: Category-aware palette: ${palette}. Vibrant vertical gradient adapted to the product. Subtle bokeh or lens flare effects.

LIGHTING: Strong rim light creating a glowing silhouette. Soft fill light from front.

${safeZone}
${forbid}
${PHOTO_TECH}. Optimized for mobile viewing. ${NEGATIVES}`
      : `Создай вертикальный рекламный креатив для STORIES/REELS (формат 9:16). Используй товар с референсного изображения.

Товар: "${name}"

${fidelity}

КОМПОЗИЦИЯ: Вертикальный формат. Товар по центру в средней трети кадра, слегка увеличен, мягкое свечение позади. Верхняя треть: заголовок. Нижняя треть: опциональная CTA-зона.

ТИПОГРАФИКА:
- Заголовок "${h}" — жирный узкий шрифт без засечек, белый, в верхней четверти. Максимум 2 строки. Тень для читаемости.
${extras}

ФОН: Палитра под категорию: ${palette}. Яркий вертикальный градиент, адаптированный под товар. Лёгкое боке.

СВЕТ: Драматичный контровой свет, мягкий заполняющий спереди.

${safeZone}
${forbid}
${PHOTO_TECH}. Текст на РУССКОМ. ${NEGATIVES}`;
  },
};
