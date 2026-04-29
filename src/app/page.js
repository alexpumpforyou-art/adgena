'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// ========================================
// LOGO (Brand images)
// ========================================
function Logo({ className }) {
  return (
    <span className={className}>
      <img src="/logo-icon.webp" alt="Adgena" style={{width: 56, height: 56, objectFit: 'contain'}} />
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
        <Link href="/auth" className={styles.btnStart}>Начать генерацию</Link>
      </div>
    </header>
  );
}

// ========================================
// Floating before/after cards (appear during video scroll)
// ========================================
const FLOAT_CARDS = [
  { at: 0.20, side: 'left', label: 'Одежда', beforeImg: '/cards/before1.webp', afterImg: '/cards/after1.webp' },
  { at: 0.42, side: 'right', label: 'Косметика', beforeImg: '/cards/before2.webp', afterImg: '/cards/after2.webp' },
  { at: 0.64, side: 'left', label: 'Гаджеты', beforeImg: '/cards/before3.webp', afterImg: '/cards/after3.webp' },
];

// ========================================
// HERO — Video Scroll (Canvas + 120 Frames)
// Reference architecture: sticky canvas, native scroll
// ========================================
function Hero() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const heroTextRef = useRef(null);
  const cardsRef = useRef([]);
  const framesRef = useRef([]);
  const stateRef = useRef({ currentFrame: 0, rafPending: false, isMobile: false });

  const typedWord = useTypewriter(['карточки товаров', 'lifestyle-фото', 'рекламные баннеры'], 70, 35, 1400);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const FRAME_COUNT = 120;
    const SCALE_DESKTOP = 1.03;
    const SCALE_MOBILE = 1.14;

    function updateMobile() {
      stateRef.current.isMobile = window.innerWidth < 768;
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      drawFrame(stateRef.current.currentFrame);
    }

    function drawFrame(index) {
      const img = framesRef.current[index];
      const rect = canvas.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;

      ctx.fillStyle = '#0B0D14';
      ctx.fillRect(0, 0, cw, ch);

      if (!img || !img.complete) return;

      const iw = img.naturalWidth || img.width;
      const ih = img.naturalHeight || img.height;
      const scaleFactor = stateRef.current.isMobile ? SCALE_MOBILE : SCALE_DESKTOP;
      const ratio = Math.max(cw / iw, ch / ih) * scaleFactor;
      const dw = iw * ratio;
      const dh = ih * ratio;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    function requestDraw(index) {
      stateRef.current.currentFrame = index;
      if (stateRef.current.rafPending) return;
      stateRef.current.rafPending = true;
      requestAnimationFrame(() => {
        drawFrame(stateRef.current.currentFrame);
        stateRef.current.rafPending = false;
      });
    }

    function getSectionProgress() {
      const rect = section.getBoundingClientRect();
      const total = Math.max(1, section.offsetHeight - window.innerHeight);
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      return scrolled / total;
    }

    function onScroll() {
      const p = getSectionProgress();

      // Frame index — direct mapping, no acceleration
      const frameIndex = Math.min(Math.floor(p * FRAME_COUNT), FRAME_COUNT - 1);
      requestDraw(frameIndex);

      // Hero text fade out
      if (heroTextRef.current) {
        const textFade = Math.max(0, 1 - p * 5);
        heroTextRef.current.style.opacity = textFade;
        heroTextRef.current.style.transform = `translateY(${p * -80}px)`;
      }

      // Floating before/after cards
      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        const card = FLOAT_CARDS[i];
        const dist = Math.abs(p - card.at);
        const RANGE = 0.12;
        const visible = dist < RANGE;
        const opacity = visible ? Math.max(0, 1 - dist / RANGE) : 0;
        const ty = visible ? (1 - opacity) * 24 : 32;
        el.style.opacity = opacity;
        // On mobile, cards are positioned with top:50%, so include -50% centering
        if (stateRef.current.isMobile) {
          el.style.transform = `translateY(calc(-50% + ${ty}px))`;
        } else {
          el.style.transform = `translateY(${ty}px)`;
        }
        el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      });
    }

    // Progressive frame loading: first batch immediately, rest on scroll
    const FIRST_BATCH = 14;
    let loaded = 0;
    let restLoaded = false;

    // Load first batch for instant hero
    for (let i = 1; i <= FIRST_BATCH; i++) {
      const img = new Image();
      img.src = `/frames/${String(i).padStart(4, '0')}.webp`;
      if (i === 1) img.onload = () => { loaded++; resizeCanvas(); };
      else img.onload = () => { loaded++; };
      framesRef.current[i - 1] = img;
    }

    // Load remaining frames only when user starts scrolling
    function loadRemainingFrames() {
      if (restLoaded) return;
      restLoaded = true;
      // On mobile, skip every other frame (60 instead of 120) for speed
      const step = stateRef.current.isMobile ? 2 : 1;
      for (let i = FIRST_BATCH + 1; i <= FRAME_COUNT; i += step) {
        const img = new Image();
        img.src = `/frames/${String(i).padStart(4, '0')}.webp`;
        img.onload = () => { loaded++; };
        framesRef.current[i - 1] = img;
        // Fill skipped frames with nearest loaded frame on mobile
        if (step === 2 && i + 1 <= FRAME_COUNT) {
          framesRef.current[i] = img;
        }
      }
    }

    // Trigger lazy load when hero is 5% scrolled
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) {
        loadRemainingFrames();
        observer.disconnect();
      }
    }, { threshold: 0.95 });
    observer.observe(section);

    function onResize() {
      updateMobile();
      resizeCanvas();
      onScroll();
    }

    updateMobile();
    resizeCanvas();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className={styles.hero} ref={sectionRef}>
      <div className={styles.heroSticky} ref={stickyRef}>
        {/* Canvas */}
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.canvasOverlay} />
        <div className={styles.bottomFade} />

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
            <Link href="/auth" className={styles.btnPrimary}>Начать генерацию</Link>
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
      </div>
    </section>
  );
}

// ========================================
// SHOWCASE — Horizontal Scroll (native sticky)
// ========================================
function Showcase() {
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    function measure() {
      const vw = window.innerWidth;
      const isMobile = vw < 768;
      const scrollDistance = Math.max(0, track.scrollWidth - vw);
      // Minimal extra padding — just enough for smooth exit
      const pad = isMobile ? 0 : 100;
      const totalHeight = window.innerHeight + scrollDistance + pad;
      section.style.height = `${Math.ceil(totalHeight)}px`;
      section.dataset.scrollDistance = String(scrollDistance);
    }

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const scrollDistance = parseFloat(section.dataset.scrollDistance || '0');
      if (scrollDistance <= 0) return;

      // How far into the section we've scrolled (after it reaches top)
      const raw = Math.min(Math.max(-rect.top, 0), scrollDistance);
      // Linear 1:1 mapping — no easing = no dead scroll zone
      track.style.transform = `translate3d(${-raw}px, 0, 0)`;
    }

    measure();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); onScroll(); });

    // Recalculate after fonts load
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => { measure(); onScroll(); });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
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
      <div className={styles.showcaseSticky} ref={stickyRef}>
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
    { id: 'lite', name: 'Лайт', price: 390, desc: 'Для пробы сервиса', feat: ['10 генераций', 'Все концепции', 'Все форматы'], cta: 'Выбрать' },
    { id: 'standard', name: 'Стандарт', price: 990, desc: 'Для серии товаров', feat: ['30 генераций', 'Все возможности', 'Рекламные форматы', 'Улучшения'], cta: 'Выбрать', hl: true, badge: 'Популярный' },
    { id: 'pro', name: 'Про', price: 2490, desc: 'Оптимальный выбор', feat: ['80 генераций', 'Всё включено', 'История версий', 'Приоритет'], cta: 'Выбрать' },
    { id: 'business', name: 'Бизнес', price: 4990, desc: 'Максимум возможностей', feat: ['200 генераций', 'API доступ', 'Мульти-юзеры', 'Brand Kit'], cta: 'Выбрать' },
  ];

  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>Тарифы</span>
          <h2 className={styles.sectionTitle}>Прозрачные цены</h2>
        </div>
        <div className={styles.freeBanner}>
          <span>🎁 <strong>1 бесплатная генерация</strong> для знакомства с сервисом</span>
          <Link href="/auth" className={styles.freeLink}>Попробовать →</Link>
        </div>
        <div className={styles.priceGrid}>
          {plans.map(p => (
            <div key={p.id} className={`${styles.priceCard} ${p.hl ? styles.priceCardHl : ''}`}>
              {p.badge && <div className={styles.priceBadge}>{p.badge}</div>}
              <h3 className={styles.priceName}>{p.name}</h3>
              <p className={styles.priceDesc}>{p.desc}</p>
              <div className={styles.priceAmount}>
                {`${p.price.toLocaleString()} \u20BD`}
              </div>
              <ul className={styles.priceFeats}>{p.feat.map((f, i) => <li key={i}>{f}</li>)}</ul>
              <Link href={`/api/robokassa/checkout?plan=${p.id}`} className={`${p.hl ? styles.btnPrimary : styles.btnOutline} ${styles.priceCta}`}>{p.cta}</Link>
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
            <p className={styles.footerContact}>Связь: <a href="mailto:info@adgena.pro">info@adgena.pro</a></p>
          </div>
          <div className={styles.footerLinks}>
            <div><h4>Продукт</h4><a href="#showcase">Примеры</a><a href="#features">Возможности</a><a href="#pricing">Тарифы</a></div>
            <div><h4>Юридическое</h4><Link href="/privacy">Политика конфиденциальности</Link><Link href="/terms">Публичная оферта</Link></div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Adgena — Самозанятый Орлов Д.Э.</p>
          <p className={styles.footerLegal}>Оплата производится через сервис Робокасса. <Link href="/terms">Условия использования</Link> &bull; <Link href="/privacy">Конфиденциальность</Link></p>
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
