import Link from 'next/link';
import { EXAMPLE_CASES } from '@/lib/exampleCases';
import styles from './ExamplesPage.module.css';

export const metadata = {
  title: 'Примеры AI-креативов и карточек товаров — AdGena',
  description: 'Галерея примеров AdGena: карточки товаров, рекламные креативы, промо-визуалы и AI-подача для разных ниш.',
  alternates: { canonical: '/examples' },
  openGraph: {
    title: 'Примеры AI-креативов и карточек товаров — AdGena',
    description: 'Смотрите примеры AI-визуалов для маркетплейсов, рекламы и соцсетей.',
    url: '/examples',
    type: 'website',
  },
};

export default function Page() {
  const cases = Object.values(EXAMPLE_CASES);

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <Link href="/" className={styles.logo}>
            <img src="/logo-icon.webp" alt="AdGena" />
            <span>AdGena</span>
          </Link>
          <p className={styles.kicker}>Галерея примеров</p>
          <h1>Примеры AI-креативов для товаров, рекламы и маркетплейсов</h1>
          <p className={styles.lead}>Смотрите, как обычные фото товаров можно превратить в карточки, промо-баннеры и визуалы для соцсетей с помощью AdGena.</p>
          <div className={styles.actions}>
            <Link href="/auth" className={styles.primary}>Попробовать бесплатно</Link>
            <Link href="/tools/generator-reklamnyh-bannerov" className={styles.secondary}>Открыть генератор баннеров</Link>
          </div>
        </section>

        <section className={styles.grid}>
          {cases.map((item) => (
            <Link key={item.path} href={item.path} className={styles.card}>
              <img src={item.afterImage} alt={item.title} />
              <div className={styles.cardBody}>
                <p className={styles.meta}><span>{item.niche}</span><span>{item.platform}</span></p>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
