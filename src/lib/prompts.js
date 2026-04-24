/**
 * AI Prompts — Aidentika-style concepts
 * 3 photo types: in-use, in-context, studio
 * 3 card types: infographic, minimal, gradient
 * 3 ad types: sale, minimal, story
 */

const NEGATIVES = `Avoid: distorted shapes, warped text, blurry edges, low resolution, cartoon style, watermarks, AI artifacts, gibberish text, extra fingers, deformed products.`;
const PHOTO_TECH = `photorealistic, ultra-sharp focus, 8k resolution, high-end commercial photography, professional color grading, shot on Canon EOS R5 with 85mm lens`;

function fmt(name, bullets) {
  let s = `Product: "${name}"`;
  if (bullets?.length) s += `\nKey features:\n${bullets.map(b => `• ${b}`).join('\n')}`;
  return s;
}

// ========================================
// PHOTO CONCEPTS (Aidentika-style)
// ========================================

export const MARKETPLACE_PROMPTS = {

  // --- В ИСПОЛЬЗОВАНИИ ---
  'in-use': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Professional lifestyle product photography. ${p}

Show a real person naturally using this product in an appropriate everyday setting. The person should look authentic and relatable — not overly posed. The product is the clear hero and focal point.

Setting: Choose the most natural context for this product (kitchen, bathroom, living room, office, outdoors). Warm natural lighting streaming from a window or soft ambient light. Shallow depth of field (f/2.8) — person and product sharp, background softly blurred.

The person is interacting with the product: holding it, applying it, pouring from it, wearing it — whatever is most natural. Medium shot framing showing the person from waist up.

${PHOTO_TECH}, editorial lifestyle photography, aspirational but authentic. Vertical 3:4 composition.

${NEGATIVES}`
      : `Профессиональная lifestyle-фотография товара. ${p}

Покажи реального человека, который естественно использует этот товар в подходящей повседневной обстановке. Человек должен выглядеть естественно и аутентично — без постановочных поз. Товар — главный герой и фокусная точка.

Обстановка: Выбери наиболее естественный контекст для этого товара (кухня, ванная, гостиная, офис). Тёплый естественный свет из окна или мягкий рассеянный свет. Малая глубина резкости (f/2.8) — человек и товар резкие, фон мягко размыт.

Человек взаимодействует с товаром: держит его, наносит, наливает, использует — что наиболее естественно. Средний план — человек по пояс.

${PHOTO_TECH}, журнальная lifestyle-съёмка, вдохновляющая но аутентичная. Вертикальная композиция 3:4.

${NEGATIVES}`;
  },

  // --- В ОКРУЖЕНИИ ---
  'in-context': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Professional styled product photography in a beautiful environment. ${p}

Place the product in an aesthetically curated setting. The product sits naturally on an appropriate surface — wooden table, marble countertop, linen cloth, bathroom shelf, kitchen counter, or styled flat lay arrangement with complementary props.

Lighting: Soft natural window light, golden hour warmth. Subtle shadows add depth. The scene feels inviting and magazine-worthy.

Props: 2-3 complementary items that match the product category (plants, books, fabrics, ingredients, textures). Nothing distracting — the product remains the clear focal point.

${PHOTO_TECH}, interior/lifestyle photography, Pinterest-worthy composition, warm inviting atmosphere. Vertical 3:4.

${NEGATIVES}`
      : `Профессиональная стилизованная фотография товара в красивом окружении. ${p}

Размести товар в эстетично оформленной обстановке. Товар стоит естественно на подходящей поверхности — деревянный стол, мраморная столешница, льняная ткань, полка в ванной, кухонная стойка, или стилизованная flat lay раскладка с дополняющими предметами.

Освещение: Мягкий естественный свет из окна, теплота golden hour. Лёгкие тени для глубины. Сцена выглядит уютной и достойной глянцевого журнала.

Реквизит: 2-3 дополняющих предмета по категории товара (растения, книги, ткани, ингредиенты). Ничего отвлекающего — товар остаётся главным.

${PHOTO_TECH}, интерьерная/lifestyle фотография, Pinterest-worthy, тёплая уютная атмосфера. Вертикальный 3:4.

${NEGATIVES}`;
  },

  // --- КАТАЛОГ (СТУДИЙНО) ---
  'studio': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Professional studio catalog product photography. ${p}

The product is placed on a clean, seamless background — pure white (#FFFFFF) or very light gray. Professional three-point studio lighting: soft key light from upper-left, fill light from right, subtle rim light to separate product from background.

Natural contact shadow beneath the product. The product fills 80-85% of the frame, centered. Slight 15-degree angle to show dimensionality. Crisp, tack-sharp focus across the entire product.

E-commerce ready, Amazon/eBay main image compliant. No text, no props, no graphics — only the product, beautifully lit.

${PHOTO_TECH}, studio packshot, minimalist commercial photography. Square 1:1 or vertical 3:4.

${NEGATIVES}`
      : `Профессиональная студийная каталожная фотография товара. ${p}

Товар на чистом бесшовном фоне — чисто белый (#FFFFFF) или очень светлый серый. Профессиональный трёхточечный студийный свет: мягкий ключевой свет сверху-слева, заполняющий справа, лёгкий контровой для отделения от фона.

Естественная контактная тень. Товар занимает 80-85% кадра, по центру. Лёгкий угол 15° для объёмности. Резкий фокус по всему товару.

Готово для маркетплейса. Без текста, без реквизита, без графики — только товар, красиво освещённый.

${PHOTO_TECH}, студийный packshot, минималистичная коммерческая фотография. Квадрат 1:1 или вертикальный 3:4.

${NEGATIVES}`;
  },

  // --- ИНФОГРАФИКА (карточка с текстом) ---
  'infographic': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a professional product infographic card. Based on the product from the reference image. ${p}

LAYOUT: Vertical 3:4 ratio. The product is positioned center-left (taking 40% width), cleanly cut out with a professional shadow. On the right side and around the product: 4-5 infographic callout lines pointing from the product to feature descriptions.

CALLOUTS: Each callout consists of: a thin connecting line from the product → a small circular icon (modern line-art style in blue #3B82F6 or teal #14B8A6) → short text label in clean sans-serif.

HEADER: Bold dark (#1A1A2E) product name at the top. Clean modern sans-serif font.

FOOTER: A specs bar at the bottom with key numbers/dimensions displayed in rounded pill-shaped badges.

BACKGROUND: Light gray (#F4F5F7) or white. Clean, well-spaced, professional.

STYLE: Apple product page infographic, professional datasheet. ${PHOTO_TECH}.

${NEGATIVES}`
      : `Создай профессиональную инфографику для карточки товара. На основе товара с референсного изображения. ${p}

КОМПОНОВКА: Вертикальный 3:4. Товар — по центру-слева (40% ширины), чисто вырезан с профессиональной тенью. Справа и вокруг товара: 4-5 инфографических выносок к характеристикам.

ВЫНОСКИ: Каждая: тонкая соединительная линия от товара → маленькая круглая иконка (линейный стиль, синий #3B82F6 или бирюзовый #14B8A6) → короткий текст описания.

ЗАГОЛОВОК: Жирный тёмный (#1A1A2E) текст названия сверху.

ПОДВАЛ: Панель характеристик — ключевые параметры в округлых pill-бейджах.

ФОН: Светло-серый (#F4F5F7) или белый.

СТИЛЬ: Инфографика Apple, профессиональный datasheet. ${PHOTO_TECH}. Текст на РУССКОМ.

${NEGATIVES}`;
  },

  // --- МИНИМАЛИСТИЧНАЯ КАРТОЧКА ---
  'minimal-card': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a minimalist product card for marketplace. Based on the product from the reference image. ${p}

Vertical 3:4 card. Upper 55%: product on clean white background, centered, studio lighting, soft shadow. Lower 45%: text block. Product name in bold geometric sans-serif (Montserrat style), dark (#1A1A2E). Bullet points with green checkmark icons, muted gray text. Generous whitespace. Thin divider line.

Apple Store clean aesthetic. ${PHOTO_TECH}.

${NEGATIVES}`
      : `Создай минималистичную карточку товара для маркетплейса. На основе товара с референсного изображения. ${p}

Вертикальная 3:4. Верхние 55%: товар на белом фоне, по центру, студийный свет, мягкая тень. Нижние 45%: текст. Название — жирный геометрический шрифт (стиль Montserrat), тёмный (#1A1A2E). Буллеты с зелёными галочками, серый текст. Много воздуха. Тонкий разделитель.

Эстетика Apple Store. ${PHOTO_TECH}. Текст на РУССКОМ.

${NEGATIVES}`;
  },

  // --- ГРАДИЕНТНАЯ КАРТОЧКА ---
  'gradient-card': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a vibrant gradient product card. Based on the product from the reference image. ${p}

Vertical 3:4. Background: rich diagonal gradient (deep violet #4A00E0 → purple #8E2DE2 → pink #FF006E). Product floating center with dramatic shadow and subtle reflection. Title: large bold white uppercase text at top. Features: 3-4 bullets in glassmorphism frosted pills (white 12% opacity with blur), white text with amber arrows (▸).

Samsung/OnePlus launch aesthetic. ${PHOTO_TECH}.

${NEGATIVES}`
      : `Создай яркую градиентную карточку товара. На основе товара с референсного изображения. ${p}

Вертикальный 3:4. Фон: насыщенный диагональный градиент (фиолетовый #4A00E0 → пурпурный #8E2DE2 → розовый #FF006E). Товар парит по центру с тенью и отражением. Заголовок: крупный жирный белый КАПС сверху. Преимущества: 3-4 буллета в glassmorphism плашках (белый 12% с блюром), белый текст с янтарными стрелками (▸).

Эстетика Samsung/OnePlus. ${PHOTO_TECH}. Текст на РУССКОМ.

${NEGATIVES}`;
  },
};

// ========================================
// AD PROMPTS
// ========================================

export const AD_PROMPTS = {

  'ad-sale': (name, headline, cta, lang) => lang === 'en'
    ? `Create a high-conversion sale ad. Product from reference image.
Product: "${name}" | Headline: "${headline || 'UP TO 50% OFF'}" | CTA: "${cta || 'Shop Now'}"

Energetic gradient red (#FF416C) to orange (#FF4B2B). Product left (45%), floating, rotated 5°. HUGE bold white headline right. Yellow (#FFD700) starburst price badge. White pill CTA button. Confetti and speed lines. Square 1:1. ${PHOTO_TECH}.
${NEGATIVES}`
    : `Создай продающий рекламный креатив. Товар с референсного изображения.
Товар: "${name}" | Заголовок: "${headline || 'СКИДКА ДО 50%'}" | CTA: "${cta || 'Купить сейчас'}"

Энергичный градиент красный (#FF416C) → оранжевый (#FF4B2B). Товар слева (45%), парит, поворот 5°. ОГРОМНЫЙ жирный белый заголовок справа. Жёлтый (#FFD700) бейдж цены. Белая CTA кнопка. Конфетти и линии скорости. Квадрат 1:1. ${PHOTO_TECH}. Текст на РУССКОМ.
${NEGATIVES}`,

  'ad-minimal': (name, headline, cta, lang) => lang === 'en'
    ? `Minimalist product ad. Product from reference image.
Product: "${name}" | Headline: "${headline || name}" | CTA: "${cta || 'Learn More'}"

White (#FAFAFA) background. Product centered, large (60%), soft shadow. Thin dark headline. Dark CTA button. Massive whitespace. Square 1:1. ${PHOTO_TECH}. Apple aesthetic.
${NEGATIVES}`
    : `Минималистичный рекламный креатив. Товар с референсного изображения.
Товар: "${name}" | Заголовок: "${headline || name}" | CTA: "${cta || 'Подробнее'}"

Белый (#FAFAFA) фон. Товар по центру, крупно (60%), мягкая тень. Тонкий тёмный заголовок. Тёмная CTA кнопка. Много воздуха. Квадрат 1:1. ${PHOTO_TECH}. Текст на РУССКОМ.
${NEGATIVES}`,

  'ad-story': (name, headline, cta, lang) => lang === 'en'
    ? `Vertical story ad creative. Product from reference image.
Product: "${name}" | Headline: "${headline || name}" | CTA: "${cta || 'Swipe Up'}"

Vibrant gradient indigo (#6366F1) → violet (#A855F7) → pink (#EC4899). Product center with white glow. Bold white headline. White pill CTA at bottom, arrow ↑. Abstract shapes and sparkles. Vertical 9:16. ${PHOTO_TECH}.
${NEGATIVES}`
    : `Вертикальный креатив для stories. Товар с референсного изображения.
Товар: "${name}" | Заголовок: "${headline || name}" | CTA: "${cta || 'Узнать'}"

Яркий градиент индиго (#6366F1) → фиолетовый (#A855F7) → розовый (#EC4899). Товар по центру с белым свечением. Крупный белый заголовок. Белая pill CTA снизу, стрелка ↑. Абстрактные формы. Вертикальный 9:16. ${PHOTO_TECH}. Текст на РУССКОМ.
${NEGATIVES}`,
};
