import Link from 'next/link';
import styles from './SeoContentPage.module.css';

export default function SeoGeneratedPage({ page }) {
  const body = page.body || {};
  const faq = body.faq || [];
  const faqJsonLd = faq.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  } : null;

  return (
    <main className={styles.page}>
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <Link href="/" className={styles.logo}>
            <img src="/logo-icon.webp" alt="AdGena" />
            <span>AdGena</span>
          </Link>
          <p className={styles.kicker}>Блог AdGena</p>
          <h1>{page.h1}</h1>
          <p className={styles.lead}>{page.lead}</p>
          <div className={styles.actions}>
            <Link href="/auth" className={styles.primary}>Попробовать бесплатно</Link>
            <Link href="/tools" className={styles.secondary}>Все инструменты</Link>
          </div>
        </section>

        {!!body.benefits?.length && (
          <section className={styles.grid}>
            {body.benefits.map((item) => (
              <article key={item.title} className={styles.card}>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </section>
        )}

        {!!body.sections?.length && body.sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}

        {!!body.steps?.length && (
          <section className={styles.section}>
            <h2>Как использовать</h2>
            <div className={styles.steps}>
              {body.steps.map((step, index) => <div key={step} className={styles.step}>{index + 1}. {step}</div>)}
            </div>
          </section>
        )}

        {!!faq.length && (
          <section className={styles.section}>
            <h2>Частые вопросы</h2>
            <div className={styles.faq}>
              {faq.map((item) => (
                <details key={item.q} className={styles.faqItem}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2>Полезные разделы AdGena</h2>
          <div className={styles.links}>
            <Link href="/tools" className={styles.linkCard}>Каталог AI-инструментов</Link>
            <Link href="/examples" className={styles.linkCard}>Примеры AI-креативов</Link>
            <Link href="/tools/generator-reklamnyh-bannerov" className={styles.linkCard}>Генератор рекламных баннеров</Link>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>{body.ctaTitle || 'Создайте первый визуал в AdGena'}</h2>
          <p>{body.ctaText || 'Загрузите фото товара и получите AI-визуал для карточки, рекламы или соцсетей.'}</p>
          <Link href="/auth" className={styles.primary}>Начать генерацию</Link>
        </section>
      </div>
    </main>
  );
}
