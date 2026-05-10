import Link from 'next/link';
import styles from './NewsPage.module.css';

export default function NewsArticlePage({ item }) {
  const body = item.body || {};
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.description,
    datePublished: item.published_at || item.created_at,
    dateModified: item.updated_at || item.created_at,
    author: { '@type': 'Organization', name: 'AdGena' },
  };

  return (
    <main className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <Link href="/" className={styles.logo}>
            <img src="/logo-icon.webp" alt="AdGena" />
            <span>AdGena</span>
          </Link>
          <p className={styles.kicker}>AI News Digest</p>
          <h1>{item.title}</h1>
          <p className={styles.lead}>{item.summary}</p>
          <div className={styles.actions}>
            <Link href="/tools" className={styles.primary}>Инструменты AdGena</Link>
            <Link href="/news" className={styles.secondary}>Все новости AI</Link>
          </div>
        </section>

        {!!body.sections?.length && body.sections.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}

        <section className={styles.section}>
          <h2>Как это связано с AdGena</h2>
          <p>{body.adgenaAngle}</p>
        </section>

        <section className={styles.section}>
          <h2>Источник</h2>
          <p>{body.sourceNote || item.source_name}</p>
          <a href={item.source_url} target="_blank" rel="nofollow noopener noreferrer" className={styles.source}>Открыть оригинальный источник</a>
        </section>

        <section className={styles.cta}>
          <h2>Создавайте AI-визуалы для товаров</h2>
          <p>AdGena помогает быстро делать карточки, рекламные баннеры и промо-креативы по фото товара.</p>
          <Link href="/auth" className={styles.primary}>Попробовать бесплатно</Link>
        </section>
      </div>
    </main>
  );
}
