'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import styles from './page.module.css';

// ========================================
// LOGO SVG
// ========================================
function Logo({ className }) {
  return (
    <span className={className}>
      <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
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
// HERO — Video Scroll (Canvas + Frames)
// ========================================
function Hero() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const heroTextRef = useRef(null);
  const framesRef = useRef([]);
  const currentFrameRef = useRef(0);

  const words = ['карточки товаров', 'lifestyle-фото', 'рекламные баннеры'];
  const [wordIdx, setWordIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setWordIdx(p => (p + 1) % words.length), 2800); return () => clearInterval(t); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Canvas sizing
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      drawFrame(currentFrameRef.current);
    };

    function drawFrame(index) {
      const img = framesRef.current[index];
      if (!img || !img.complete) return;
      const cw = canvas.width / (window.devicePixelRatio || 1);
      const ch = canvas.height / (window.devicePixelRatio || 1);
      const iw = img.naturalWidth, ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih) * 0.88;
      const dw = iw * scale, dh = ih * scale;
      const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
      ctx.fillStyle = '#0B0D14';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Load frames — try /frames/frame_XXXX.webp
    const FRAME_COUNT = 150; // adjust based on actual frames
    let loaded = 0;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/frames/frame_${String(i).padStart(4, '0')}.webp`;
      img.onload = () => {
        loaded++;
        if (loaded === 1) { resize(); drawFrame(0); }
      };
      img.onerror = () => { /* frame not found, skip */ };
      framesRef.current[i - 1] = img;
    }

    // If no frames exist, draw a placeholder
    setTimeout(() => {
      if (loaded === 0) {
        const cw = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        ctx.fillStyle = '#0B0D14';
        ctx.fillRect(0, 0, cw, ch);
        // Show subtle gradient as placeholder
        const grad = ctx.createRadialGradient(cw/2, ch/2, 0, cw/2, ch/2, cw * 0.5);
        grad.addColorStop(0, '#1A1F2B');
        grad.addColorStop(1, '#0B0D14');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }
    }, 500);

    window.addEventListener('resize', resize);
    resize();

    // GSAP + ScrollTrigger setup
    const waitForGsap = setInterval(() => {
      if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
      clearInterval(waitForGsap);

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      // Lenis
      if (typeof window.Lenis !== 'undefined') {
        const lenis = new window.Lenis({ duration: 1.2, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      const FRAME_SPEED = 2.0;
      const scrollContainer = wrapRef.current;

      // Frame binding
      ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const accelerated = Math.min(self.progress * FRAME_SPEED, 1);
          const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
          if (index !== currentFrameRef.current) {
            currentFrameRef.current = index;
            requestAnimationFrame(() => drawFrame(index));
          }
        }
      });

      // Hero text fade out
      if (heroTextRef.current) {
        ScrollTrigger.create({
          trigger: scrollContainer,
          start: 'top top',
          end: '20% top',
          scrub: true,
          onUpdate: (self) => {
            heroTextRef.current.style.opacity = Math.max(0, 1 - self.progress * 2.5);
            heroTextRef.current.style.transform = `translateY(${self.progress * -60}px)`;
          }
        });
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(waitForGsap);
    };
  }, []);

  return (
    <section className={styles.hero} ref={wrapRef}>
      {/* Canvas */}
      <div className={styles.canvasWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.canvasOverlay} />
      </div>

      {/* Hero text */}
      <div className={styles.heroContent} ref={heroTextRef}>
        <p className={styles.heroLabel}>AI-генератор для маркетплейсов</p>
        <h1 className={styles.heroTitle}>
          Создавайте<br />
          <span className={styles.heroAccent} key={wordIdx}>{words[wordIdx]}</span><br />
          <span className={styles.heroLight}>за секунды</span>
        </h1>
        <p className={styles.heroDesc}>
          Загрузите фото товара — получите профессиональные креативы.
        </p>
        <div className={styles.heroCta}>
          <Link href="/dashboard" className={styles.btnPrimary}>Начать генерацию</Link>
          <a href="#showcase" className={styles.btnGhost}>Смотреть примеры</a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint}>
        <span>Скрольте</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}

// ========================================
// SHOWCASE — Horizontal Scroll (pinned)
// ========================================
function Showcase() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const waitForGsap = setInterval(() => {
      if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
      clearInterval(waitForGsap);

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const scrollWidth = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -scrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        }
      });
    }, 100);

    return () => clearInterval(waitForGsap);
  }, []);

  const cards = [
    { id: 1, label: 'Одежда', type: 'Фото', before: 'Фото с телефона', after: 'На модели — lifestyle' },
    { id: 2, label: 'Косметика', type: 'Фото', before: 'Продукт на столе', after: 'Премиум съёмка' },
    { id: 3, label: 'Гаджеты', type: 'Карточка', before: 'Фото из каталога', after: 'Карточка WB' },
    { id: 4, label: 'Еда', type: 'Реклама', before: 'Снимок блюда', after: 'Рекламный баннер' },
    { id: 5, label: 'Аксессуары', type: 'Фото', before: 'Фото на белом', after: 'Flat lay композиция' },
    { id: 6, label: 'Дом и сад', type: 'Карточка', before: 'Простое фото', after: 'Инфографика Ozon' },
  ];

  return (
    <section className={styles.showcase} id="showcase" ref={sectionRef}>
      <div className={styles.showcaseTrack} ref={trackRef}>
        {/* Title card */}
        <div className={styles.showcaseTitleCard}>
          <span className={styles.sectionLabel}>Примеры</span>
          <h2 className={styles.showcaseTitle}>Загрузил — получил</h2>
          <p className={styles.showcaseDesc}>Одно фото товара превращается в продающий креатив</p>
        </div>

        {/* Before/After cards */}
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
    </section>
  );
}

// ========================================
// FEATURES
// ========================================
function Features() {
  const features = [
    { title: '8 категорий', desc: 'Одежда, косметика, гаджеты, еда, дом, аксессуары и другие', num: '8' },
    { title: '30+ концепций', desc: 'На модели, в интерьере, flat lay, крупный план, каталог', num: '30+' },
    { title: '3 рекламных формата', desc: 'Распродажа, минимализм, stories — готовые к запуску', num: '3' },
    { title: '5 форматов', desc: '9:16, 3:4, 1:1, 4:3, 16:9 — все площадки', num: '5' },
    { title: 'AI-улучшения', desc: 'Напишите что изменить — AI перегенерирует', num: 'V2' },
    { title: 'История', desc: 'Все генерации сохраняются с версиями', num: 'Vn' },
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
    { id: 'business', name: 'Business', price: 4990, desc: 'Для команд', feat: ['500 генераций/мес', 'API доступ', 'Мульти-юзеры', 'Brand Kit'], cta: 'Выбрать' },
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
                {p.price ? `${p.price.toLocaleString()} \u20BD` : 'Бесплатно'}
                {p.price > 0 && <span>/мес</span>}
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
            <div><h4>Продукт</h4><a href="#showcase">Примеры</a><a href="#features">Возможности</a><a href="#pricing">Тарифы</a></div>
            <div><h4>Юридическое</h4><a href="#">Политика конфиденциальности</a><a href="#">Оферта</a></div>
          </div>
        </div>
        <div className={styles.footerBottom}><p>&copy; {new Date().getFullYear()} Adgena</p></div>
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
      {/* CDN libs */}
      <Script src="https://cdn.jsdelivr.net/npm/lenis@1/dist/lenis.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js" strategy="beforeInteractive" />

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
