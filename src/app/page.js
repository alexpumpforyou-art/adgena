'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={`container ${styles.headerInner}`}>
        <Link href="/" className={styles.headerLogo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>AdGena</span>
        </Link>
        <nav className={styles.headerNav}>
          <a href="#features">Возможности</a>
          <a href="#pricing">Тарифы</a>
        </nav>
        <div className={styles.headerActions}>
          <Link href="/dashboard" className="btn btn-primary">Попробовать</Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  const [idx, setIdx] = useState(0);
  const items = ['карточки WB', 'креативы FB', 'баннеры Ozon'];
  useEffect(() => { const t = setInterval(() => setIdx(p => (p+1)%3), 2500); return () => clearInterval(t); }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroBg}><div className={styles.orb1}/><div className={styles.orb2}/><div className={styles.grid}/></div>
      <div className={`container ${styles.heroContent}`}>
        <div className={styles.badge}><span className={styles.dot}/>AI-генератор нового поколения</div>
        <h1 className={styles.heroTitle}>Создавайте <span className="gradient-text">{items[idx]}</span><br/>за 30 секунд</h1>
        <p className={styles.heroSub}>Загрузите фото товара → выберите шаблон → получите готовую карточку с продающим текстом от AI</p>
        <div className={styles.heroActions}>
          <Link href="/dashboard" className="btn btn-primary btn-lg">⚡ Начать бесплатно</Link>
          <a href="#features" className="btn btn-secondary btn-lg">Узнать больше</a>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}><span className={styles.statNum}>30 сек</span><span className={styles.statLabel}>На карточку</span></div>
          <div className={styles.statDiv}/>
          <div className={styles.stat}><span className={styles.statNum}>9 000+</span><span className={styles.statLabel}>Селлеров</span></div>
          <div className={styles.statDiv}/>
          <div className={styles.stat}><span className={styles.statNum}>x3.2</span><span className={styles.statLabel}>Рост CTR</span></div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: '🎨', title: 'Удаление фона', desc: 'AI мгновенно убирает фон с фото товара', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { icon: '✍️', title: 'AI-копирайтинг', desc: 'Продающие заголовки, буллеты и SEO-описания', grad: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
    { icon: '📐', title: 'Все площадки', desc: 'WB, Ozon, Яндекс, Facebook, VK, Telegram Ads', grad: 'linear-gradient(135deg,#f59e0b,#f97316)' },
    { icon: '📦', title: 'Batch-генерация', desc: 'Загрузите 50 фото — получите 50 карточек', grad: 'linear-gradient(135deg,#10b981,#14b8a6)' },
    { icon: '🖼️', title: 'AI-фоны', desc: 'Генерация уникальных фонов через Nano Banana Pro', grad: 'linear-gradient(135deg,#6c5ce7,#a29bfe)' },
    { icon: '🔧', title: 'Онлайн-редактор', desc: 'Drag & drop, текст, слои — упрощённая Figma', grad: 'linear-gradient(135deg,#3b82f6,#06b6d4)' },
  ];

  return (
    <section className={styles.features} id="features">
      <div className="container">
        <div className={styles.sectionHdr}>
          <span className={styles.tag}>Возможности</span>
          <h2 className={styles.sectionTitle}>Всё для <span className="gradient-text">идеальных карточек</span></h2>
        </div>
        <div className={styles.featGrid}>
          {features.map((f,i) => (
            <div key={i} className={styles.featCard} style={{animationDelay:`${i*80}ms`}}>
              <div className={styles.featIcon} style={{background:f.grad}}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n:'01', title:'Загрузите фото', desc:'PNG, JPG, WebP — перетащите или вставьте ссылку', icon:'📸' },
    { n:'02', title:'Выберите шаблон', desc:'WB, Ozon или рекламный креатив для таргета', icon:'🎨' },
    { n:'03', title:'AI делает магию', desc:'Удаление фона, текст, оформление — автоматически', icon:'✨' },
    { n:'04', title:'Скачайте результат', desc:'Готовая карточка в нужном формате', icon:'📥' },
  ];

  return (
    <section className={styles.howItWorks}>
      <div className="container">
        <div className={styles.sectionHdr}>
          <span className={styles.tag}>Как это работает</span>
          <h2 className={styles.sectionTitle}>Четыре шага до <span className="gradient-text">результата</span></h2>
        </div>
        <div className={styles.stepsGrid}>
          {steps.map((s,i) => (
            <div key={i} className={styles.stepCard}>
              <div className={styles.stepNum}>{s.n}</div>
              <div className={styles.stepEmoji}>{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const [ru, setRu] = useState(true);
  const plans = [
    { id:'free', name:'Free', price:0, desc:'Попробуйте бесплатно', feat:['5 генераций/мес','Базовые шаблоны','Водяной знак','Экспорт JPG'], cta:'Начать бесплатно' },
    { id:'starter', name:'Starter', price:990, desc:'Для начинающих', feat:['50 генераций/мес','Все шаблоны','Без водяного знака','Экспорт PNG/JPG','Удаление фона'], cta:'Выбрать' },
    { id:'pro', name:'Pro', price:2490, desc:'Для активных продавцов', feat:['200 генераций/мес','AI-копирайтинг','AI-фоны','Приоритет','Batch-генерация','История'], cta:'Выбрать', hl:true, badge:'Популярный' },
    { id:'business', name:'Business', price:4990, desc:'Для команд', feat:['500 генераций/мес','API доступ','Brand Kit','Кастом шаблоны','Приоритет поддержка','Мульти-юзеры'], cta:'Выбрать' },
  ];

  return (
    <section className={styles.pricing} id="pricing">
      <div className="container">
        <div className={styles.sectionHdr}>
          <span className={styles.tag}>Тарифы</span>
          <h2 className={styles.sectionTitle}>Прозрачные <span className="gradient-text">цены</span></h2>
        </div>
        <div className={styles.payToggle}>
          <button className={`${styles.payBtn} ${ru?styles.payBtnActive:''}`} onClick={()=>setRu(true)}>🇷🇺 Robokassa</button>
          <button className={`${styles.payBtn} ${!ru?styles.payBtnActive:''}`} onClick={()=>setRu(false)}>🌍 Stripe</button>
        </div>
        <div className={styles.priceGrid}>
          {plans.map(p => (
            <div key={p.id} className={`${styles.priceCard} ${p.hl?styles.priceCardHl:''}`}>
              {p.badge && <div className={styles.priceBadge}>{p.badge}</div>}
              <h3>{p.name}</h3>
              <p className={styles.priceDesc}>{p.desc}</p>
              <div className={styles.priceAmount}>{p.price?`${p.price.toLocaleString()} ₽`:'Бесплатно'}{p.price>0&&<span>/мес</span>}</div>
              <ul className={styles.priceFeats}>{p.feat.map((f,i)=><li key={i}>✓ {f}</li>)}</ul>
              <Link href={p.id==='free'?'/dashboard':`/api/checkout?plan=${p.id}&provider=${ru?'robokassa':'stripe'}`} className={`btn ${p.hl?'btn-primary':'btn-secondary'} ${styles.priceCta}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerInner}>
          <div><div className={styles.headerLogo}><span className={styles.logoIcon}>⚡</span><span className={styles.logoText}>AdGena</span></div>
          <p className={styles.footerDesc}>AI-платформа для карточек товара и рекламных креативов</p></div>
          <div className={styles.footerLinks}>
            <div><h4>Продукт</h4><a href="#features">Возможности</a><a href="#pricing">Тарифы</a></div>
            <div><h4>Юридическое</h4><a href="#">Политика конфиденциальности</a><a href="#">Оферта</a></div>
          </div>
        </div>
        <div className={styles.footerBot}><p>© {new Date().getFullYear()} AdGena</p></div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
        <PricingSection />
      </main>
      <Footer />
    </>
  );
}
