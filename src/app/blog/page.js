import Link from 'next/link';
import { getPublishedContentPages } from '@/lib/db';
import styles from './SeoContentPage.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Блог AdGena — гайды по AI-рекламе и визуалам для товаров',
  description: 'Практические гайды AdGena по карточкам товаров, рекламным креативам, баннерам, визуалам для маркетплейсов и AI-инструментам.',
  alternates: { canonical: '/blog' },
};

export default function Page() {
  const pages = getPublishedContentPages(200);

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <Link href="/" className={styles.logo}>
            <img src="/logo-icon.webp" alt="AdGena" />
            <span>AdGena</span>
          </Link>
          <p className={styles.kicker}>Блог AdGena</p>
          <h1>Гайды по AI-рекламе, карточкам товаров и визуалам</h1>
          <p className={styles.lead}>Практические материалы о том, как использовать AI для карточек товаров, рекламных баннеров, промо-креативов и визуального контента.</p>
          <div className={styles.actions}>
            <Link href="/tools" className={styles.primary}>Открыть инструменты</Link>
            <Link href="/examples" className={styles.secondary}>Смотреть примеры</Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Материалы блога</h2>
          <div className={styles.links}>
            {pages.length === 0 && <p>Скоро здесь появятся практические материалы по AI-визуалам и рекламе.</p>}
            {pages.map((page) => (
              <Link key={page.id} href={`/blog/${page.slug}`} className={styles.linkCard}>{page.h1}</Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
