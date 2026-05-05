'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ym) window.ym(109048904, 'reachGoal', 'payment');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, marginBottom: 24,
      }}>
        ✓
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28, fontWeight: 800,
        marginBottom: 12,
      }}>
        Оплата успешна!
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 400, marginBottom: 32, lineHeight: 1.6 }}>
        Ваш тариф активирован. Генерации обновлены — можете начинать работу прямо сейчас.
      </p>
      <Link
        href="/dashboard"
        style={{
          display: 'inline-flex',
          padding: '14px 32px',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: '#fff',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 15,
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
      >
        Перейти в генератор →
      </Link>
    </div>
  );
}
