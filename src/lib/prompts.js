/**
 * AI Image Generation Prompts — Professional Quality
 * Inspired by top marketplace card designs (Aidentika-level quality)
 */

const SYSTEM_PREFIX = `You are a world-class e-commerce product card designer. You create stunning, conversion-optimized product listing images that look like they were made by a professional design agency. Your designs feature:
- Clean, modern typography (Montserrat, Gilroy, SF Pro style — geometric sans-serif)
- Professional color palettes with harmonious accent colors
- Balanced compositions with clear visual hierarchy
- High-end product photography aesthetics
- Pixel-perfect alignment and spacing
IMPORTANT: Generate the COMPLETE card as a single polished image. The product photo provided is your reference — enhance it, place it beautifully, but keep the product recognizable.`;

function fmt(name, bullets) {
  let s = `Product: "${name}"`;
  if (bullets?.length) s += `\nKey selling points:\n${bullets.map(b => `• ${b}`).join('\n')}`;
  return s;
}

// ========================================
// MARKETPLACE CARD PROMPTS
// ========================================

export const MARKETPLACE_PROMPTS = {
  'white-studio': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a premium STUDIO PRODUCT PHOTO for Amazon/eBay main listing image.\n${p}\n\nStrict requirements:\n- Pure white (#FFFFFF) background — Amazon-compliant\n- Product fills 85% of frame, centered\n- Professional studio lighting: soft key light from upper-left, subtle fill light\n- Natural contact shadow on surface (not floating)\n- Crisp focus, commercial photography quality\n- NO text, NO graphics, NO badges — pure product only\n- Square 1:1 format, high-resolution look\n- The product should look premium, aspirational, and trustworthy`
      : `${SYSTEM_PREFIX}\n\nСоздай СТУДИЙНОЕ ФОТО товара для главного изображения маркетплейса.\n${p}\n\nТребования:\n- Чисто белый фон (#FFFFFF)\n- Товар занимает 85% кадра, по центру\n- Профессиональный студийный свет: мягкий ключевой свет сверху-слева\n- Естественная контактная тень (не парящий)\n- Резкий фокус, качество коммерческой фотографии\n- БЕЗ текста, БЕЗ графики — только товар\n- Квадрат 1:1`;
  },

  'minimal-clean': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a MINIMALIST PRODUCT CARD for e-commerce marketplace.\n${p}\n\nDesign specifications:\n- Background: clean white or very light gray (#F8F9FA)\n- Layout: product photo takes upper 55% of card, text block in lower 45%\n- Product: centered, with subtle soft shadow, professional lighting\n- Title: bold geometric sans-serif font (like Montserrat Bold), dark charcoal (#1A1A2E), 28-36pt\n- Bullet points: each on its own line with a rounded green checkmark icon (✓) in a small circle, medium weight font, gray (#4A4A5A)\n- Spacing: generous whitespace between elements, 24px margins\n- Optional: thin accent line or subtle divider between product and text\n- Vertical 3:4 ratio\n- Feel: Apple-store clean, Muji-inspired minimalism`
      : `${SYSTEM_PREFIX}\n\nСоздай МИНИМАЛИСТИЧНУЮ КАРТОЧКУ ТОВАРА для маркетплейса (Wildberries/Ozon).\n${p}\n\nСпецификация дизайна:\n- Фон: чистый белый или очень светлый серый (#F8F9FA)\n- Компоновка: фото товара в верхних 55%, текстовый блок в нижних 45%\n- Товар: по центру, мягкая тень, профессиональное освещение\n- Заголовок: жирный геометрический шрифт без засечек (стиль Montserrat Bold), тёмный (#1A1A2E), крупный\n- Буллеты: каждый на своей строке, зелёная галочка в круге (✓), средний вес шрифта, серый (#4A4A5A)\n- Отступы: щедрые, 24px по краям\n- Тонкая акцентная линия между фото и текстом\n- Вертикальный формат 3:4\n- Текст на РУССКОМ языке\n- Ощущение: чистота Apple Store, минимализм Muji`;
  },

  'gradient-modern': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a VIBRANT GRADIENT PRODUCT CARD for marketplace.\n${p}\n\nDesign specifications:\n- Background: rich gradient from deep violet (#4A00E0) through electric purple (#8E2DE2) to magenta (#FF006E), diagonal 135°\n- Product: centered in upper-middle area (50% of card), floating with dramatic drop shadow and subtle glow reflection\n- Remove or clean up product background — product should float on the gradient\n- Title: bold uppercase white text, geometric sans-serif (Montserrat/Gilroy style), large size with subtle text shadow\n- Bullets: white text with custom golden arrow icons (▸), each bullet in a semi-transparent white frosted glass pill/badge (glassmorphism style, 10% white opacity with blur)\n- Optional: subtle geometric shapes or light streaks in background for depth\n- Vertical 3:4 ratio\n- Feel: premium tech brand, Samsung/OnePlus product launch style`
      : `${SYSTEM_PREFIX}\n\nСоздай ЯРКУЮ ГРАДИЕНТНУЮ КАРТОЧКУ ТОВАРА для маркетплейса.\n${p}\n\nСпецификация дизайна:\n- Фон: насыщенный градиент от глубокого фиолетового (#4A00E0) через электрик-пурпурный (#8E2DE2) к маджента (#FF006E), диагональ 135°\n- Товар: по центру в верхней-средней части (50% карточки), парит с драматичной тенью и лёгким отражением-свечением\n- Убрать фон товара — он должен парить на градиенте\n- Заголовок: жирный белый КАПС, геометрический шрифт (стиль Montserrat/Gilroy), крупный, с лёгкой тенью текста\n- Буллеты: белый текст с золотыми стрелками (▸), каждый буллет в полупрозрачной матовой стеклянной плашке (glassmorphism, 10% белый с блюром)\n- Лёгкие геометрические фигуры или световые лучи на фоне для глубины\n- Вертикальный 3:4\n- Текст на РУССКОМ\n- Ощущение: премиум-техно бренд, стиль презентации Samsung/OnePlus`;
  },

  'dark-premium': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a LUXURY DARK PREMIUM product card.\n${p}\n\nDesign:\n- Background: deep dark gradient from #0A0A1A to #1A1A2E, with subtle radial glow behind product in warm gold (#D4AF37, 5% opacity)\n- Product: center, dramatic rim lighting effect, slight golden glow outline\n- Title: elegant champagne/gold (#D4AF37) text, thin uppercase with wide letter-spacing, serif or elegant sans-serif\n- Bullets: gold diamond icons (◆), cream white text (#F0E6D2), spaced elegantly\n- Badge: "PREMIUM" in top-right, gold border pill with thin gold text\n- Subtle gold dust particles or bokeh in background\n- Vertical 3:4\n- Feel: luxury brand — Chanel, Tom Ford, premium watches aesthetic`
      : `${SYSTEM_PREFIX}\n\nСоздай ЛЮКСОВУЮ ТЁМНУЮ ПРЕМИУМ карточку товара.\n${p}\n\nДизайн:\n- Фон: глубокий тёмный градиент от #0A0A1A к #1A1A2E, лёгкое радиальное свечение за товаром в тёплом золоте (#D4AF37, 5% прозрачность)\n- Товар: по центру, драматичный контровой свет, лёгкий золотой контур-свечение\n- Заголовок: элегантный шампань/золотой (#D4AF37) текст, тонкий КАПС с широким letter-spacing\n- Буллеты: золотые ромбы (◆), кремово-белый текст (#F0E6D2)\n- Бейдж: "PREMIUM" справа сверху, золотая рамка с тонким золотым текстом\n- Лёгкие золотые частицы или боке на фоне\n- Вертикальный 3:4, текст на РУССКОМ\n- Ощущение: люкс-бренд — Chanel, Tom Ford`;
  },

  'neon-vibrant': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a CYBERPUNK NEON product card.\n${p}\n\nDesign:\n- Background: very dark (#050510) with subtle grid pattern, neon glow accents\n- Product: center, with cyan (#00F5FF) neon outline glow effect around edges\n- Title: electric cyan (#00F5FF) bold text with neon glow/bloom effect\n- Bullets: magenta (#FF00FF) lightning bolt icons, white text with subtle glow\n- Decorative: neon lines, circuit patterns, hexagonal grid elements\n- Color palette: cyan, magenta, electric purple accents on dark\n- Vertical 3:4\n- Feel: gaming peripherals, tech gadgets, Razer/Cyberpunk 2077 aesthetic`
      : `${SYSTEM_PREFIX}\n\nСоздай КИБЕР-НЕОН карточку товара.\n${p}\n\nДизайн:\n- Фон: очень тёмный (#050510) с лёгкой сеткой, неоновые акценты\n- Товар: по центру, голубой (#00F5FF) неоновый контур-свечение по краям\n- Заголовок: электрик-голубой (#00F5FF) жирный текст с неоновым bloom-эффектом\n- Буллеты: маджента (#FF00FF) иконки-молнии, белый текст с лёгким свечением\n- Декор: неоновые линии, паттерны схем, гексагональная сетка\n- Вертикальный 3:4, текст на РУССКОМ\n- Ощущение: гейминг, Razer, Cyberpunk 2077`;
  },

  'nature-organic': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate an ECO/ORGANIC product card.\n${p}\n\nDesign:\n- Background: warm natural palette — cream (#FFF8F0) with watercolor-style botanical illustrations (eucalyptus leaves, herbs) as subtle decorative border\n- Product: center, natural lighting, on a light wooden or linen textured surface\n- Title: earthy forest green (#2D5016) text, rounded friendly sans-serif font\n- Bullets: leaf/plant icons (🌿) in sage green, warm brown text (#5D4E37)\n- Badge: "ECO" or "ORGANIC" in top-left, sage green rounded badge with leaf icon\n- Subtle paper/kraft texture overlay\n- Vertical 3:4\n- Feel: Whole Foods, organic cosmetics, farm-to-table aesthetic`
      : `${SYSTEM_PREFIX}\n\nСоздай ЭКО/ОРГАНИК карточку товара.\n${p}\n\nДизайн:\n- Фон: тёплая натуральная палитра — крем (#FFF8F0) с акварельными ботаническими иллюстрациями (эвкалипт, травы) как декоративная рамка\n- Товар: по центру, естественный свет, на светлой деревянной или льняной текстуре\n- Заголовок: лесной зелёный (#2D5016), округлый дружелюбный шрифт\n- Буллеты: иконки листьев (🌿) в шалфейном зелёном, тёплый коричневый текст (#5D4E37)\n- Бейдж: "ЭКО" слева сверху, зелёный округлый бейдж с листиком\n- Лёгкая текстура крафт-бумаги\n- Вертикальный 3:4, текст на РУССКОМ\n- Ощущение: органическая косметика, фермерский стиль`;
  },

  'lifestyle-context': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a LIFESTYLE product photo showing this product in real-life use.\n${p}\n\nDesign:\n- Show product naturally placed in an appropriate environment (home interior, kitchen, bathroom, office, outdoors — choose the most fitting)\n- Warm, inviting natural lighting (golden hour feel)\n- Shallow depth of field — product sharp, background softly blurred\n- Complementary props that enhance the scene without distracting\n- Minimal text: small elegant product name in corner, thin weight\n- Editorial/magazine photography quality\n- Vertical 3:4 or square 1:1\n- Feel: West Elm catalog, Pinterest-worthy, aspirational lifestyle`
      : `${SYSTEM_PREFIX}\n\nСоздай LIFESTYLE фото товара в реальном контексте использования.\n${p}\n\nДизайн:\n- Товар естественно размещён в подходящей среде (дом, кухня, ванная, офис — выбери наиболее подходящее)\n- Тёплое, уютное естественное освещение (golden hour)\n- Малая глубина резкости — товар резкий, фон мягко размыт\n- Дополнительные предметы, усиливающие сцену\n- Минимум текста: маленькое элегантное название в углу\n- Качество журнальной фотографии\n- Вертикальный 3:4`;
  },

  'infographic-pro': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a PROFESSIONAL INFOGRAPHIC product card.\n${p}\n\nDesign:\n- Background: light gray (#F4F5F7) or white\n- Product: center-left (40% of card width), clean cutout with shadow\n- Around the product: 4-5 infographic callout lines pointing to product features\n- Each callout: thin line from product → small circular icon → short text label\n- Icons: modern line-art style in accent color (blue #3B82F6 or teal #14B8A6)\n- Title: bold dark text at top, clean sans-serif\n- Bottom: specs bar with key dimensions/numbers in pill badges\n- Typography: clean, modern, well-spaced\n- Vertical 3:4\n- Feel: professional product datasheet, Apple product page infographic`
      : `${SYSTEM_PREFIX}\n\nСоздай ПРОФЕССИОНАЛЬНУЮ ИНФОГРАФИКУ для карточки товара.\n${p}\n\nДизайн:\n- Фон: светло-серый (#F4F5F7) или белый\n- Товар: по центру-слева (40% ширины карточки), чистый вырез с тенью\n- Вокруг товара: 4-5 линий-выносок к характеристикам\n- Каждая выноска: тонкая линия от товара → маленькая круглая иконка → короткий текст\n- Иконки: современный линейный стиль в акцентном цвете (синий #3B82F6 или бирюзовый #14B8A6)\n- Заголовок: жирный тёмный текст сверху\n- Внизу: панель с ключевыми характеристиками в pill-бейджах\n- Вертикальный 3:4, текст на РУССКОМ\n- Ощущение: Apple product page, профессиональный datasheet`;
  },

  'amazon-a-plus': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return `${SYSTEM_PREFIX}\n\nCreate an AMAZON A+ ENHANCED BRAND CONTENT module image.\n${p}\n\nDesign:\n- Horizontal layout 16:9 or 3:2 ratio\n- Left 40%: product photo on white/light background with subtle shadow\n- Right 60%: feature text block\n- Heading: bold serif font (Playfair Display style), dark navy (#1B2A4A)\n- Body: clean sans-serif, charcoal (#374151)\n- 3-4 features with custom line-art icons in brand accent color\n- Thin accent line or brand color bar on left edge\n- Clean, corporate, trustworthy brand storytelling feel\n- English text only`;
  },

  'comparison-split': (name, bullets, lang) => {
    const p = fmt(name, bullets);
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a COMPARISON/BEFORE-AFTER product card.\n${p}\n\nDesign:\n- Split layout: left 50% = "WITHOUT" (muted, desaturated, red-tinted), right 50% = "WITH ${name}" (vibrant, bright, green-tinted)\n- Diagonal or clean vertical split line\n- Left side: sad/problem imagery, red ✗ marks\n- Right side: product prominently shown, green ✓ marks, happy/solved\n- Bold comparison text at top\n- Vertical 3:4 or square 1:1`
      : `${SYSTEM_PREFIX}\n\nСоздай КАРТОЧКУ-СРАВНЕНИЕ товара.\n${p}\n\nДизайн:\n- Разделённый layout: лево 50% = "БЕЗ" (приглушённый, серый, красноватый), право 50% = "С ${name}" (яркий, зелёный)\n- Диагональная или вертикальная линия разделения\n- Слева: проблема, красные крестики ✗\n- Справа: товар крупно, зелёные галочки ✓, решение\n- Жирный текст сравнения сверху\n- Вертикальный 3:4, текст на РУССКОМ`;
  },
};

// ========================================
// AD CREATIVE PROMPTS
// ========================================

export const AD_PROMPTS = {
  'ad-bold-sale': (name, headline, cta, lang) => {
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a HIGH-CONVERTING SALE advertising creative.\nProduct: "${name}"\nHeadline: "${headline || 'UP TO 50% OFF'}"\nCTA: "${cta || 'Shop Now'}"\n\nDesign:\n- Background: energetic gradient from hot red (#FF416C) to warm orange (#FF4B2B)\n- Product: left side (45%), floating with dynamic shadow, slightly rotated 5°\n- Headline: HUGE bold white text (Montserrat Black), right side, with subtle black shadow for contrast\n- Price badge: circular or starburst shape, yellow (#FFD700) with red text, shows discount\n- CTA button: white pill-shaped button with red text, bold, centered bottom\n- Dynamic elements: speed lines, confetti particles, or geometric shapes for energy\n- Square 1:1 format\n- Feel: Black Friday energy, Shopify flash sale, high urgency`
      : `${SYSTEM_PREFIX}\n\nСоздай ПРОДАЮЩИЙ рекламный креатив для РАСПРОДАЖИ.\nТовар: "${name}"\nЗаголовок: "${headline || 'СКИДКА ДО 50%'}"\nCTA: "${cta || 'Купить сейчас'}"\n\nДизайн:\n- Фон: энергичный градиент от красного (#FF416C) к оранжевому (#FF4B2B)\n- Товар: слева (45%), парит с динамичной тенью, лёгкий поворот 5°\n- Заголовок: ОГРОМНЫЙ жирный белый текст (Montserrat Black), справа\n- Ценовой бейдж: круглый или звёздочка, жёлтый (#FFD700) с красным текстом скидки\n- CTA кнопка: белая pill-кнопка с красным текстом, жирная, снизу по центру\n- Динамика: линии скорости, конфетти, геометрические фигуры\n- Квадрат 1:1, текст на РУССКОМ\n- Ощущение: энергия Black Friday, срочность`;
  },

  'ad-minimal-product': (name, headline, cta, lang) => {
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a MINIMALIST product advertising creative.\nProduct: "${name}"\nHeadline: "${headline || name}"\nCTA: "${cta || 'Learn More'}"\n\nDesign:\n- Background: pure white or very light gray (#FAFAFA)\n- Product: centered, large (60% of frame), with precise soft shadow\n- Headline: thin dark text below product, clean sans-serif, charcoal (#1A1A2E)\n- CTA: dark rounded rectangle button, white text, subtle hover state implied\n- Massive whitespace — breathing room everywhere\n- Square 1:1\n- Feel: Apple product page, Braun, Dieter Rams "less is more"`
      : `${SYSTEM_PREFIX}\n\nСоздай МИНИМАЛИСТИЧНЫЙ рекламный креатив.\nТовар: "${name}"\nЗаголовок: "${headline || name}"\nCTA: "${cta || 'Подробнее'}"\n\nДизайн:\n- Фон: чисто белый или очень светлый серый (#FAFAFA)\n- Товар: по центру, крупно (60%), с точной мягкой тенью\n- Заголовок: тонкий тёмный текст под товаром, чистый sans-serif\n- CTA: тёмная скруглённая кнопка, белый текст\n- Много воздуха\n- Квадрат 1:1, текст на РУССКОМ\n- Ощущение: Apple, Braun, "less is more"`;
  },

  'ad-dark-luxury': (name, headline, cta, lang) => {
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a LUXURY DARK advertising creative.\nProduct: "${name}"\nHeadline: "${headline || name}"\nCTA: "${cta || 'Discover'}"\n\nDesign:\n- Background: deep black (#0A0A0A) to dark navy (#0F1628)\n- Product: center, dramatic side lighting, volumetric light rays\n- Headline: thin uppercase champagne gold (#D4AF37), wide letter-spacing (200%)\n- CTA: gold (#D4AF37) border pill, no fill, thin uppercase text\n- Subtle bokeh or gold dust particles\n- Square 1:1\n- Feel: luxury watch ad, Bentley, Dom Pérignon`
      : `${SYSTEM_PREFIX}\n\nСоздай ЛЮКСОВЫЙ ТЁМНЫЙ рекламный креатив.\nТовар: "${name}"\nЗаголовок: "${headline || name}"\nCTA: "${cta || 'Узнать больше'}"\n\nДизайн:\n- Фон: глубокий чёрный (#0A0A0A) в тёмный navy (#0F1628)\n- Товар: по центру, драматичный боковой свет\n- Заголовок: тонкий КАПС шампань-золотой (#D4AF37), широкий letter-spacing\n- CTA: золотая рамка pill, без заливки, тонкий КАПС текст\n- Лёгкое боке или золотые частицы\n- Квадрат 1:1, текст на РУССКОМ`;
  },

  'ad-social-story': (name, headline, cta, lang) => {
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a SOCIAL MEDIA STORY advertising creative.\nProduct: "${name}"\nHeadline: "${headline || name}"\nCTA: "${cta || 'Swipe Up'}"\n\nDesign:\n- Background: vibrant gradient indigo (#6366F1) to violet (#A855F7) to pink (#EC4899)\n- Product: center area, with white glow halo behind\n- Headline: bold white text, large, Montserrat style, with subtle drop shadow\n- CTA: white rounded pill button at bottom with dark text, swipe-up arrow ↑ above it\n- Decorative: abstract blob shapes, floating circles, sparkle elements\n- Vertical 9:16 story format\n- Feel: Instagram-native, Gen-Z appeal, vibrant energy`
      : `${SYSTEM_PREFIX}\n\nСоздай ВЕРТИКАЛЬНЫЙ рекламный креатив для STORIES.\nТовар: "${name}"\nЗаголовок: "${headline || name}"\nCTA: "${cta || 'Узнать'}"\n\nДизайн:\n- Фон: яркий градиент индиго (#6366F1) → фиолетовый (#A855F7) → розовый (#EC4899)\n- Товар: по центру, белое гало-свечение за ним\n- Заголовок: жирный белый текст, крупный, с тенью\n- CTA: белая pill-кнопка снизу с тёмным текстом, стрелка ↑ над ней\n- Декор: абстрактные blob-формы, летающие круги, искры\n- Вертикальный 9:16, текст на РУССКОМ`;
  },

  'ad-google-banner': (name, headline, cta, lang) => {
    return `${SYSTEM_PREFIX}\n\nCreate a GOOGLE DISPLAY NETWORK banner ad.\nProduct: "${name}"\nHeadline: "${headline || name}"\nCTA: "${cta || 'Shop Now'}"\n\nDesign:\n- Horizontal 1200x628 banner format\n- Left 35%: product photo, clean cutout with shadow\n- Right 65%: headline in bold sans-serif + CTA button\n- Background: white or light with subtle brand-color accent stripe\n- CTA: rounded button in accent color (blue #3B82F6), white text\n- Clean, corporate, high CTR optimized\n- English text`;
  },

  'ad-retargeting': (name, headline, cta, lang) => {
    return lang === 'en'
      ? `${SYSTEM_PREFIX}\n\nCreate a RETARGETING advertising creative.\nProduct: "${name}"\nHeadline: "${headline || 'Still thinking about it?'}"\nCTA: "${cta || 'Complete Purchase'}"\n\nDesign:\n- Background: warm white (#FFF9F5) with subtle urgency elements\n- Product: large, center, with soft warm lighting\n- Headline: friendly but urgent dark text, medium weight\n- Urgency badge: "Limited Stock" or "X% off today only" in coral/red (#FF6B6B) pill\n- CTA: bright accent button (coral #FF6B6B or green #10B981)\n- Timer icon or clock element suggesting urgency\n- Square 1:1\n- Feel: friendly nudge, not aggressive — Casper/Warby Parker retargeting style`
      : `${SYSTEM_PREFIX}\n\nСоздай креатив для РЕТАРГЕТИНГА.\nТовар: "${name}"\nЗаголовок: "${headline || 'Всё ещё думаете?'}"\nCTA: "${cta || 'Оформить заказ'}"\n\nДизайн:\n- Фон: тёплый белый (#FFF9F5) с элементами срочности\n- Товар: крупно, по центру, тёплый свет\n- Заголовок: дружелюбный но срочный тёмный текст\n- Бейдж срочности: "Осталось мало" в коралловом (#FF6B6B) pill\n- CTA: яркая кнопка (коралл или зелёный)\n- Иконка таймера/часов\n- Квадрат 1:1, текст на РУССКОМ`;
  },
};
