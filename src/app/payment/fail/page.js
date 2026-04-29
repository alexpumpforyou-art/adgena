'use client';

import Link from 'next/link';

export default function PaymentFailPage() {
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
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 40, marginBottom: 24,
      }}>
        ✕
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28, fontWeight: 800,
        marginBottom: 12,
      }}>
        Оплата не прошла
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 400, marginBottom: 32, lineHeight: 1.6 }}>
        Платёж был отменён или произошла ошибка. Попробуйте ещё раз или выберите другой способ оплаты.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/#pricing"
          style={{
            display: 'inline-flex',
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: '#fff',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Попробовать снова
        </Link>
        <Link
          href="/dashboard"
          style={{
            display: 'inline-flex',
            padding: '14px 28px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
            border: '1px solid var(--border-default)',
          }}
        >
          В генератор
        </Link>
      </div>
    </div>
  );
}
