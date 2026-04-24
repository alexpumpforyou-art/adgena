/**
 * AI Image Generation Prompts — Research-Based Professional Quality
 * Sources: Midjourney community, Gemini prompt guides, e-commerce AI best practices
 * Structure: [Subject] + [Surface/Placement] + [Lighting/Camera] + [Style] + [Negatives]
 */

// Negative prompt block to avoid common AI artifacts
const NEGATIVES = `Avoid: distorted shapes, extra limbs, warped text, blurry edges, low resolution, amateur look, clip art, cartoon style, watermarks, AI artifacts, gibberish text.`;

// Professional photography technical block
const PHOTO_TECH = `photorealistic, ultra-sharp focus, 8k resolution, high-end commercial photography, professional color grading`;

function fmt(name, bullets) {
  let s = `Product: "${name}"`;
  if (bullets?.length) s += `\nKey features:\n${bullets.map(b => `• ${b}`).join('\n')}`;
  return s;
}

// ========================================
// MARKETPLACE CARD PROMPTS
// ========================================

export const MARKETPLACE_PROMPTS = {

  'white-studio': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Professional commercial product photography of the product from the reference image. ${p}

The product is centered on a pure white seamless background (RGB 255,255,255). Soft, diffused studio lighting from upper-left with subtle fill light. Natural contact shadow beneath the product. The product fills 85% of the frame. Shot with an 85mm lens at f/8, ${PHOTO_TECH}. Minimalist composition, e-commerce ready, Amazon main image compliant. No text, no props, no graphics, no reflections — only the product.

${NEGATIVES}`
      : `Профессиональная коммерческая фотография товара с референсного изображения. ${p}

Товар по центру на чисто белом бесшовном фоне (RGB 255,255,255). Мягкий студийный свет сверху-слева с заполняющим светом. Естественная контактная тень. Товар занимает 85% кадра. Объектив 85мм, ${PHOTO_TECH}. Минималистичная композиция для маркетплейса. Без текста, без реквизита, без графики — только товар.

${NEGATIVES}`;
  },

  'minimal-clean': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a professional minimalist product listing card based on the product from the reference image. ${p}

COMPOSITION: Vertical 3:4 ratio product card. Upper 55%: the product displayed on a clean white (#F8F9FA) background, centered, with professional studio lighting and a subtle soft drop shadow. Lower 45%: text information block.

TYPOGRAPHY: Product name in bold geometric sans-serif font (Montserrat/Inter style), dark charcoal (#1A1A2E), large prominent size. Below: feature bullet points, each with a green circle checkmark icon, medium-weight font in muted gray (#4A4A5A). Generous spacing between elements (24px margins). A thin hairline divider between the photo zone and text zone.

STYLE: Apple Store product page aesthetic. Ultra-clean, generous white space, premium minimalism. ${PHOTO_TECH}.

${NEGATIVES}`
      : `Создай профессиональную минималистичную карточку товара для маркетплейса на основе товара с референсного изображения. ${p}

КОМПОЗИЦИЯ: Вертикальная карточка 3:4. Верхние 55%: товар на чистом белом фоне (#F8F9FA), по центру, профессиональный студийный свет, мягкая тень. Нижние 45%: текстовый блок.

ТИПОГРАФИКА: Название товара — жирный геометрический шрифт без засечек (стиль Montserrat/Inter), тёмный (#1A1A2E), крупный размер. Ниже: буллеты преимуществ, каждый с зелёной круглой галочкой, средний вес шрифта, серый (#4A4A5A). Щедрые отступы (24px). Тонкая разделительная линия между фото и текстом.

СТИЛЬ: Эстетика Apple Store. Ультра-чистый, много воздуха, премиальный минимализм. ${PHOTO_TECH}. Текст на РУССКОМ языке.

${NEGATIVES}`;
  },

  'gradient-modern': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a vibrant, high-impact product card for marketplace listing, based on the product from the reference image. ${p}

BACKGROUND: Rich diagonal gradient from deep violet (#4A00E0) through electric purple (#8E2DE2) to magenta-pink (#FF006E), 135 degrees. Add subtle decorative light streaks and geometric shapes for depth.

PRODUCT: The product is cleanly cut out from its original background and placed floating in the center-upper area (50% of the card). Add a dramatic drop shadow below and a subtle reflection/glow underneath. Professional studio-quality product rendering.

TITLE: Large bold uppercase text at the top — white color, geometric sans-serif (Montserrat Black style), with subtle text shadow for readability.

FEATURES: 3-4 bullet points in the lower area. Each bullet is placed inside a semi-transparent frosted glass pill shape (glassmorphism effect: white at 12% opacity with backdrop blur). Text is white with a small golden/amber arrow icon (▸) before each line.

STYLE: Premium tech brand launch aesthetic, Samsung Galaxy Unpacked / OnePlus reveal style. Vertical 3:4 ratio. ${PHOTO_TECH}.

${NEGATIVES}`
      : `Создай яркую, эффектную карточку товара для маркетплейса на основе товара с референсного изображения. ${p}

ФОН: Насыщенный диагональный градиент от глубокого фиолетового (#4A00E0) через электрик-пурпурный (#8E2DE2) к маджента-розовому (#FF006E), 135 градусов. Добавь лёгкие декоративные световые лучи и геометрические фигуры для глубины.

ТОВАР: Товар чисто вырезан из оригинального фона и парит в центре-верхней части (50% карточки). Драматичная тень снизу и лёгкое отражение/свечение. Профессиональная студийная обработка.

ЗАГОЛОВОК: Крупный жирный текст ЗАГЛАВНЫМИ сверху — белый цвет, геометрический шрифт без засечек (стиль Montserrat Black), с лёгкой текстовой тенью.

ПРЕИМУЩЕСТВА: 3-4 буллета в нижней части. Каждый буллет в полупрозрачной матовой стеклянной плашке (glassmorphism эффект: белый 12% прозрачность с блюром фона). Текст белый, перед каждой строкой маленькая золотая/янтарная стрелка (▸).

СТИЛЬ: Эстетика презентации Samsung Galaxy / OnePlus. Вертикальный формат 3:4. ${PHOTO_TECH}. Текст на РУССКОМ языке.

${NEGATIVES}`;
  },

  'dark-premium': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a luxury premium product card. Based on the product from the reference image. ${p}

BACKGROUND: Deep dark gradient from near-black (#0A0A1A) to dark navy (#1A1A2E). Subtle warm radial glow behind the product in champagne gold (#D4AF37 at 5% opacity). Fine gold dust particles or bokeh scattered in the background.

PRODUCT: Centered with dramatic rim lighting effect highlighting product edges. Slight golden glow outline around the product silhouette. Placed on a subtle reflective dark surface.

TITLE: Elegant champagne gold (#D4AF37) text. Thin uppercase letters with wide letter-spacing (tracking 200%). Serif or elegant sans-serif typeface.

FEATURES: Gold diamond icons (◆) followed by cream-white text (#F0E6D2). Elegant spacing. Small "PREMIUM" badge in top-right corner: thin gold border pill with small gold text.

STYLE: Luxury brand campaign — Chanel, Tom Ford, premium watches aesthetic. Vertical 3:4 ratio. ${PHOTO_TECH}, dramatic cinematic lighting.

${NEGATIVES}`
      : `Создай люксовую премиальную карточку товара. На основе товара с референсного изображения. ${p}

ФОН: Глубокий тёмный градиент от почти чёрного (#0A0A1A) к тёмному navy (#1A1A2E). Лёгкое тёплое радиальное свечение за товаром в шампань-золоте (#D4AF37 при 5% прозрачности). Мелкие золотые частицы или боке на фоне.

ТОВАР: По центру, драматичный контровой свет подчёркивает края. Лёгкий золотой контур-свечение. На тёмной отражающей поверхности.

ЗАГОЛОВОК: Элегантный шампань-золотой (#D4AF37) текст. Тонкие заглавные буквы с широким letter-spacing. Шрифт с засечками или элегантный без засечек.

ПРЕИМУЩЕСТВА: Золотые ромбы (◆), кремово-белый текст (#F0E6D2). Бейдж "PREMIUM" в правом верхнем углу: тонкая золотая pill-рамка.

СТИЛЬ: Люксовый бренд — Chanel, Tom Ford. Вертикальный 3:4. ${PHOTO_TECH}, кинематографический свет. Текст на РУССКОМ.

${NEGATIVES}`;
  },

  'neon-vibrant': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a cyberpunk neon product card. Based on the product from the reference image. ${p}

BACKGROUND: Very dark (#050510) with subtle hexagonal grid pattern. Neon glow accents in cyan and magenta.

PRODUCT: Centered, with a bright cyan (#00F5FF) neon outline glow effect tracing the product edges. Neon light reflections on the product surface.

TITLE: Electric cyan (#00F5FF) bold text with neon bloom/glow effect. Futuristic sans-serif typeface.

FEATURES: Magenta (#FF00FF) lightning bolt icons. White text with subtle cyan glow. Circuit board trace line decorations connecting features to the product.

STYLE: Gaming/tech — Razer, Cyberpunk 2077, TRON aesthetic. Neon lines, data streams, hexagonal elements. Vertical 3:4. ${PHOTO_TECH}.

${NEGATIVES}`
      : `Создай кибер-неон карточку товара. На основе товара с референсного изображения. ${p}

ФОН: Очень тёмный (#050510) с лёгким гексагональным паттерном. Неоновые акценты — циан и маджента.

ТОВАР: По центру, яркий голубой (#00F5FF) неоновый контур-свечение по краям товара. Неоновые отражения на поверхности товара.

ЗАГОЛОВОК: Электрик-голубой (#00F5FF) жирный текст с неоновым bloom-эффектом. Футуристичный шрифт.

ПРЕИМУЩЕСТВА: Маджента (#FF00FF) иконки-молнии. Белый текст с лёгким голубым свечением. Линии как на печатных платах.

СТИЛЬ: Гейминг/тех — Razer, Cyberpunk 2077, TRON. Вертикальный 3:4. ${PHOTO_TECH}. Текст на РУССКОМ.

${NEGATIVES}`;
  },

  'nature-organic': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create an eco-organic product card. Based on the product from the reference image. ${p}

BACKGROUND: Warm cream (#FFF8F0) with watercolor-style botanical illustrations (eucalyptus branches, herbs, leaves) as a subtle decorative border. Light kraft paper texture overlay.

PRODUCT: Centered on a light natural wooden or linen textured surface. Natural soft daylight, as if near a window. Warm tones.

TITLE: Earthy forest green (#2D5016) text, rounded friendly sans-serif typeface (like Nunito or Quicksand).

FEATURES: Sage green leaf/plant icons (🌿). Warm brown text (#5D4E37). "ECO" or "ORGANIC" rounded badge in top-left corner in sage green.

STYLE: Whole Foods, organic cosmetics, farm-to-table. Vertical 3:4. ${PHOTO_TECH}, warm natural color palette.

${NEGATIVES}`
      : `Создай эко-органик карточку товара. На основе товара с референсного изображения. ${p}

ФОН: Тёплый крем (#FFF8F0) с акварельными ботаническими иллюстрациями (эвкалипт, травы, листья) как декоративная рамка. Лёгкая текстура крафт-бумаги.

ТОВАР: По центру на светлой деревянной или льняной текстуре. Мягкий естественный дневной свет, как у окна.

ЗАГОЛОВОК: Лесной зелёный (#2D5016), округлый дружелюбный шрифт (стиль Nunito).

ПРЕИМУЩЕСТВА: Шалфейно-зелёные иконки листьев (🌿). Тёплый коричневый текст (#5D4E37). Бейдж "ЭКО" слева сверху в шалфейном зелёном.

СТИЛЬ: Органическая косметика, фермерский стиль. Вертикальный 3:4. ${PHOTO_TECH}. Текст на РУССКОМ.

${NEGATIVES}`;
  },

  'lifestyle-context': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a lifestyle editorial product photograph showing the product from the reference image in a real-life context. ${p}

Place the product naturally in an appropriate environment (modern home interior, kitchen counter, bathroom shelf, office desk, or outdoors — choose the most fitting for this product type). Warm, inviting natural lighting — golden hour window light feel. Shallow depth of field (f/2.8) — product is tack-sharp, background is softly blurred bokeh. Complementary styled props that enhance the scene. Minimal text: only a small elegant product name in the bottom corner, thin weight sans-serif.

${PHOTO_TECH}, 85mm lens, editorial magazine quality. West Elm catalog, Pinterest-worthy, aspirational lifestyle. Vertical 3:4.

${NEGATIVES}`
      : `Создай lifestyle-фото товара с референсного изображения в реальном контексте использования. ${p}

Размести товар естественно в подходящей среде (современный интерьер, кухня, ванная, офис — выбери подходящее). Тёплое естественное освещение — golden hour из окна. Малая глубина резкости (f/2.8) — товар резкий, фон мягко размыт. Дополнительные стилизованные предметы. Минимум текста — маленькое название в углу.

${PHOTO_TECH}, объектив 85мм, качество журнальной съёмки. Вертикальный 3:4.

${NEGATIVES}`;
  },

  'infographic-pro': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a professional product infographic card. Based on the product from the reference image. ${p}

LAYOUT: Vertical 3:4 ratio. The product is positioned center-left (taking 40% width), cleanly cut out with a professional shadow. On the right side and around the product: 4-5 infographic callout lines pointing from the product to feature descriptions.

CALLOUTS: Each callout consists of: a thin connecting line from the product → a small circular icon (modern line-art style in blue #3B82F6 or teal #14B8A6) → short text label in clean sans-serif.

HEADER: Bold dark (#1A1A2E) product name at the top. Clean modern sans-serif font.

FOOTER: A specs bar at the bottom with key numbers/dimensions displayed in rounded pill-shaped badges.

BACKGROUND: Light gray (#F4F5F7) or white. Clean, well-spaced, professional.

STYLE: Apple product page infographic, professional datasheet layout. ${PHOTO_TECH}.

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

  'amazon-a-plus': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return `Create an Amazon A+ Enhanced Brand Content module image. Based on the product from the reference image. ${p}

LAYOUT: Horizontal 16:9. Left 40%: product photo on white background with professional shadow. Right 60%: feature text block.

TYPOGRAPHY: Heading in bold serif font (Playfair Display style), dark navy (#1B2A4A). Body text in clean sans-serif, charcoal (#374151). 3-4 features with custom line-art icons in teal accent (#14B8A6).

STYLE: Corporate brand storytelling, trustworthy, professional. ${PHOTO_TECH}. English text only.

${NEGATIVES}`;
  },

  'comparison-split': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `Create a comparison product card. Based on the product from the reference image. ${p}

LAYOUT: Split down the middle — left 50% "WITHOUT" vs right 50% "WITH ${name}". Diagonal or vertical split line.

LEFT SIDE: Muted, desaturated, gray/red-tinted. Problem imagery. Red cross marks (✗). Dull, unappealing.

RIGHT SIDE: Vibrant, bright, green-tinted. The product prominently displayed. Green checkmarks (✓). Happy, solved, premium.

Bold comparison heading at top. Vertical 3:4. ${PHOTO_TECH}.

${NEGATIVES}`
      : `Создай карточку-сравнение товара. На основе товара с референсного изображения. ${p}

КОМПОНОВКА: Разделение пополам — лево 50% "БЕЗ" vs право 50% "С ${name}". Диагональная или вертикальная линия раздела.

ЛЕВАЯ СТОРОНА: Приглушённая, обесцвеченная, серо-красная. Проблема. Красные крестики (✗).

ПРАВАЯ СТОРОНА: Яркая, зелёная. Товар крупно. Зелёные галочки (✓). Решение.

Жирный заголовок сравнения сверху. Вертикальный 3:4. ${PHOTO_TECH}. Текст на РУССКОМ.

${NEGATIVES}`;
  },
};

// ========================================
// AD CREATIVE PROMPTS
// ========================================

export const AD_PROMPTS = {

  'ad-bold-sale': (name, headline, cta, lang) => lang === 'en'
    ? `Create a high-conversion sale advertisement creative. Product from the reference image.
Product: "${name}" | Headline: "${headline || 'UP TO 50% OFF'}" | CTA: "${cta || 'Shop Now'}"

BACKGROUND: Energetic diagonal gradient from hot red (#FF416C) to warm orange (#FF4B2B). Dynamic speed lines and confetti particles for energy.
PRODUCT: Left side (45%), floating with dramatic shadow, slightly rotated 5° for dynamism.
HEADLINE: HUGE bold white text (Montserrat Black), right side. Subtle black shadow for contrast.
PRICE: Circular starburst badge in yellow (#FFD700) with red discount text.
CTA: White pill-shaped button with red bold text, centered at bottom.
Square 1:1. ${PHOTO_TECH}. Black Friday energy aesthetic.
${NEGATIVES}`
    : `Создай продающий рекламный креатив для распродажи. Товар с референсного изображения.
Товар: "${name}" | Заголовок: "${headline || 'СКИДКА ДО 50%'}" | CTA: "${cta || 'Купить сейчас'}"

ФОН: Энергичный градиент от красного (#FF416C) к оранжевому (#FF4B2B). Линии скорости и конфетти.
ТОВАР: Слева (45%), парит с тенью, поворот 5°.
ЗАГОЛОВОК: ОГРОМНЫЙ жирный белый текст, справа.
ЦЕНА: Круглый бейдж-звёздочка жёлтый (#FFD700) с красным текстом скидки.
CTA: Белая pill-кнопка с красным текстом, снизу по центру.
Квадрат 1:1. ${PHOTO_TECH}. Текст на РУССКОМ.
${NEGATIVES}`,

  'ad-minimal-product': (name, headline, cta, lang) => lang === 'en'
    ? `Create a minimalist product advertisement. Product from the reference image.
Product: "${name}" | Headline: "${headline || name}" | CTA: "${cta || 'Learn More'}"

Pure white (#FAFAFA) background. Product centered, large (60%), precise soft shadow. Thin dark headline below. Dark rounded CTA button with white text at bottom. Massive whitespace. Square 1:1. ${PHOTO_TECH}. Apple/Braun "less is more" aesthetic.
${NEGATIVES}`
    : `Создай минималистичный рекламный креатив. Товар с референсного изображения.
Товар: "${name}" | Заголовок: "${headline || name}" | CTA: "${cta || 'Подробнее'}"

Чисто белый фон (#FAFAFA). Товар по центру, крупно (60%), мягкая тень. Тонкий тёмный заголовок снизу. Тёмная скруглённая CTA кнопка. Много воздуха. Квадрат 1:1. ${PHOTO_TECH}. Текст на РУССКОМ.
${NEGATIVES}`,

  'ad-dark-luxury': (name, headline, cta, lang) => lang === 'en'
    ? `Create a luxury dark advertisement. Product from the reference image.
Product: "${name}" | Headline: "${headline || name}" | CTA: "${cta || 'Discover'}"

Deep black (#0A0A0A) to dark navy background. Product center, dramatic side lighting, volumetric rays. Thin uppercase champagne gold (#D4AF37) headline, wide letter-spacing. Gold border pill CTA, no fill. Bokeh and gold dust. Square 1:1. ${PHOTO_TECH}, cinematic. Luxury watch/Bentley aesthetic.
${NEGATIVES}`
    : `Создай люксовый тёмный рекламный креатив. Товар с референсного изображения.
Товар: "${name}" | Заголовок: "${headline || name}" | CTA: "${cta || 'Узнать больше'}"

Глубокий чёрный (#0A0A0A) → тёмный navy фон. Товар по центру, драматичный свет. Тонкий КАПС шампань-золотой (#D4AF37) заголовок. CTA — золотая рамка. Боке и золотые частицы. Квадрат 1:1. ${PHOTO_TECH}. Текст на РУССКОМ.
${NEGATIVES}`,

  'ad-social-story': (name, headline, cta, lang) => lang === 'en'
    ? `Create a vertical social media story ad. Product from the reference image.
Product: "${name}" | Headline: "${headline || name}" | CTA: "${cta || 'Swipe Up'}"

Vibrant gradient: indigo (#6366F1) → violet (#A855F7) → pink (#EC4899). Product center with white glow halo. Bold large white headline. White pill CTA at bottom with swipe-up arrow ↑. Abstract blobs and sparkles. Vertical 9:16. ${PHOTO_TECH}. Instagram-native Gen-Z energy.
${NEGATIVES}`
    : `Создай вертикальный рекламный креатив для stories. Товар с референсного изображения.
Товар: "${name}" | Заголовок: "${headline || name}" | CTA: "${cta || 'Узнать'}"

Яркий градиент: индиго (#6366F1) → фиолетовый (#A855F7) → розовый (#EC4899). Товар по центру с белым гало. Крупный белый заголовок. Белая pill CTA снизу, стрелка ↑. Абстрактные формы и искры. Вертикальный 9:16. ${PHOTO_TECH}. Текст на РУССКОМ.
${NEGATIVES}`,

  'ad-google-banner': (name, headline, cta) => `Create a Google Display Network banner. Product from the reference image.
Product: "${name}" | Headline: "${headline || name}" | CTA: "${cta || 'Shop Now'}"

Horizontal 1200x628. Left 35%: product, clean cutout with shadow. Right 65%: bold headline + CTA button. White background with subtle accent stripe. Blue (#3B82F6) CTA button. Corporate, high CTR. ${PHOTO_TECH}. English text.
${NEGATIVES}`,

  'ad-retargeting': (name, headline, cta, lang) => lang === 'en'
    ? `Create a retargeting ad creative. Product from the reference image.
Product: "${name}" | Headline: "${headline || 'Still thinking about it?'}" | CTA: "${cta || 'Complete Purchase'}"

Warm white (#FFF9F5) background. Product large, centered, warm lighting. Friendly urgent headline. "Limited Stock" coral (#FF6B6B) pill badge. Bright CTA button. Timer/clock urgency element. Square 1:1. ${PHOTO_TECH}. Friendly nudge style.
${NEGATIVES}`
    : `Создай креатив для ретаргетинга. Товар с референсного изображения.
Товар: "${name}" | Заголовок: "${headline || 'Всё ещё думаете?'}" | CTA: "${cta || 'Оформить заказ'}"

Тёплый белый (#FFF9F5) фон. Товар крупно, тёплый свет. Дружелюбный срочный заголовок. Бейдж "Осталось мало" коралловый (#FF6B6B). Яркая CTA кнопка. Таймер/часы. Квадрат 1:1. ${PHOTO_TECH}. Текст на РУССКОМ.
${NEGATIVES}`,
};
