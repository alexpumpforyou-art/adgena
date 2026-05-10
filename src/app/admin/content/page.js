'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './AdminContent.module.css';

export default function AdminContentPage() {
  const [pages, setPages] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [seed, setSeed] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/content');
    const data = await res.json();
    if (data.success) {
      setPages(data.pages || []);
      setKeywords(data.keywords || []);
    } else {
      setMessage(data.error || 'Ошибка загрузки');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addKeywords = async () => {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'seed', keywords: seed }),
    });
    const data = await res.json();
    setMessage(data.success ? `Добавлено ключей: ${data.added}` : data.error);
    setSeed('');
    load();
  };

  const updateStatus = async (id, status) => {
    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', id, status }),
    });
    const data = await res.json();
    setMessage(data.success ? `Статус обновлён: ${status}` : data.error);
    load();
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>AI SEO Content Engine</h1>
          <p>Генерация draft-страниц через cron, ручная публикация после проверки.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin" className={styles.secondary}>← Админка</Link>
          <Link href="/seo" className={styles.secondary}>/seo</Link>
        </div>
      </header>

      {message && <div className={styles.panel}>{message}</div>}

      <div className={styles.grid}>
        <aside className={styles.panel}>
          <h2>Ключевые слова</h2>
          <textarea className={styles.textarea} value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="Каждый ключ с новой строки" />
          <button className={styles.button} onClick={addKeywords}>Добавить ключи</button>
          <p>CRON URL:</p>
          <div className={styles.preview}>/api/cron/generate-content?secret=CRON_SECRET&amp;limit=3</div>
          <p>Всего ключей: {keywords.length}</p>
        </aside>

        <section className={styles.list}>
          {loading && <div className={styles.panel}>Загрузка...</div>}
          {!loading && pages.length === 0 && <div className={styles.panel}>Пока нет сгенерированных страниц.</div>}
          {pages.map((page) => (
            <article key={page.id} className={styles.card}>
              <p className={styles.meta}>
                <span className={styles.badge}>{page.status}</span>
                <span className={styles.badge}>{page.keyword}</span>
                {page.model && <span className={styles.badge}>{page.model}</span>}
              </p>
              <h2>{page.h1}</h2>
              <p>{page.description}</p>
              <div className={styles.preview}>{page.lead}</div>
              <div className={styles.actions}>
                {page.status !== 'published' && <button className={styles.button} onClick={() => updateStatus(page.id, 'published')}>Publish</button>}
                {page.status !== 'draft' && <button className={styles.secondary} onClick={() => updateStatus(page.id, 'draft')}>Draft</button>}
                {page.status !== 'rejected' && <button className={styles.danger} onClick={() => updateStatus(page.id, 'rejected')}>Reject</button>}
                {page.status === 'published' && <Link href={`/seo/${page.slug}`} className={styles.secondary}>Открыть</Link>}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
