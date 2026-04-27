'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import styles from './page.module.css';

// ========================================
// LOGO (Brand images)
// ========================================
function Logo({ className }) {
  return (
    <span className={className}>
      <img src="/logo-icon.png" alt="Adgena" style={{width: 56, height: 56, objectFit: 'contain'}} />
      <span>Adgena</span>
    </span>
  );
}

// ========================================
// TYPEWRITER HOOK
// ========================================
function useTypewriter(words, typingSpeed = 80, deletingSpeed = 40, pauseTime = 1600) {
  const [display, setDisplay] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplay(currentWord.substring(0, display.length + 1));
        if (display.length + 1 === currentWord.length) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        setDisplay(currentWord.substring(0, display.length - 1));
        if (display.length - 1 === 0) {
          setIsDeleting(false);
          setWordIndex((wordIndex + 1) % words.length);
        }
      }
    }, isDeleting ? deletingSpeed : (display.length === 0 ? 300 : typingSpeed));
    return () => clearTimeout(timeout);
  }, [display, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return display;
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
// Floating before/after cards (appear during video scroll)
// ========================================
const FLOAT_CARDS = [
  { at: 0.20, side: 'left', label: 'Одежда', beforeImg: '/cards/before1.png', afterImg: '/cards/after1.png' },
  { at: 0.42, side: 'right', label: 'Косметика', beforeImg: '/cards/before2.png', afterImg: '/cards/after2.png' },
  { at: 0.64, side: 'left', label: 'Гаджеты', beforeImg: '/cards/before3.png', afterImg: '/cards/after3.png' },
];

// ========================================
// HERO — Video Scroll (Canvas + 120 Frames)
// ========================================
function Hero() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const heroTextRef = useRef(null);
  const blurRef = useRef(null);
  const cardsRef = useRef([]);
  const framesRef = useRef([]);
  const currentFrameRef = useRef(0);

  const typedWord = useTypewriter(['карточки товаров', 'lifestyle-фото', 'рекламные баннеры'], 70, 35, 1400);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

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
      // Full cover with generous overscan to guarantee edge-to-edge
      const scale = Math.max(cw / iw, ch / ih) * 1.08;
      const dw = iw * scale, dh = ih * scale;
      const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
      ctx.fillStyle = '#0B0D14';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Load frames: /frames/0001.webp — /frames/0120.webp
    const FRAME_COUNT = 120;
    let loaded = 0;

    // Load first frame with priority for instant display
    const firstImg = new Image();
    firstImg.src = '/frames/0001.webp';
    firstImg.onload = () => { loaded++; resize(); drawFrame(0); };
    firstImg.onerror = () => {};
    framesRef.current[0] = firstImg;

    for (let i = 2; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/frames/${String(i).padStart(4, '0')}.webp`;
      img.onload = () => { loaded++; };
      img.onerror = () => {};
      framesRef.current[i - 1] = img;
    }

    // Placeholder when no frames
    setTimeout(() => {
      if (loaded === 0) {
        const cw = canvas.width / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);
        const grad = ctx.createRadialGradient(cw/2, ch/2, 0, cw/2, ch/2, cw * 0.5);
        grad.addColorStop(0, '#1A1F2B');
        grad.addColorStop(1, '#0B0D14');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }
    }, 500);

    window.addEventListener('resize', resize);
    resize();

    // GSAP
    const waitForGsap = setInterval(() => {
      if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
      clearInterval(waitForGsap);

      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      if (typeof window.Lenis !== 'undefined') {
        const lenis = new window.Lenis({ duration: 1.2, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      const FRAME_SPEED = 2.0;
      const scrollContainer = wrapRef.current;

      ScrollTrigger.create({
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const accelerated = Math.min(p * FRAME_SPEED, 1);
          const index = Math.min(Math.floor(accelerated * FRAME_COUNT), FRAME_COUNT - 1);
          if (index !== currentFrameRef.current) {
            currentFrameRef.current = index;
            requestAnimationFrame(() => drawFrame(index));
          }

          // Blur transitions: smooth start and end
          if (blurRef.current) {
            let blur = 0;
            if (p < 0.06) blur = (1 - p / 0.06) * 16;
            else if (p > 0.92) blur = ((p - 0.92) / 0.08) * 16;
            blurRef.current.style.backdropFilter = `blur(${blur}px)`;
            blurRef.current.style.webkitBackdropFilter = `blur(${blur}px)`;
          }

          // Floating before/after cards — wider range = visible longer
          cardsRef.current.forEach((el, i) => {
            if (!el) return;
            const card = FLOAT_CARDS[i];
            const dist = Math.abs(p - card.at);
            const RANGE = 0.12;
            const visible = dist < RANGE;
            const opacity = visible ? Math.max(0, 1 - dist / RANGE) : 0;
            const ty = visible ? (1 - opacity) * 24 : 32;
            el.style.opacity = opacity;
            el.style.transform = `translateY(${ty}px)`;
            el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
          });
        }
      });

      // Hero text fade
      if (heroTextRef.current) {
        ScrollTrigger.create({
          trigger: scrollContainer,
          start: 'top top',
          end: '12% top',
          scrub: true,
          onUpdate: (self) => {
            heroTextRef.current.style.opacity = Math.max(0, 1 - self.progress * 3);
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
        <div className={styles.blurLayer} ref={blurRef} />
      </div>

      {/* Hero text */}
      <div className={styles.heroContent} ref={heroTextRef}>
        <p className={styles.heroLabel}>AI-генератор для маркетплейсов</p>
        <h1 className={styles.heroTitle}>
          Создавайте<br />
          <span className={styles.heroAccent}>{typedWord}<span className={styles.cursor}>|</span></span><br />
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

      {/* Floating before/after cards */}
      {FLOAT_CARDS.map((card, i) => (
        <div
          key={i}
          ref={el => { cardsRef.current[i] = el; }}
          className={`${styles.floatCard} ${card.side === 'right' ? styles.floatRight : styles.floatLeft}`}
          style={{ opacity: 0 }}
        >
          <div className={styles.floatHeader}>{card.label}</div>
          <div className={styles.floatPair}>
            <div className={styles.floatSide}>
              <span className={styles.floatTag}>Загрузил</span>
              <img src={card.beforeImg} alt="" className={styles.floatImg} />
            </div>
            <span className={styles.floatArrow}>&rarr;</span>
            <div className={styles.floatSide}>
              <span className={styles.floatTag}>Получил</span>
              <img src={card.afterImg} alt="" className={styles.floatImg} />
            </div>
          </div>
        </div>
      ))}

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
