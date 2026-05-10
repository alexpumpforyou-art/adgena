'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../content/AdminContent.module.css';

export default function AdminNewsPage() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/news');
    const data = await res.json();
    if (data.success) setItems(data.items || []);
    else setMessage(data.error || 'Ошибка загрузки');
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    const res = await fetch('/api/admin/news', {
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
          <h1 className={styles.title}>AI News Digest</h1>
          <p>AI-новости из RSS, GPT-summary, quality score и ручная публикация.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin" className={styles.secondary}>← Админка</Link>
          <Link href="/news" className={styles.secondary}>/news</Link>
        </div>
      </header>

      {message && <div className={styles.panel}>{message}</div>}
      <div className={styles.panel}>
        CRON URL: /api/cron/generate-news?secret=CRON_SECRET&amp;limit=1
      </div>

      <section className={styles.list}>
        {loading && <div className={styles.panel}>Загрузка...</div>}
        {!loading && items.length === 0 && <div className={styles.panel}>Пока нет новостей.</div>}
        {items.map((item) => (
          <article key={item.id} className={styles.card}>
            <p className={styles.meta}>
              <span className={styles.badge}>{item.status}</span>
              <span className={styles.badge}>score {item.quality_score}</span>
              <span className={styles.badge}>{item.source_name}</span>
            </p>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <div className={styles.preview}>{item.description}</div>
            <div className={styles.actions}>
              {item.status !== 'published' && <button className={styles.button} onClick={() => updateStatus(item.id, 'published')}>Publish</button>}
              {item.status !== 'draft' && <button className={styles.secondary} onClick={() => updateStatus(item.id, 'draft')}>Draft</button>}
              {item.status !== 'rejected' && <button className={styles.danger} onClick={() => updateStatus(item.id, 'rejected')}>Reject</button>}
              {item.status === 'published' && <Link href={`/news/${item.slug}`} className={styles.secondary}>Открыть</Link>}
              <a href={item.source_url} target="_blank" rel="noreferrer" className={styles.secondary}>Источник</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
