// ========================================
// Internationalization — translation dictionaries
// Russian is the default language (served at /)
// English is served at /en
// ========================================

export const LANGS = {
  ru: {
    code: 'ru',
    label: 'Русский',
    flag: '🇷🇺',
    switchUrl: '/',
    // Header
    nav: { examples: 'Примеры', features: 'Возможности', pricing: 'Тарифы' },
    startBtn: 'Начать генерацию',

    // Hero
    heroLabel: 'AI-генератор для маркетплейсов',
    heroTitle1: 'Создавайте',
    heroTitle3: 'за секунды',
    heroDesc: 'Загрузите фото товара — получите профессиональные креативы.',
    heroCta: 'Начать генерацию',
    heroGhost: 'Смотреть примеры',
    heroScroll: 'Скрольте',
    typewriterWords: ['карточки товаров', 'lifestyle-фото', 'рекламные баннеры'],

    // Float cards
    floatCards: [
      { label: 'Одежда', before: 'Загрузил', after: 'Получил' },
      { label: 'Косметика', before: 'Загрузил', after: 'Получил' },
      { label: 'Гаджеты', before: 'Загрузил', after: 'Получил' },
    ],

    // Showcase
    showcaseLabel: 'Примеры',
    showcaseTitle: 'Загрузил — получил',
    showcaseDesc: 'Одно фото товара превращается в продающий креатив',
    showcaseCards: [
      { label: 'Одежда', type: 'Фото', before: 'Фото с телефона', after: 'На модели — lifestyle' },
      { label: 'Косметика', type: 'Фото', before: 'Продукт на столе', after: 'Премиум съёмка' },
      { label: 'Гаджеты', type: 'Карточка', before: 'Фото из каталога', after: 'Карточка WB' },
      { label: 'Еда', type: 'Реклама', before: 'Снимок блюда', after: 'Рекламный баннер' },
      { label: 'Аксессуары', type: 'Фото', before: 'Фото на белом', after: 'Flat lay композиция' },
      { label: 'Дом и сад', type: 'Карточка', before: 'Простое фото', after: 'Инфографика Ozon' },
    ],
    uploaded: 'Загрузил',
    received: 'Получил',

    // Features
    featuresLabel: 'Возможности',
    featuresTitle: 'Всё для продаж на маркетплейсах',
    featuresList: [
      { title: '8 категорий', desc: 'Одежда, косметика, гаджеты, еда, дом, аксессуары и другие', num: '8' },
      { title: '30+ концепций', desc: 'На модели, в интерьере, flat lay, крупный план, каталог', num: '30+' },
      { title: '3 рекламных формата', desc: 'Распродажа, минимализм, stories — готовые к запуску', num: '3' },
      { title: '5 форматов', desc: '9:16, 3:4, 1:1, 4:3, 16:9 — все площадки', num: '5' },
      { title: 'AI-улучшения', desc: 'Напишите что изменить — AI перегенерирует', num: 'V2' },
      { title: 'История', desc: 'Все генерации сохраняются с версиями', num: 'Vn' },
    ],

    // How it works
    howLabel: 'Процесс',
    howTitle: 'Четыре шага до результата',
    howSteps: [
      { n: '01', title: 'Загрузите фото', desc: 'Любое фото товара — с телефона или каталога' },
      { n: '02', title: 'Настройте', desc: 'Категория, концепция, формат — на одном экране' },
      { n: '03', title: 'Генерируйте', desc: 'AI создаст изображение за 30 секунд' },
      { n: '04', title: 'Улучшайте', desc: 'Допишите пожелание — AI доработает' },
    ],

    // Pricing
    pricingLabel: 'Тарифы',
    pricingTitle: 'Прозрачные цены',
    pricingMarquee: '1 бесплатная генерация при регистрации',
    pricingMarquee2: 'Попробуйте AI-генерацию карточек бесплатно',
    currency: '₽',
    plans: [
      { id: 'lite', name: 'Лайт', price: 390, desc: 'Для пробы сервиса', feat: ['10 генераций', 'Все концепции', 'Все форматы'], cta: 'Выбрать' },
      { id: 'standard', name: 'Стандарт', price: 990, desc: 'Для серии товаров', feat: ['30 генераций', 'Все возможности', 'Рекламные форматы', 'Улучшения'], cta: 'Выбрать', hl: true, badge: 'Популярный' },
      { id: 'pro', name: 'Про', price: 2490, desc: 'Оптимальный выбор', feat: ['80 генераций', 'Всё включено', 'История версий', 'Приоритет'], cta: 'Выбрать' },
      { id: 'business', name: 'Бизнес', price: 4990, desc: 'Максимум возможностей', feat: ['200 генераций', 'API доступ', 'Мульти-юзеры', 'Brand Kit'], cta: 'Выбрать' },
    ],

    // Footer
    footerDesc: 'AI-генератор карточек товара и рекламных креативов',
    footerContact: 'Связь:',
    footerProduct: 'Продукт',
    footerLegal: 'Юридическое',
    footerPrivacy: 'Политика конфиденциальности',
    footerTerms: 'Публичная оферта',
    footerCopy: '© {year} Adgena — Самозанятый Орлов Денис Эдуардович, ИНН 665903565502',
    footerPayment: 'Оплата производится через сервис Робокасса.',
    footerTermsLink: 'Условия использования',
    footerPrivacyLink: 'Конфиденциальность',

    // Auth page
    auth: {
      loginTitle: 'Вход',
      registerTitle: 'Регистрация',
      email: 'Email',
      password: 'Пароль',
      name: 'Имя',
      confirmPassword: 'Подтвердите пароль',
      code: 'Код из письма',
      loginBtn: 'Войти',
      registerBtn: 'Создать аккаунт',
      sendCode: 'Отправить код',
      noAccount: 'Нет аккаунта?',
      hasAccount: 'Уже есть аккаунт?',
      register: 'Зарегистрироваться',
      login: 'Войти',
      orWith: 'или с помощью',
      checkEmail: 'Код отправлен на ваш email',
      googleBtn: 'Google',
      yandexBtn: 'Яндекс',
    },

    // Checkout page
    checkout: {
      title: 'Оформление подписки',
      plan: 'Тариф',
      price: 'Стоимость',
      perMonth: '/ мес',
      generations: 'генераций',
      agree: 'Я согласен с',
      terms: 'условиями оферты',
      and: 'и',
      privacy: 'политикой конфиденциальности',
      recurring: 'Платёж рекуррентный: автопродление каждые 30 дней',
      payBtn: 'Оплатить',
      processing: 'Переход к оплате...',
      notFound: 'Тариф не найден',
      choosePlan: 'Выберите тариф на',
      mainPage: 'главной странице',
      checkingAuth: 'Проверка авторизации...',
    },
  },

  en: {
    code: 'en',
    label: 'English',
    flag: '🇺🇸',
    switchUrl: '/en',
    // Header
    nav: { examples: 'Examples', features: 'Features', pricing: 'Pricing' },
    startBtn: 'Start generating',

    // Hero
    heroLabel: 'AI generator for marketplaces',
    heroTitle1: 'Create',
    heroTitle3: 'in seconds',
    heroDesc: 'Upload a product photo — get professional creatives.',
    heroCta: 'Start generating',
    heroGhost: 'See examples',
    heroScroll: 'Scroll',
    typewriterWords: ['product listings', 'lifestyle photos', 'ad banners'],

    // Float cards
    floatCards: [
      { label: 'Clothing', before: 'Uploaded', after: 'Result' },
      { label: 'Cosmetics', before: 'Uploaded', after: 'Result' },
      { label: 'Gadgets', before: 'Uploaded', after: 'Result' },
    ],

    // Showcase
    showcaseLabel: 'Examples',
    showcaseTitle: 'Upload — Get Result',
    showcaseDesc: 'One product photo turns into a selling creative',
    showcaseCards: [
      { label: 'Clothing', type: 'Photo', before: 'Phone photo', after: 'On model — lifestyle' },
      { label: 'Cosmetics', type: 'Photo', before: 'Product on table', after: 'Premium shoot' },
      { label: 'Gadgets', type: 'Listing', before: 'Catalog photo', after: 'Marketplace card' },
      { label: 'Food', type: 'Ad', before: 'Dish snapshot', after: 'Ad banner' },
      { label: 'Accessories', type: 'Photo', before: 'White background', after: 'Flat lay composition' },
      { label: 'Home & Garden', type: 'Listing', before: 'Simple photo', after: 'Infographic card' },
    ],
    uploaded: 'Uploaded',
    received: 'Result',

    // Features
    featuresLabel: 'Features',
    featuresTitle: 'Everything for marketplace sales',
    featuresList: [
      { title: '8 categories', desc: 'Clothing, cosmetics, gadgets, food, home, accessories & more', num: '8' },
      { title: '30+ concepts', desc: 'On model, interior, flat lay, close-up, catalog', num: '30+' },
      { title: '3 ad formats', desc: 'Sale, minimal, stories — ready to launch', num: '3' },
      { title: '5 aspect ratios', desc: '9:16, 3:4, 1:1, 4:3, 16:9 — all platforms', num: '5' },
      { title: 'AI improvements', desc: 'Describe changes — AI regenerates', num: 'V2' },
      { title: 'History', desc: 'All generations saved with versions', num: 'Vn' },
    ],

    // How it works
    howLabel: 'Process',
    howTitle: 'Four steps to the result',
    howSteps: [
      { n: '01', title: 'Upload photo', desc: 'Any product photo — from phone or catalog' },
      { n: '02', title: 'Configure', desc: 'Category, concept, format — on one screen' },
      { n: '03', title: 'Generate', desc: 'AI creates the image in 30 seconds' },
      { n: '04', title: 'Improve', desc: 'Add a wish — AI refines it' },
    ],

    // Pricing
    pricingLabel: 'Pricing',
    pricingTitle: 'Transparent pricing',
    pricingMarquee: '1 free generation on signup',
    pricingMarquee2: 'Try AI product card generation for free',
    currency: '$',
    plans: [
      { id: 'lite', name: 'Lite', price: 4.5, desc: 'Try the service', feat: ['10 generations', 'All concepts', 'All formats'], cta: 'Choose' },
      { id: 'standard', name: 'Standard', price: 11.5, desc: 'For a product line', feat: ['30 generations', 'All features', 'Ad formats', 'Improvements'], cta: 'Choose', hl: true, badge: 'Popular' },
      { id: 'pro', name: 'Pro', price: 29, desc: 'Optimal choice', feat: ['80 generations', 'Everything included', 'Version history', 'Priority'], cta: 'Choose' },
      { id: 'business', name: 'Business', price: 58, desc: 'Maximum power', feat: ['200 generations', 'API access', 'Multi-users', 'Brand Kit'], cta: 'Choose' },
    ],

    // Footer
    footerDesc: 'AI product card & ad creative generator',
    footerContact: 'Contact:',
    footerProduct: 'Product',
    footerLegal: 'Legal',
    footerPrivacy: 'Privacy Policy',
    footerTerms: 'Terms of Service',
    footerCopy: '© {year} Adgena',
    footerPayment: 'Payments processed via Robokassa.',
    footerTermsLink: 'Terms',
    footerPrivacyLink: 'Privacy',

    // Auth page
    auth: {
      loginTitle: 'Sign In',
      registerTitle: 'Sign Up',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      confirmPassword: 'Confirm password',
      code: 'Code from email',
      loginBtn: 'Sign In',
      registerBtn: 'Create account',
      sendCode: 'Send code',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      register: 'Sign Up',
      login: 'Sign In',
      orWith: 'or with',
      checkEmail: 'Code sent to your email',
      googleBtn: 'Google',
      yandexBtn: 'Yandex',
    },

    // Checkout page
    checkout: {
      title: 'Subscribe',
      plan: 'Plan',
      price: 'Price',
      perMonth: '/ mo',
      generations: 'generations',
      agree: 'I agree to the',
      terms: 'terms of service',
      and: 'and',
      privacy: 'privacy policy',
      recurring: 'Recurring payment: auto-renews every 30 days',
      payBtn: 'Pay',
      processing: 'Redirecting to payment...',
      notFound: 'Plan not found',
      choosePlan: 'Choose a plan on the',
      mainPage: 'main page',
      checkingAuth: 'Checking authorization...',
    },
  },
};

export function getLang(locale) {
  return LANGS[locale] || LANGS.ru;
}
