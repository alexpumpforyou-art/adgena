import Link from 'next/link';
import { TOOL_PAGES } from '@/lib/toolPages';
import styles from '../examples/ExamplesPage.module.css';

export const metadata = {
  title: 'AI-инструменты для рекламы и карточек товаров — AdGena',
  description: 'Каталог AI-инструментов AdGena: генераторы карточек Wildberries и Ozon, рекламных баннеров, инфографики и креативов для разных ниш.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'AI-инструменты для рекламы и карточек товаров — AdGena',
    description: 'Выберите инструмент для генерации карточек, баннеров, инфографики или рекламного креатива.',
    url: '/tools',
    type: 'website',
  },
};

export default function Page() {
  const pages = Object.values(TOOL_PAGES);

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <Link href="/" className={styles.logo}>
            <img src="/logo-icon.webp" alt="AdGena" />
            <span>AdGena</span>
          </Link>
          <p className={styles.kicker}>AI-инструменты</p>
          <h1>Генераторы карточек, баннеров и рекламных креативов</h1>
          <p className={styles.lead}>Выберите страницу под вашу задачу: маркетплейсы, реклама, соцсети или нишевые промо-визуалы.</p>
          <div className={styles.actions}>
            <Link href="/auth" className={styles.primary}>Попробовать бесплатно</Link>
            <Link href="/examples" className={styles.secondary}>Смотреть примеры</Link>
          </div>
        </section>

        <section className={styles.grid}>
          {pages.map((item) => (
            <Link key={item.path} href={item.path} className={styles.card}>
              <div className={styles.cardBody}>
                <p className={styles.meta}><span>{item.kicker}</span></p>
                <h2>{item.h1}</h2>
                <p>{item.lead}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
