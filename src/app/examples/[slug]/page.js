import Link from 'next/link';
import { notFound } from 'next/navigation';
import { EXAMPLE_CASES, EXAMPLE_CASE_SLUGS } from '@/lib/exampleCases';
import styles from '../ExamplesPage.module.css';

export function generateStaticParams() {
  return EXAMPLE_CASE_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const item = EXAMPLE_CASES[params.slug];

  if (!item) {
    return {};
  }

  return {
    title: `${item.title} — пример AdGena`,
    description: item.description,
    alternates: { canonical: item.path },
    openGraph: {
      title: `${item.title} — пример AdGena`,
      description: item.description,
      url: item.path,
      images: [{ url: item.afterImage }],
      type: 'article',
    },
  };
}

export default function Page({ params }) {
  const item = EXAMPLE_CASES[params.slug];

  if (!item) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: item.title,
    description: item.description,
    image: item.afterImage,
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
          <p className={styles.kicker}>{item.niche}</p>
          <h1>{item.title}</h1>
          <p className={styles.lead}>{item.summary}</p>
          <div className={styles.actions}>
            <Link href="/auth" className={styles.primary}>Создать похожий креатив</Link>
            <Link href={item.relatedTool} className={styles.secondary}>Открыть подходящий инструмент</Link>
          </div>
        </section>

        <section className={styles.caseHero}>
          <div className={styles.imageBox}>
            <img src={item.beforeImage} alt={`${item.title}: исходное фото`} />
            <span>Исходное фото</span>
          </div>
          <div className={styles.imageBox}>
            <img src={item.afterImage} alt={`${item.title}: результат AdGena`} />
            <span>Результат AdGena</span>
          </div>
        </section>

        <section className={styles.panel}>
          <p className={styles.meta}><span>{item.platform}</span><span>{item.niche}</span></p>
          <h2>Где использовать такой визуал</h2>
          <ul className={styles.list}>
            {item.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}
          </ul>
        </section>

        <section className={styles.scriptBox}>
          <h2>Пакет для Reels, Shorts или поста</h2>
          <p>{item.caption}</p>
          <div className={styles.actions}>
            {item.hashtags.map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Сделайте похожий креатив в AdGena</h2>
          <p>Загрузите фото товара, выберите стиль и получите визуал для карточки, рекламы или соцсетей.</p>
          <Link href="/auth" className={styles.primary}>Начать генерацию</Link>
        </section>
      </div>
    </main>
  );
}
