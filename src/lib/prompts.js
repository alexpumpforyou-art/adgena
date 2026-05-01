/**
 * AI Prompts — Category-aware, Aidentika-style
 * Each concept has category-specific context injected
 */

const NEGATIVES = `Avoid: distorted shapes, warped text, blurry edges, low resolution, cartoon style, watermarks, AI artifacts, gibberish text, extra fingers, deformed products.`;
const PHOTO_TECH = `photorealistic, ultra-sharp focus, 8k resolution, high-end commercial photography, professional color grading, shot on Canon EOS R5 with 85mm lens`;

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

  const prompts = {

    // --- НА МОДЕЛИ / ON MODEL ---
    'on-model': isRu
      ? `Профессиональная fashion-фотография. ${p}

Покажи модель (мужчину или женщину — выбери подходящий пол) в этом товаре. Модель стоит или идёт в ${c.scene}. Акцент на посадке и фактуре ткани. Естественная поза, не постановочная.

Освещение: мягкий студийный или естественный свет. Малая глубина резкости — товар и модель резкие, фон размыт. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional fashion photography. ${p}

Show a model (choose appropriate gender) wearing this product. Model standing or walking in ${c.scene}. Focus on fit and fabric texture. Natural, not overly posed.

Lighting: soft studio or natural light. Shallow depth of field. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- КАК В МАГАЗИНЕ / IN STORE ---
    'in-store': isRu
      ? `Профессиональная фотография товара как в магазине. ${p}

Товар аккуратно висит на вешалке или расположен на подставке/манекене в стильном бутике. Фон — магазинный интерьер, слегка размытый. Аккуратная выкладка. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional in-store product photography. ${p}

Product neatly displayed on a hanger or mannequin in a stylish boutique setting. Blurred store interior background. Neat presentation. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- РАСКЛАДКА СВЕРХУ / FLAT LAY ---
    'flat-lay': isRu
      ? `Профессиональная flat lay фотография строго сверху. ${p}

Товар разложен на ${c.surface}, снято строго сверху (вид сверху, 90°). Вокруг — 2-3 подходящих дополняющих предмета. Аккуратная симметричная композиция. Равномерное мягкое освещение без резких теней. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional flat lay photography, strictly top-down. ${p}

Product laid out on ${c.surface}, shot from directly above (90° overhead). Surrounded by 2-3 complementary props. Neat, symmetrical composition. Even, soft lighting. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- КАТАЛОГ СТУДИЙНО / STUDIO ---
    'studio': isRu
      ? `Профессиональная студийная каталожная фотография. ${p}

Товар на чисто белом или светло-сером бесшовном фоне. Трёхточечный студийный свет: ключевой сверху-слева, заполняющий справа, контровой для отделения от фона. Контактная тень. Товар по центру, занимает 80-85% кадра. Резкий фокус. Без текста, без реквизита. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional studio catalog photography. ${p}

Product on pure white or light gray seamless background. Three-point studio lighting. Contact shadow. Centered, filling 80-85% of frame. Tack-sharp focus. No text, no props. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- В ИСПОЛЬЗОВАНИИ / IN USE ---
    'in-use': isRu
      ? `Профессиональная lifestyle-фотография. ${p}

${c.person} в ${c.scene}. Человек выглядит естественно, не постановочно. Товар — главный фокус. Тёплый естественный свет. Малая глубина резкости (f/2.8). Средний план. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional lifestyle photography. ${p}

${c.person} in ${c.scene}. Person looks natural, not overly posed. Product is the clear focal point. Warm natural light. Shallow depth of field (f/2.8). Medium shot. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- В ОКРУЖЕНИИ / IN CONTEXT ---
    'in-context': isRu
      ? `Профессиональная стилизованная фотография товара. ${p}

Товар размещён на ${c.surface} в ${c.scene}. Рядом 2-3 дополняющих предмета. Мягкий естественный свет. Тёплая уютная атмосфера, достойная журнала. Товар — главный фокус. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Professional styled product photography. ${p}

Product placed on ${c.surface} in ${c.scene}. 2-3 complementary props nearby. Soft natural light. Warm, magazine-worthy atmosphere. Product is the focal point. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- КРУПНЫЙ ПЛАН / CLOSE-UP ---
    'close-up': isRu
      ? `Макро-фотография товара, крупный план. ${p}

Снять одну ключевую деталь крупным планом: текстура, кнопки, экран, поверхность, швы, материал. Малая глубина резкости, размытый фон. Драматичное боковое освещение подчёркивает текстуру. ${PHOTO_TECH}, макро-объектив 100мм.${wishBlock}

${NEGATIVES}`
      : `Macro product photography, close-up. ${p}

Capture one key detail: texture, buttons, screen, surface, stitching, material. Shallow DOF, blurred background. Dramatic side lighting to highlight texture. ${PHOTO_TECH}, 100mm macro lens.${wishBlock}

${NEGATIVES}`,

    // --- В ИНТЕРЬЕРЕ / IN INTERIOR ---
    'in-interior': isRu
      ? `Интерьерная фотография товара. ${p}

Товар естественно размещён в ${c.scene} — на своём месте, как будто это реальный интерьер. Мягкий свет из окна. Стильный современный интерьер. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`
      : `Interior product photography. ${p}

Product naturally placed in ${c.scene} — in its proper place, like a real interior. Soft window light. Modern stylish interior. ${PHOTO_TECH}.${wishBlock}

${NEGATIVES}`,

    // --- СЕРВИРОВКА (еда) / PLATED ---
    'plated': isRu
      ? `Профессиональная food-фотография. ${p}

Товар красиво сервирован: на тарелке, в бокале, или готов к подаче на ${c.surface}. Свежие ингредиенты рядом. Тёплое аппетитное освещение. ${PHOTO_TECH}, food photography style.${wishBlock}

${NEGATIVES}`
      : `Professional food photography. ${p}

Product beautifully plated or served on ${c.surface}. Fresh ingredients nearby. Warm appetizing lighting. ${PHOTO_TECH}, food photography style.${wishBlock}

${NEGATIVES}`,

    // --- ТЕКСТУРА (косметика) / TEXTURE ---
    'texture': isRu
      ? `Макро-фотография текстуры косметического средства. ${p}

Крупный план текстуры: крем, масло, гель, или сыворотка. Мазок или капля на чистой поверхности. Видна консистенция и цвет. Мягкий рассеянный свет. ${PHOTO_TECH}, макро.${wishBlock}

${NEGATIVES}`
      : `Macro texture photography of beauty product. ${p}

Close-up of texture: cream, oil, gel, or serum. Swatch or drop on clean surface. Showing consistency and color. Soft diffused light. ${PHOTO_TECH}, macro.${wishBlock}

${NEGATIVES}`,
  };

  return prompts[conceptId] || prompts['studio'];
}

// ========================================
// CARD PROMPTS (infographic with style)
// ========================================

export function getCardPrompt({ productName, bullets, lang, cardText, cardStyle, creativity, wishes }) {
  const p = fmt(productName, bullets);
  const isRu = lang !== 'en';
  const styleHint = cardStyle === 'premium'
    ? (isRu ? 'Премиальный стиль: тёмный фон, золотые акценты, элегантная типографика.' : 'Premium style: dark background, gold accents, elegant typography.')
    : (isRu ? 'Классический стиль: светлый/белый фон, чистая типографика, яркие акценты.' : 'Classic style: light/white background, clean typography, bright accents.');

  const creativityHint = creativity > 0.7
    ? (isRu ? 'Будь креативным и экспериментируй с дизайном.' : 'Be creative and experiment with design.')
    : creativity < 0.3
      ? (isRu ? 'Строго следуй стандартному маркетплейс-дизайну, минимум вольностей.' : 'Strictly follow standard marketplace design, minimal creative liberties.')
      : '';

  const userText = cardText || (isRu
    ? (bullets?.length ? bullets.join(', ') : 'основные преимущества товара')
    : (bullets?.length ? bullets.join(', ') : 'key product benefits'));

  const wishBlock = wishes ? `\n\nДополнительно: ${wishes}` : '';

  return isRu
    ? `Создай профессиональную карточку товара для маркетплейса. На основе товара с референсного изображения. ${p}

Текст для карточки: "${userText}"

${styleHint}

КОМПОНОВКА: Товар по центру или слева (40% ширины), чисто вырезан с тенью. Вокруг — 3-5 инфографических выносок с иконками и коротким текстом. Заголовок — крупный жирный шрифт сверху. Внизу — pill-бейджи с характеристиками.

${creativityHint}
${PHOTO_TECH}. Текст на РУССКОМ.${wishBlock}

${NEGATIVES}`
    : `Create a professional product card for marketplace. Based on product from reference image. ${p}

Card text: "${userText}"

${styleHint}

LAYOUT: Product centered or left (40% width), cleanly cut out with shadow. Around it: 3-5 infographic callouts with icons and short text. Title: large bold font at top. Bottom: pill badges with specs.

${creativityHint}
${PHOTO_TECH}.${wishBlock}

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

export const AD_PROMPTS = {
  'ad-sale': (name, headline, cta, lang, opts = {}) => {
    const h = headline || (lang === 'en' ? 'SPECIAL OFFER' : 'ВЫГОДНОЕ ПРЕДЛОЖЕНИЕ');
    const { extras, forbid } = adExtras({ ...opts, cta }, lang);
    return lang === 'en'
      ? `Create a premium, visually rich high-conversion SALE advertising banner worthy of a major e-commerce brand. Use the product from the reference image.

Product: "${name}"

COMPOSITION (layered & dynamic):
- Hero product on the left, ~45% of frame width, slightly tilted 5-10° for energy, floating above a circular soft contact shadow and a glowing radial halo behind it (like a spotlight).
- Right half: vertical hierarchy — large headline top, supporting tagline below it, then price/CTA zone.
- Add 4-6 decorative graphic accents scattered across the background: small sparkle stars, tiny geometric shapes (triangles, circles, plus signs), abstract motion lines or diagonal light streaks. They should feel designed, not random.

TYPOGRAPHY (multi-layer):
- Main headline "${h}" — top-right, bold condensed sans-serif (Montserrat Black / Bebas Neue vibe), pure white, oversized, tight leading. If the headline is two words, stack them for impact.
- Supporting tagline underneath the headline — 1 short line in lighter weight (e.g. "Limited time", "Free shipping", "New collection") — pick something relevant to the product category, half the size, slightly muted white.
${extras}

BACKGROUND (rich, not flat):
- Main gradient: deep crimson (#B91C1C) → vibrant orange (#F97316) → warm golden (#FBBF24) in a soft diagonal sweep.
- Add a large subtle radial glow behind the product (like soft sunlight).
- Overlay: very faint diagonal light rays emanating from the upper-right corner, plus soft bokeh circles of light in the background at low opacity.
- Optional: fine film grain / noise texture at low opacity for a premium print feel.

LIGHTING & DEPTH:
- Product: soft key light top-left, warm rim light on the right edge matching the gradient, sharp but soft contact shadow directly beneath, subtle reflection if the product has a glossy surface.
- 2-3 levels of depth: background layer (gradient + glow), midground (rays, bokeh, particles), foreground (product + text + badges).

${forbid}
${PHOTO_TECH}. All text must be sharp, perfectly legible, and professionally kerned. ${NEGATIVES}`
      : `Создай премиальный, визуально насыщенный продающий рекламный баннер уровня крупного e-commerce бренда. Используй товар с референсного изображения.

Товар: "${name}"

КОМПОЗИЦИЯ (многослойная, динамичная):
- Герой-товар слева, ~45% ширины кадра, с лёгким наклоном 5-10° для энергии, парит над круглой мягкой контактной тенью, а за ним — радиальное свечение-гало (как софитом подсвечен).
- Правая половина: вертикальная иерархия — крупный заголовок сверху, подзаголовок под ним, ниже зона цены/CTA.
- Добавь 4-6 декоративных графических акцентов, разбросанных по фону: маленькие звёздочки-искры, мелкие геометрические фигуры (треугольники, кружки, плюсы), диагональные световые штрихи. Они должны выглядеть дизайнерски продуманными, а не случайно.

ТИПОГРАФИКА (многоуровневая):
- Главный заголовок "${h}" — справа сверху, жирный узкий шрифт без засечек (в духе Montserrat Black / Bebas Neue), чисто белый, крупный, плотный межстрочный. Если заголовок из двух слов — раздели на две строки.
- Подзаголовок под заголовком — одна короткая строка более тонким шрифтом (например «Ограниченное предложение», «Бесплатная доставка», «Новая коллекция») — выбери релевантное категории товара, в два раза меньше, слегка приглушённо-белый.
${extras}

ФОН (насыщенный, не плоский):
- Основной градиент: тёмно-малиновый (#B91C1C) → насыщенный оранжевый (#F97316) → тёплый золотистый (#FBBF24), мягкой диагональной волной.
- Большое мягкое радиальное свечение за товаром (как солнечный свет).
- Оверлей: очень лёгкие диагональные световые лучи из правого верхнего угла плюс мягкие боке-круги на фоне с низкой прозрачностью.
- Опционально: тонкий зерно-шум для премиум-полиграфического эффекта.

СВЕТ И ГЛУБИНА:
- Товар: мягкий ключевой свет сверху-слева, тёплый контровой по правому краю в цвет градиента, чёткая но мягкая тень прямо под ним, лёгкое отражение если поверхность глянцевая.
- 3 плана глубины: фон (градиент + свечение), средний (лучи, боке, частицы), передний (товар + текст + бейджи).

${forbid}
${PHOTO_TECH}. Весь текст — острый, идеально читаемый, профессиональный кернинг, на РУССКОМ языке. ${NEGATIVES}`;
  },

  'ad-minimal': (name, headline, cta, lang, opts = {}) => {
    const h = headline || name;
    const { extras, forbid } = adExtras({ ...opts, cta }, lang);
    return lang === 'en'
      ? `Create a minimalist, premium advertising creative in Apple/MUJI style. Use the product from the reference image.

Product: "${name}"

COMPOSITION: Product perfectly centered, occupying ~60% of the frame height. Floating on pure white (#FFFFFF) background with a very subtle contact shadow beneath. Lots of negative space (whitespace).

TYPOGRAPHY:
- Product name "${h}" — thin, elegant sans-serif (like SF Pro Display Thin or Helvetica Neue Light), dark gray (#1A1A1A), centered above the product, modest size.
- One line of subtle description or tagline below the product name in lighter gray.
${extras}

BACKGROUND: Pure white, no gradients, no patterns. Absolute minimalism.

LIGHTING: Even, diffused studio lighting. No dramatic shadows.

${forbid}
${PHOTO_TECH}. Ultra-clean, gallery-quality. ${NEGATIVES}`
      : `Создай минималистичный премиальный рекламный креатив в стиле Apple/MUJI. Используй товар с референсного изображения.

Товар: "${name}"

КОМПОЗИЦИЯ: Товар идеально по центру, ~60% высоты кадра. Парит на чисто белом фоне (#FFFFFF) с едва заметной контактной тенью.

ТИПОГРАФИКА:
- Название "${h}" — тонкий элегантный шрифт без засечек, тёмно-серый (#1A1A1A), по центру над товаром.
- Одна строка лёгкого описания ниже — светло-серый.
${extras}

ФОН: Чисто белый. Никаких градиентов. Абсолютный минимализм.

СВЕТ: Равномерный рассеянный студийный свет.

${forbid}
${PHOTO_TECH}. Галерейное качество. Текст на РУССКОМ. ${NEGATIVES}`;
  },

  'ad-story': (name, headline, cta, lang, opts = {}) => {
    const h = headline || name;
    const { extras, forbid } = adExtras({ ...opts, cta }, lang);
    return lang === 'en'
      ? `Create a vertical STORY/REELS advertising creative (9:16 format). Use the product from the reference image.

Product: "${name}"

COMPOSITION: Vertical format. Product centered in the middle third of the frame, slightly enlarged, with a soft glow or light halo behind it. Top third: headline. Bottom third: optional CTA area.

TYPOGRAPHY:
- Headline "${h}" — bold condensed sans-serif, white, positioned in the top quarter. Maximum 2 lines. Drop shadow for readability.
${extras}

BACKGROUND: Vibrant gradient — deep purple to electric blue, or dark teal to emerald green. Subtle bokeh or lens flare effects.

LIGHTING: Strong rim light creating a glowing silhouette. Soft fill light from front.

${forbid}
${PHOTO_TECH}. Optimized for mobile viewing. ${NEGATIVES}`
      : `Создай вертикальный рекламный креатив для STORIES/REELS (формат 9:16). Используй товар с референсного изображения.

Товар: "${name}"

КОМПОЗИЦИЯ: Вертикальный формат. Товар по центру в средней трети кадра, слегка увеличен, мягкое свечение позади. Верхняя треть: заголовок. Нижняя треть: опциональная CTA-зона.

ТИПОГРАФИКА:
- Заголовок "${h}" — жирный узкий шрифт без засечек, белый, в верхней четверти. Максимум 2 строки. Тень для читаемости.
${extras}

ФОН: Яркий градиент — фиолетовый в электрик-синий или изумрудный в бирюзовый. Лёгкое боке.

СВЕТ: Драматичный контровой свет, мягкий заполняющий спереди.

${forbid}
${PHOTO_TECH}. Текст на РУССКОМ. ${NEGATIVES}`;
  },
};
