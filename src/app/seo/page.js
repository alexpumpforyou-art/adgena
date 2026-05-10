import Link from 'next/link';
import { getPublishedContentPages } from '@/lib/db';
import styles from './SeoContentPage.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'SEO-гайды и AI-инструменты для рекламы — AdGena',
  description: 'Автоматически подготовленные гайды AdGena по карточкам товаров, рекламным креативам, баннерам и визуалам для маркетплейсов.',
  alternates: { canonical: '/seo' },
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
          <p className={styles.kicker}>SEO-гайды</p>
          <h1>AI-гайды по карточкам, баннерам и рекламным креативам</h1>
          <p className={styles.lead}>Здесь будут появляться опубликованные страницы из AI SEO Content Engine после модерации в админке.</p>
          <div className={styles.actions}>
            <Link href="/tools" className={styles.primary}>Открыть инструменты</Link>
            <Link href="/examples" className={styles.secondary}>Смотреть примеры</Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Опубликованные материалы</h2>
          <div className={styles.links}>
            {pages.length === 0 && <p>Пока нет опубликованных страниц. Сначала сгенерируйте draft и нажмите publish в админке.</p>}
            {pages.map((page) => (
              <Link key={page.id} href={`/seo/${page.slug}`} className={styles.linkCard}>{page.h1}</Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
