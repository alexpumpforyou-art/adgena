'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// ========================================
// LOGO SVG (Brand Kit — A mark + text)
// ========================================

function Logo({ className }) {
  return (
    <span className={className}>
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <path d="M20 4L36 36H28L24.5 28H15.5L12 36H4L20 4Z" fill="#FF6A00"/>
        <path d="M20 14L25 26H15L20 14Z" fill="#0B0D14"/>
      </svg>
      <span>Adgena</span>
    </span>
  );
}

// ========================================
// HEADER
// ========================================

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerInner}>
        <Logo className={styles.logo} />
        <nav className={styles.nav}>
          <a href="#showcase">Примеры</a>
          <a href="#features">Возможности</a>
          <a href="#pricing">Тарифы</a>
        </nav>
        <Link href="/dashboard" className={styles.btnStart}>Начать генерацию</Link>
      </div>
    </header>
  );
}

// ========================================
// HERO — Video Scroll Section
// ========================================

function Hero() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / sectionHeight));
      setProgress(p);

      if (videoRef.current && videoRef.current.duration) {
        videoRef.current.currentTime = p * videoRef.current.duration;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const words = ['карточки товаров', 'lifestyle-фото', 'рекламные баннеры'];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setWordIdx(p => (p + 1) % words.length), 2800); return () => clearInterval(t); }, []);

  return (
    <section className={styles.hero} ref={sectionRef}>
      {/* Sticky viewport */}
      <div className={styles.heroSticky}>
        {/* Video background */}
        <div className={styles.heroVideo}>
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className={styles.video}
          >
            {/* Place video: /public/hero.mp4 */}
            <source src="/hero.mp4" type="video/mp4" />
          </video>
          <div className={styles.videoOverlay} />
        </div>

        {/* Text content */}
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>AI-генератор для маркетплейсов</p>
          <h1 className={styles.heroTitle}>
            Создавайте<br />
            <span className={styles.heroAccent} key={wordIdx}>{words[wordIdx]}</span><br />
            <span className={styles.heroTitleLight}>за секунды</span>
          </h1>
          <p className={styles.heroDesc}>
            Загрузите фото товара — получите профессиональные креативы. Без дизайнера, без фотографа.
          </p>
          <div className={styles.heroCta}>
            <Link href="/dashboard" className={styles.btnPrimary}>Начать генерацию</Link>
            <a href="#showcase" className={styles.btnGhost}>Смотреть примеры</a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator} style={{ opacity: 1 - progress * 3 }}>
          <span>Скрольте вниз</span>
          <div className={styles.scrollLine} />
        </div>
      </div>
    </section>
  );
}

// ========================================
// SHOWCASE — Horizontal Scroll Before/After
// ========================================

function Showcase() {
  const scrollRef = useRef(null);

  const cards = [
    { id: 1, label: 'Одежда', type: 'Фото', before: 'Фото с телефона', after: 'На модели — lifestyle' },
    { id: 2, label: 'Косметика', type: 'Фото', before: 'Продукт на столе', after: 'Премиум съёмка' },
    { id: 3, label: 'Гаджеты', type: 'Карточка', before: 'Фото из каталога', after: 'Карточка WB' },
    { id: 4, label: 'Еда', type: 'Реклама', before: 'Снимок блюда', after: 'Рекламный баннер' },
    { id: 5, label: 'Аксессуары', type: 'Фото', before: 'Фото на белом', after: 'Flat lay композиция' },
    { id: 6, label: 'Дом и сад', type: 'Карточка', before: 'Простое фото', after: 'Инфографика Ozon' },
  ];

  return (
    <section className={styles.showcase} id="showcase">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>Примеры</span>
          <h2 className={styles.sectionTitle}>Загрузил — получил</h2>
          <p className={styles.sectionDesc}>Одно фото товара превращается в продающий креатив</p>
        </div>
      </div>

      <div className={styles.scrollTrack} ref={scrollRef}>
        <div className={styles.scrollInner}>
          {cards.map(card => (
            <div key={card.id} className={styles.showcaseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{card.label}</span>
                <span className={styles.cardBadge}>{card.type}</span>
              </div>
              <div className={styles.cardPair}>
                <div className={styles.cardSide}>
                  <span className={styles.cardTag}>Загрузил</span>
                  <div className={styles.placeholder} style={{aspectRatio: '3/4'}} />
                  <span className={styles.cardCaption}>{card.before}</span>
                </div>
                <div className={styles.cardArrow}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.cardSide}>
                  <span className={styles.cardTag}>Получил</span>
                  <div className={styles.placeholder} style={{aspectRatio: '3/4'}} />
                  <span className={styles.cardCaption}>{card.after}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// FEATURES
// ========================================

function Features() {
  const features = [
    { title: '8 категорий', desc: 'Одежда, косметика, гаджеты, еда, дом, аксессуары, детские товары и другие', num: '8' },
    { title: '30+ концепций', desc: 'На модели, в интерьере, flat lay, крупный план, каталог — под каждую категорию', num: '30+' },
    { title: '3 рекламных формата', desc: 'Распродажа, минимализм Apple-стиль, вертикальные stories', num: '3' },
    { title: '5 форматов', desc: '9:16, 3:4, 1:1, 4:3, 16:9 — WB, Ozon, Instagram, Facebook, VK', num: '5' },
    { title: 'AI-улучшения', desc: 'Напишите что изменить — AI перегенерирует с учётом пожеланий', num: 'V2' },
    { title: 'История', desc: 'Все генерации сохраняются — переключайтесь между версиями', num: 'Vn' },
  ];

  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>Возможности</span>
          <h2 className={styles.sectionTitle}>Всё для продаж на маркетплейсах</h2>
        </div>
        <div className={styles.featGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featCard}>
              <span className={styles.featNum}>{f.num}</span>
              <h3 className={styles.featTitle}>{f.title}</h3>
              <p className={styles.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// HOW IT WORKS
// ========================================

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Загрузите фото', desc: 'Любое фото товара — с телефона или каталога' },
    { n: '02', title: 'Настройте', desc: 'Категория, концепция, формат — на одном экране' },
    { n: '03', title: 'Генерируйте', desc: 'AI создаст изображение за 30 секунд' },
    { n: '04', title: 'Улучшайте', desc: 'Допишите пожелание — AI доработает' },
  ];

  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>Процесс</span>
          <h2 className={styles.sectionTitle}>Четыре шага до результата</h2>
        </div>
        <div className={styles.stepsRow}>
          {steps.map((s, i) => (
            <div key={i} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.n}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// PRICING
// ========================================

function Pricing() {
  const plans = [
    { id: 'free', name: 'Free', price: 0, desc: 'Попробуйте бесплатно', feat: ['5 генераций/мес', 'Базовые концепции', 'Экспорт JPG'], cta: 'Начать бесплатно' },
    { id: 'starter', name: 'Starter', price: 990, desc: 'Для начинающих', feat: ['50 генераций/мес', 'Все концепции', 'Все форматы', 'Улучшения'], cta: 'Выбрать' },
    { id: 'pro', name: 'Pro', price: 2490, desc: 'Для продавцов', feat: ['200 генераций/мес', 'Все возможности', 'Рекламные форматы', 'История версий', 'Приоритет'], cta: 'Выбрать', hl: true, badge: 'Популярный' },
    { id: 'business', name: 'Business', price: 4990, desc: 'Для команд', feat: ['500 генераций/мес', 'API доступ', 'Мульти-юзеры', 'Brand Kit', 'Приоритет'], cta: 'Выбрать' },
  ];

  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>Тарифы</span>
          <h2 className={styles.sectionTitle}>Прозрачные цены</h2>
        </div>
        <div className={styles.priceGrid}>
          {plans.map(p => (
            <div key={p.id} className={`${styles.priceCard} ${p.hl ? styles.priceCardHl : ''}`}>
              {p.badge && <div className={styles.priceBadge}>{p.badge}</div>}
              <h3 className={styles.priceName}>{p.name}</h3>
              <p className={styles.priceDesc}>{p.desc}</p>
              <div className={styles.priceAmount}>
                {p.price ? `${p.price.toLocaleString()} \u20BD` : '\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E'}
                {p.price > 0 && <span>/\u043C\u0435\u0441</span>}
              </div>
              <ul className={styles.priceFeats}>{p.feat.map((f, i) => <li key={i}>{f}</li>)}</ul>
              <Link href={p.id === 'free' ? '/dashboard' : `/api/checkout?plan=${p.id}`} className={`${p.hl ? styles.btnPrimary : styles.btnOutline} ${styles.priceCta}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// FOOTER
// ========================================

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div>
            <Logo className={styles.footerLogo} />
            <p className={styles.footerDesc}>AI-генератор карточек товара и рекламных креативов</p>
          </div>
          <div className={styles.footerLinks}>
            <div>
              <h4>Продукт</h4>
              <a href="#showcase">Примеры</a>
              <a href="#features">Возможности</a>
              <a href="#pricing">Тарифы</a>
            </div>
            <div>
              <h4>Юридическое</h4>
              <a href="#">Политика конфиденциальности</a>
              <a href="#">Оферта</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Adgena. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

// ========================================
// PAGE
// ========================================

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Showcase />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
