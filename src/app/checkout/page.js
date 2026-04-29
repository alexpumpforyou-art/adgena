'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PLANS = {
  lite:     { name: 'Лайт', price: 390, gens: 10 },
  standard: { name: 'Стандарт', price: 990, gens: 30 },
  pro:      { name: 'Про', price: 2490, gens: 80 },
  business: { name: 'Бизнес', price: 4990, gens: 200 },
};

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  const plan = PLANS[planId];

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) {
        // Not logged in — redirect to auth with return URL
        window.location.href = `/auth?redirect=/checkout?plan=${planId}`;
        return;
      }
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, [planId]);

  if (!plan) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Тариф не найден</h1>
          <p style={styles.desc}>Выберите тариф на <Link href="/#pricing" style={styles.link}>главной странице</Link>.</p>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ color: '#9ca3af', textAlign: 'center' }}>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (!agreed) return;
    setLoading(true);

    // Log consent
    try {
      await fetch('/api/robokassa/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
    } catch { /* non-critical */ }

    // Redirect to Robokassa
    window.location.href = `/api/robokassa/checkout?plan=${planId}`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.cardHeader}>
          <Link href="/" style={styles.logo}>
            <img src="/logo-icon.webp" alt="" width={24} height={24} />
            <span>Adgena</span>
          </Link>
        </div>

        <h1 style={styles.title}>Оформление подписки</h1>

        {/* Plan summary */}
        <div style={styles.planBox}>
          <div style={styles.planRow}>
            <span style={styles.planName}>{plan.name}</span>
            <span style={styles.planPrice}>{plan.price.toLocaleString()} ₽<span style={styles.perMonth}>/мес</span></span>
          </div>
          <div style={styles.planDetails}>
            <span>{plan.gens} генераций в месяц</span>
            <span>Автопродление каждые 30 дней</span>
          </div>
        </div>

        {/* User info */}
        <div style={styles.userBox}>
          <span style={styles.userLabel}>Аккаунт:</span>
          <span style={styles.userEmail}>{user?.email}</span>
        </div>

        {/* Subscription info */}
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            Оплата списывается <strong>автоматически каждые 30 дней</strong> с банковской карты. 
            Вы получите уведомление за 3 дня до списания. 
            Отменить подписку можно в любой момент в <Link href="/profile" style={styles.link}>профиле</Link>.
          </p>
        </div>

        {/* Consent checkbox — NOT pre-checked */}
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={styles.checkboxText}>
            Я согласен на автоматические списания согласно условиям{' '}
            <Link href="/terms" target="_blank" style={styles.link}>оферты</Link>.
            Списание {plan.price.toLocaleString()} ₽ будет производиться каждые 30 дней.
          </span>
        </label>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={!agreed || loading}
          style={{
            ...styles.payBtn,
            opacity: (!agreed || loading) ? 0.5 : 1,
            cursor: (!agreed || loading) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Переход к оплате...' : `Оплатить ${plan.price.toLocaleString()} ₽`}
        </button>

        {/* Links */}
        <div style={styles.links}>
          <Link href="/terms" target="_blank" style={styles.footerLink}>Оферта</Link>
          <span style={styles.linkSep}>•</span>
          <Link href="/privacy" target="_blank" style={styles.footerLink}>Конфиденциальность</Link>
          <span style={styles.linkSep}>•</span>
          <Link href="/" style={styles.footerLink}>На главную</Link>
        </div>

        <p style={styles.secureNote}>
          🔒 Безопасная оплата через Робокассу. Данные карты не хранятся на сервере.
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={styles.page}><p style={{ color: '#9ca3af' }}>Загрузка...</p></div>}>
      <CheckoutForm />
    </Suspense>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    maxWidth: 480,
    width: '100%',
    background: '#141419',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '32px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    color: '#fff',
    fontWeight: 800,
    fontSize: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#fff',
    textAlign: 'center',
    margin: '0 0 20px',
  },
  planBox: {
    background: 'linear-gradient(135deg, rgba(255,106,0,0.1) 0%, rgba(255,138,51,0.05) 100%)',
    border: '1px solid rgba(255,106,0,0.25)',
    borderRadius: 14,
    padding: '18px 20px',
    marginBottom: 16,
  },
  planRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 900,
    color: '#f97316',
  },
  perMonth: {
    fontSize: 13,
    fontWeight: 400,
    color: '#9ca3af',
  },
  planDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 8,
    fontSize: 13,
    color: '#9ca3af',
  },
  userBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#1a1a22',
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 13,
  },
  userLabel: {
    color: '#6b7280',
  },
  userEmail: {
    color: '#d1d5db',
    fontWeight: 600,
  },
  infoBox: {
    padding: '14px 16px',
    background: 'rgba(59,130,246,0.06)',
    border: '1px solid rgba(59,130,246,0.15)',
    borderRadius: 10,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#9ca3af',
    lineHeight: 1.6,
    margin: 0,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
    cursor: 'pointer',
    padding: '14px 16px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.1)',
    background: '#1a1a22',
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
    accentColor: '#f97316',
    cursor: 'pointer',
    flexShrink: 0,
  },
  checkboxText: {
    fontSize: 13,
    color: '#d1d5db',
    lineHeight: 1.6,
  },
  link: {
    color: '#f97316',
    textDecoration: 'underline',
  },
  payBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#fff',
    fontSize: 16,
    fontWeight: 800,
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    marginBottom: 16,
  },
  links: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  footerLink: {
    fontSize: 12,
    color: '#6b7280',
    textDecoration: 'none',
  },
  linkSep: {
    color: '#374151',
    fontSize: 12,
  },
  secureNote: {
    fontSize: 11,
    color: '#4b5563',
    textAlign: 'center',
    margin: 0,
  },
  desc: {
    color: '#9ca3af',
    textAlign: 'center',
    fontSize: 14,
  },
};
