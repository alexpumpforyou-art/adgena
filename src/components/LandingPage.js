'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../app/page.module.css';

// ========================================
// SMART "Start" button
// ========================================
function SmartStartLink({ className, children, locale }) {
  const [authed, setAuthed] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (!cancelled) setAuthed(!!(d?.success && d?.user)); })
      .catch(() => { if (!cancelled) setAuthed(false); });
    return () => { cancelled = true; };
  }, []);
  const href = authed ? '/dashboard' : (locale === 'en' ? '/en/auth' : '/auth');
  return <Link href={href} className={className}>{children}</Link>;
}

// ========================================
// LOGO
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
// Floating before/after cards
// ========================================
const FLOAT_CARD_POSITIONS = [
  { at: 0.20, side: 'left', beforeImg: '/cards/before1.webp', afterImg: '/cards/after1.webp' },
  { at: 0.42, side: 'right', beforeImg: '/cards/before2.webp', afterImg: '/cards/after2.webp' },
  { at: 0.64, side: 'left', beforeImg: '/cards/before3.webp', afterImg: '/cards/after3.webp' },
];

// ========================================
// HEADER
// ========================================
function Header({ t, locale }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const otherLocale = locale === 'en' ? 'ru' : 'en';
  const switchUrl = locale === 'en' ? '/' : '/en';
  const switchLabel = locale === 'en' ? '🇷🇺 RU' : '🇺🇸 EN';

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.headerInner}>
        <Logo className={styles.logo} />
        <nav className={styles.nav}>
          <a href="#showcase">{t.nav.examples}</a>
          <a href="#features">{t.nav.features}</a>
          <a href="#pricing">{t.nav.pricing}</a>
          <Link href={switchUrl} style={{fontSize: 13, opacity: 0.7, textDecoration: 'none', color: 'inherit'}}>{switchLabel}</Link>
        </nav>
        <SmartStartLink className={styles.btnStart} locale={locale}>{t.startBtn}</SmartStartLink>
      </div>
    </header>
  );
}

// ========================================
// HERO
// ========================================
function Hero({ t, locale }) {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const heroTextRef = useRef(null);
  const cardsRef = useRef([]);
  const framesRef = useRef([]);
  const stateRef = useRef({ currentFrame: 0, rafPending: false, isMobile: false });

  const typedWord = useTypewriter(t.typewriterWords, 70, 35, 1400);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const FRAME_COUNT = 120;
    const SCALE_DESKTOP = 1.03;
    const SCALE_MOBILE = 1.14;

    function updateMobile() { stateRef.current.isMobile = window.innerWidth < 768; }

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
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
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
      return Math.min(Math.max(-rect.top, 0), total) / total;
    }

    function onScroll() {
      const p = getSectionProgress();
      requestDraw(Math.min(Math.floor(p * FRAME_COUNT), FRAME_COUNT - 1));
      if (heroTextRef.current) {
        heroTextRef.current.style.opacity = Math.max(0, 1 - p * 5);
        heroTextRef.current.style.transform = `translateY(${p * -80}px)`;
      }
      cardsRef.current.forEach((el, i) => {
        if (!el) return;
        const card = FLOAT_CARD_POSITIONS[i];
        const dist = Math.abs(p - card.at);
        const RANGE = 0.12;
        const visible = dist < RANGE;
        const opacity = visible ? Math.max(0, 1 - dist / RANGE) : 0;
        const ty = visible ? (1 - opacity) * 24 : 32;
        el.style.opacity = opacity;
        if (stateRef.current.isMobile) {
          el.style.transform = `translateY(calc(-50% + ${ty}px))`;
        } else {
          el.style.transform = `translateY(${ty}px)`;
        }
        el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      });
    }

    const FIRST_BATCH = 14;
    let restLoaded = false;
    for (let i = 1; i <= FIRST_BATCH; i++) {
      const img = new Image();
      img.src = `/frames/${String(i).padStart(4, '0')}.webp`;
      if (i === 1) img.onload = () => resizeCanvas();
      framesRef.current[i - 1] = img;
    }

    function loadRemainingFrames() {
      if (restLoaded) return;
      restLoaded = true;
      const step = stateRef.current.isMobile ? 2 : 1;
      for (let i = FIRST_BATCH + 1; i <= FRAME_COUNT; i += step) {
        const img = new Image();
        img.src = `/frames/${String(i).padStart(4, '0')}.webp`;
        framesRef.current[i - 1] = img;
        if (step === 2 && i + 1 <= FRAME_COUNT) framesRef.current[i] = img;
      }
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) { loadRemainingFrames(); observer.disconnect(); }
    }, { threshold: 0.95 });
    observer.observe(section);

    function onResize() { updateMobile(); resizeCanvas(); onScroll(); }
    updateMobile();
    resizeCanvas();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); };
  }, []);

  const floatLabels = t.floatCards;

  return (
    <section className={styles.hero} ref={sectionRef}>
      <div className={styles.heroSticky} ref={stickyRef}>
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.canvasOverlay} />
        <div className={styles.bottomFade} />

        <div className={styles.heroContent} ref={heroTextRef}>
          <p className={styles.heroLabel}>{t.heroLabel}</p>
          <h1 className={styles.heroTitle}>
            {t.heroTitle1}<br />
            <span className={styles.heroAccent}>{typedWord}<span className={styles.cursor}>|</span></span><br />
            <span className={styles.heroLight}>{t.heroTitle3}</span>
          </h1>
          <p className={styles.heroDesc}>{t.heroDesc}</p>
          <div className={styles.heroCta}>
            <SmartStartLink className={styles.btnPrimary} locale={locale}>{t.heroCta}</SmartStartLink>
            <a href="#showcase" className={styles.btnGhost}>{t.heroGhost}</a>
          </div>
        </div>

        {FLOAT_CARD_POSITIONS.map((card, i) => (
          <div
            key={i}
            ref={el => { cardsRef.current[i] = el; }}
            className={`${styles.floatCard} ${card.side === 'right' ? styles.floatRight : styles.floatLeft}`}
            style={{ opacity: 0 }}
          >
            <div className={styles.floatHeader}>{floatLabels[i]?.label}</div>
            <div className={styles.floatPair}>
              <div className={styles.floatSide}>
                <span className={styles.floatTag}>{floatLabels[i]?.before || t.uploaded}</span>
                <img src={card.beforeImg} alt="" className={styles.floatImg} />
              </div>
              <span className={styles.floatArrow}>&rarr;</span>
              <div className={styles.floatSide}>
                <span className={styles.floatTag}>{floatLabels[i]?.after || t.received}</span>
                <img src={card.afterImg} alt="" className={styles.floatImg} />
              </div>
            </div>
          </div>
        ))}

        <div className={styles.scrollHint}>
          <span>{t.heroScroll}</span>
          <div className={styles.scrollLine} />
        </div>
      </div>
    </section>
  );
}

// ========================================
// SHOWCASE
// ========================================
function Showcase({ t }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    function measure() {
      const vw = window.innerWidth;
      const isMobile = vw < 768;
      const scrollDistance = Math.max(0, track.scrollWidth - vw);
      const pad = isMobile ? 0 : 100;
      section.style.height = `${Math.ceil(window.innerHeight + scrollDistance + pad)}px`;
      section.dataset.scrollDistance = String(scrollDistance);
    }

    function onScroll() {
      const rect = section.getBoundingClientRect();
      const scrollDistance = parseFloat(section.dataset.scrollDistance || '0');
      if (scrollDistance <= 0) return;
      const raw = Math.min(Math.max(-rect.top, 0), scrollDistance);
      track.style.transform = `translate3d(${-raw}px, 0, 0)`;
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); onScroll(); });
    if (document.fonts?.ready) document.fonts.ready.then(() => { measure(); onScroll(); });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const imgData = [
    { beforeImg: '/examples/clothes_before.webp', afterImg: '/examples/clothes_after.webp' },
    { beforeImg: '/examples/cosmetics_before.webp', afterImg: '/examples/cosmetics_after.webp' },
    { beforeImg: '/examples/gadgets_before.webp', afterImg: '/examples/gadgets_after.webp' },
    { beforeImg: '/examples/food_before.webp', afterImg: '/examples/food_after.webp' },
    { beforeImg: '/examples/accessories_before.webp', afterImg: '/examples/accessories_after.webp' },
    { beforeImg: '/examples/home_before.webp', afterImg: '/examples/home_after.webp' },
  ];

  return (
    <section className={styles.showcase} id="showcase" ref={sectionRef}>
      <div className={styles.showcaseSticky}>
        <div className={styles.showcaseTrack} ref={trackRef}>
          <div className={styles.showcaseTitleCard}>
            <span className={styles.sectionLabel}>{t.showcaseLabel}</span>
            <h2 className={styles.showcaseTitle}>{t.showcaseTitle}</h2>
            <p className={styles.showcaseDesc}>{t.showcaseDesc}</p>
          </div>

          {t.showcaseCards.map((card, i) => (
            <div key={i} className={styles.showcaseCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{card.label}</span>
                <span className={styles.cardBadge}>{card.type}</span>
              </div>
              <div className={styles.cardPair}>
                <div className={styles.cardSide}>
                  <span className={styles.cardTag}>{t.uploaded}</span>
                  <img src={imgData[i]?.beforeImg} alt={card.before} className={styles.cardImage} loading="lazy" />
                  <span className={styles.cardCaption}>{card.before}</span>
                </div>
                <div className={styles.cardArrow}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className={styles.cardSide}>
                  <span className={styles.cardTag}>{t.received}</span>
                  <img src={imgData[i]?.afterImg} alt={card.after} className={styles.cardImage} loading="lazy" />
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
function Features({ t }) {
  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>{t.featuresLabel}</span>
          <h2 className={styles.sectionTitle}>{t.featuresTitle}</h2>
        </div>
        <div className={styles.featGrid}>
          {t.featuresList.map((f, i) => (
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
function HowItWorks({ t }) {
  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>{t.howLabel}</span>
          <h2 className={styles.sectionTitle}>{t.howTitle}</h2>
        </div>
        <div className={styles.stepsRow}>
          {t.howSteps.map((s, i) => (
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
function Pricing({ t, locale }) {
  const checkoutBase = locale === 'en' ? '/en/checkout' : '/checkout';

  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>{t.pricingLabel}</span>
          <h2 className={styles.sectionTitle}>{t.pricingTitle}</h2>
        </div>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {[...Array(8)].map((_, i) => (
              <span key={i} className={styles.marqueeItem}>
                <span className={styles.marqueeDot} />
                {t.pricingMarquee}
                <span className={styles.marqueeSep}>—</span>
                {t.pricingMarquee2}
                <span className={styles.marqueeSep}>—</span>
              </span>
            ))}
          </div>
        </div>
        <div className={styles.priceGrid}>
          {t.plans.map(p => (
            <div key={p.id} className={`${styles.priceCard} ${p.hl ? styles.priceCardHl : ''}`}>
              {p.badge && <div className={styles.priceBadge}>{p.badge}</div>}
              <h3 className={styles.priceName}>{p.name}</h3>
              <p className={styles.priceDesc}>{p.desc}</p>
              <div className={styles.priceAmount}>
                {t.currency === '$' ? `$${p.price}` : `${p.price.toLocaleString()} ${t.currency}`}
              </div>
              <ul className={styles.priceFeats}>{p.feat.map((f, i) => <li key={i}>{f}</li>)}</ul>
              <Link href={`${checkoutBase}?plan=${p.id}`} className={`${p.hl ? styles.btnPrimary : styles.btnOutline} ${styles.priceCta}`}>{p.cta}</Link>
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
function Footer({ t, locale }) {
  const privacyHref = locale === 'en' ? '/privacy' : '/privacy';
  const termsHref = locale === 'en' ? '/terms' : '/terms';

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div>
            <Logo className={styles.footerLogo} />
            <p className={styles.footerDesc}>{t.footerDesc}</p>
            <p className={styles.footerContact}>{t.footerContact} <a href="mailto:info@adgena.pro">info@adgena.pro</a></p>
          </div>
          <div className={styles.footerLinks}>
            <div><h4>{t.footerProduct}</h4><a href="#showcase">{t.nav.examples}</a><a href="#features">{t.nav.features}</a><a href="#pricing">{t.nav.pricing}</a></div>
            <div><h4>{t.footerLegal}</h4><Link href={privacyHref}>{t.footerPrivacy}</Link><Link href={termsHref}>{t.footerTerms}</Link></div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>{t.footerCopy.replace('{year}', new Date().getFullYear())}</p>
          <p className={styles.footerLegal}>{t.footerPayment} <Link href={termsHref}>{t.footerTermsLink}</Link> &bull; <Link href={privacyHref}>{t.footerPrivacyLink}</Link></p>
        </div>
      </div>
    </footer>
  );
}

// ========================================
// MAIN EXPORT
// ========================================
export default function LandingPage({ t, locale = 'ru' }) {
  return (
    <>
      <Header t={t} locale={locale} />
      <main>
        <Hero t={t} locale={locale} />
        <Showcase t={t} />
        <Features t={t} />
        <HowItWorks t={t} />
        <Pricing t={t} locale={locale} />
      </main>
      <Footer t={t} locale={locale} />
    </>
  );
}
