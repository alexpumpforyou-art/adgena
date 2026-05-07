'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './SeoLandingPage.module.css';

export default function SeoLandingPage({ page }) {
  const [conceptThumbs, setConceptThumbs] = useState({});

  useEffect(() => {
    fetch('/api/admin/concepts')
      .then((r) => r.json())
      .then((d) => { if (d.thumbnails) setConceptThumbs(d.thumbnails); })
      .catch(() => {});
  }, []);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className={styles.hero}>
        <Link href="/" className={styles.logo}>
          <img src="/logo-icon.webp" alt="AdGena" />
          <span>AdGena</span>
        </Link>
        <p className={styles.kicker}>{page.kicker}</p>
        <h1>{page.h1}</h1>
        <p className={styles.lead}>{page.lead}</p>
        <div className={styles.actions}>
          <Link href="/auth" className={styles.primary}>Попробовать бесплатно</Link>
          <Link href="/#showcase" className={styles.secondary}>Смотреть примеры</Link>
        </div>
      </section>

      <section className={styles.grid}>
        {page.benefits.map((item) => (
          <article key={item.title} className={styles.card}>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className={styles.story}>
        <div>
          <p className={styles.kicker}>{page.storyKicker}</p>
          <h2>{page.storyTitle}</h2>
        </div>
        <p>{page.storyText}</p>
      </section>

      <section className={styles.section}>
        <h2>{page.examplesTitle}</h2>
        <div className={styles.examples}>
          {page.examples.map((item) => (
            <article key={item.title} className={styles.exampleCard}>
              <img
                src={conceptThumbs[item.conceptKey] || item.fallback}
                alt={`${item.title}: пример AdGena`}
                loading="lazy"
                className={styles.exampleImage}
              />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>{page.processTitle}</h2>
        <div className={styles.steps}>
          {page.steps.map((step, index) => (
            <div key={step} className={styles.step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Частые вопросы</h2>
        <div className={styles.faq}>
          {page.faq.map((item) => (
            <details key={item.q} className={styles.faqItem}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Что ещё можно сделать в AdGena</h2>
        <div className={styles.related}>
          {page.related.map((item) => (
            <Link key={item.href} href={item.href} className={styles.relatedCard}>
              <span>{item.label}</span>
              <small>{item.text}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <h2>{page.ctaTitle}</h2>
        <p>{page.ctaText}</p>
        <Link href="/auth" className={styles.primary}>Начать генерацию</Link>
      </section>
    </main>
  );
}
