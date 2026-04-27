'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

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
        <Link href="/" className={styles.logo}>AdGena</Link>
        <nav className={styles.nav}>
          <a href="#examples">Примеры</a>
          <a href="#features">Возможности</a>
          <a href="#pricing">Тарифы</a>
        </nav>
        <div className={styles.headerActions}>
          <Link href="/dashboard" className={styles.btnPrimary}>Попробовать</Link>
        </div>
      </div>
    </header>
  );
}

// ========================================
// HERO
// ========================================

function Hero() {
  const words = ['фото товара', 'карточки WB', 'креативы Ozon', 'рекламные баннеры'];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(p => (p + 1) % words.length), 2800); return () => clearInterval(t); }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        {/* Left: text */}
        <div className={styles.heroText}>
          <p className={styles.heroLabel}>AI-платформа для маркетплейсов</p>
          <h1 className={styles.heroTitle}>
            Создавайте<br />
            <span className={styles.heroAccent} key={idx}>{words[idx]}</span><br />
            за секунды
          </h1>
          <p className={styles.heroDesc}>
            Загрузите фото товара — получите профессиональные карточки, lifestyle-фото и рекламные креативы. Без дизайнера, без фотографа.
          </p>
          <div className={styles.heroCta}>
            <Link href="/dashboard" className={styles.btnPrimary}>Начать бесплатно</Link>
            <a href="#examples" className={styles.btnGhost}>Смотреть примеры</a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><span className={styles.statNum}>30с</span><span className={styles.statLabel}>на генерацию</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>8</span><span className={styles.statLabel}>категорий</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>x3</span><span className={styles.statLabel}>рост CTR</span></div>
          </div>
        </div>

        {/* Right: example showcase */}
        <div className={styles.heroShowcase}>
          <div className={styles.showcaseCard}>
            <div className={styles.showcaseBefore}>
              <span className={styles.showcaseTag}>Исходное фото</span>
              <div className={styles.placeholder} style={{aspectRatio:'3/4'}} />
            </div>
            <div className={styles.showcaseArrow}>&rarr;</div>
            <div className={styles.showcaseAfter}>
              <span className={styles.showcaseTag}>Результат AI</span>
              <div className={styles.placeholder} style={{aspectRatio:'3/4'}} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================
// EXAMPLES GALLERY
// ========================================

function Examples() {
  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'photo', name: 'Фото' },
    { id: 'card', name: 'Карточки' },
    { id: 'ads', name: 'Реклама' },
  ];
  const [active, setActive] = useState('all');

  const examples = [
    { id: 1, cat: 'photo', label: 'Одежда — На модели', ratio: '3/4' },
    { id: 2, cat: 'photo', label: 'Косметика — В окружении', ratio: '1/1' },
    { id: 3, cat: 'card',  label: 'Карточка WB — Классик', ratio: '3/4' },
    { id: 4, cat: 'ads',   label: 'Баннер — Распродажа', ratio: '1/1' },
    { id: 5, cat: 'photo', label: 'Гаджет — Студийно', ratio: '3/4' },
    { id: 6, cat: 'card',  label: 'Карточка Ozon — Премиум', ratio: '3/4' },
    { id: 7, cat: 'ads',   label: 'Stories — Вертикальный', ratio: '9/16' },
    { id: 8, cat: 'photo', label: 'Еда — Сервировка', ratio: '1/1' },
  ];

  const filtered = active === 'all' ? examples : examples.filter(e => e.cat === active);

  return (
    <section className={styles.examples} id="examples">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>001 / Примеры</span>
          <h2 className={styles.sectionTitle}>Реальные результаты генерации</h2>
          <p className={styles.sectionDesc}>Каждое изображение создано AI на основе одного фото товара</p>
        </div>

        <div className={styles.filterRow}>
          {categories.map(c => (
            <button
              key={c.id}
              className={`${styles.filterBtn} ${active === c.id ? styles.filterBtnActive : ''}`}
              onClick={() => setActive(c.id)}
            >{c.name}</button>
          ))}
        </div>

        <div className={styles.examplesGrid}>
          {filtered.map((ex, i) => (
            <div key={ex.id} className={styles.exampleCard} style={{animationDelay: `${i * 60}ms`}}>
              <div className={styles.placeholder} style={{aspectRatio: ex.ratio}} />
              <div className={styles.exampleMeta}>
                <span className={styles.exampleLabel}>{ex.label}</span>
                <span className={styles.exampleBadge}>{ex.cat === 'photo' ? 'Фото' : ex.cat === 'card' ? 'Карточка' : 'Реклама'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========================================
// BEFORE/AFTER
// ========================================

function BeforeAfter() {
  const pairs = [
    { before: 'Обычное фото с телефона', after: 'Профессиональное lifestyle-фото', label: 'Косметика' },
    { before: 'Фото на белом фоне', after: 'Карточка с инфографикой', label: 'Одежда' },
    { before: 'Снимок из дома', after: 'Рекламный баннер', label: 'Гаджеты' },
  ];

  return (
    <section className={styles.beforeAfter}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>002 / До и после</span>
          <h2 className={styles.sectionTitle}>Одно фото — бесконечные возможности</h2>
        </div>
        <div className={styles.pairsGrid}>
          {pairs.map((p, i) => (
            <div key={i} className={styles.pairCard}>
              <div className={styles.pairSide}>
                <span className={styles.pairTag}>До</span>
                <div className={styles.placeholder} style={{aspectRatio: '4/5'}} />
                <p className={styles.pairDesc}>{p.before}</p>
              </div>
              <div className={styles.pairArrow}>&rarr;</div>
              <div className={styles.pairSide}>
                <span className={styles.pairTag}>После</span>
                <div className={styles.placeholder} style={{aspectRatio: '4/5'}} />
                <p className={styles.pairDesc}>{p.after}</p>
              </div>
              <span className={styles.pairLabel}>{p.label}</span>
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
    { title: 'Категории товаров', desc: '8 категорий с уникальными настройками: одежда, косметика, гаджеты, еда и другие', num: '8' },
    { title: 'Концепции съёмки', desc: 'На модели, в интерьере, раскладка сверху, крупный план, каталог — под каждую категорию', num: '30+' },
    { title: 'Рекламные форматы', desc: 'Распродажа, минимализм Apple-стиль, вертикальные stories — готовые к запуску', num: '3' },
    { title: 'Форматы вывода', desc: '9:16, 3:4, 1:1, 4:3, 16:9 — под WB, Ozon, Instagram, Facebook, VK', num: '5' },
    { title: 'Улучшения', desc: 'Напишите что изменить — AI перегенерирует с учётом ваших пожеланий', num: 'V2' },
    { title: 'История версий', desc: 'Все генерации сохраняются — переключайтесь между версиями в один клик', num: 'V0-Vn' },
  ];

  return (
    <section className={styles.features} id="features">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>003 / Возможности</span>
          <h2 className={styles.sectionTitle}>Всё что нужно для продаж</h2>
        </div>
        <div className={styles.featGrid}>
          {features.map((f, i) => (
            <div key={i} className={styles.featCard} style={{animationDelay: `${i * 80}ms`}}>
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
    { n: '01', title: 'Загрузите фото', desc: 'Любое фото товара — с телефона, из каталога, с белым фоном' },
    { n: '02', title: 'Настройте', desc: 'Выберите категорию, концепцию, формат — всё на одном экране' },
    { n: '03', title: 'Генерируйте', desc: 'AI создаст профессиональное изображение за 30 секунд' },
    { n: '04', title: 'Улучшайте', desc: 'Допишите пожелание — AI доработает результат' },
  ];

  return (
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>004 / Процесс</span>
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
    { id: 'starter', name: 'Starter', price: 990, desc: 'Для начинающих', feat: ['50 генераций/мес', 'Все концепции', 'Все форматы', 'Без водяного знака', 'Улучшения'], cta: 'Выбрать' },
    { id: 'pro', name: 'Pro', price: 2490, desc: 'Для активных продавцов', feat: ['200 генераций/мес', 'Все возможности', 'AI-карточки', 'Рекламные форматы', 'История версий', 'Приоритет'], cta: 'Выбрать', hl: true, badge: 'Популярный' },
    { id: 'business', name: 'Business', price: 4990, desc: 'Для команд', feat: ['500 генераций/мес', 'API доступ', 'Мульти-юзеры', 'Кастом стили', 'Приоритет поддержка', 'Brand Kit'], cta: 'Выбрать' },
  ];

  return (
    <section className={styles.pricing} id="pricing">
      <div className={styles.container}>
        <div className={styles.sectionHead}>
          <span className={styles.sectionLabel}>005 / Тарифы</span>
          <h2 className={styles.sectionTitle}>Прозрачные цены</h2>
        </div>
        <div className={styles.priceGrid}>
          {plans.map(p => (
            <div key={p.id} className={`${styles.priceCard} ${p.hl ? styles.priceCardHl : ''}`}>
              {p.badge && <div className={styles.priceBadge}>{p.badge}</div>}
              <h3 className={styles.priceName}>{p.name}</h3>
              <p className={styles.priceDesc}>{p.desc}</p>
              <div className={styles.priceAmount}>
                {p.price ? `${p.price.toLocaleString()} ₽` : 'Бесплатно'}
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
            <span className={styles.footerLogo}>AdGena</span>
            <p className={styles.footerDesc}>AI-платформа для создания карточек товара и рекламных креативов</p>
          </div>
          <div className={styles.footerLinks}>
            <div>
              <h4>Продукт</h4>
              <a href="#examples">Примеры</a>
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
          <p>&copy; {new Date().getFullYear()} AdGena. Все права защищены.</p>
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
        <Examples />
        <BeforeAfter />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
