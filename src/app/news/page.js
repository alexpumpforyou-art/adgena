import Link from 'next/link';
import { getPublishedNewsItems } from '@/lib/db';
import styles from './NewsPage.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'AI News Digest — новости AI для маркетинга и e-commerce | AdGena',
  description: 'Короткие разборы новостей AI с практическими выводами для рекламы, карточек товаров, визуального контента и e-commerce.',
  alternates: { canonical: '/news' },
};

export default function Page() {
  const items = getPublishedNewsItems(100);

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <Link href="/" className={styles.logo}>
            <img src="/logo-icon.webp" alt="AdGena" />
            <span>AdGena</span>
          </Link>
          <p className={styles.kicker}>AI News Digest</p>
          <h1>Новости AI для маркетинга, рекламы и e-commerce</h1>
          <p className={styles.lead}>Короткие разборы AI-новостей: что произошло, почему это важно и как это может повлиять на визуальный контент, рекламу и карточки товаров.</p>
          <div className={styles.actions}>
            <Link href="/tools" className={styles.primary}>Открыть инструменты</Link>
            <Link href="/examples" className={styles.secondary}>Смотреть примеры</Link>
          </div>
        </section>

        <section className={styles.grid}>
          {items.length === 0 && <p>Пока нет опубликованных AI-новостей. Они появятся после генерации и публикации в админке.</p>}
          {items.map((item) => (
            <Link key={item.id} href={`/news/${item.slug}`} className={styles.card}>
              <p className={styles.meta}><span>{item.source_name}</span><span>score {item.quality_score}</span></p>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
