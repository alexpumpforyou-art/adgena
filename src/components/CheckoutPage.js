'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const PLANS_RU = {
  lite:     { name: 'Лайт', price: 390, gens: 10 },
  standard: { name: 'Стандарт', price: 990, gens: 30 },
  pro:      { name: 'Про', price: 2490, gens: 80 },
  business: { name: 'Бизнес', price: 4990, gens: 200 },
};

const PLANS_EN = {
  lite:     { name: 'Lite', price: 4.5, gens: 10 },
  standard: { name: 'Standard', price: 11.5, gens: 30 },
  pro:      { name: 'Pro', price: 29, gens: 80 },
  business: { name: 'Business', price: 58, gens: 200 },
};

function CheckoutForm({ locale = 'ru' }) {
  const isEn = locale === 'en';
  const PLANS = isEn ? PLANS_EN : PLANS_RU;
  const homeUrl = isEn ? '/en' : '/';
  const authUrl = isEn ? '/en/auth' : '/auth';
  const checkoutUrl = isEn ? '/en/checkout' : '/checkout';

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
        window.location.href = `${authUrl}?redirect=${checkoutUrl}?plan=${planId}`;
        return;
      }
      setUser(data.user);
      setCheckingAuth(false);
    });
  }, [planId]);

  if (!plan) {
    return (
      <div style={pageStyles.page}>
        <div style={pageStyles.card}>
          <h1 style={pageStyles.title}>{isEn ? 'Plan not found' : 'Тариф не найден'}</h1>
          <p style={pageStyles.desc}>
            {isEn ? 'Choose a plan on the ' : 'Выберите тариф на '}
            <Link href={`${homeUrl}#pricing`} style={pageStyles.link}>
              {isEn ? 'main page' : 'главной странице'}
            </Link>.
          </p>
        </div>
      </div>
    );
  }

  if (checkingAuth) {
    return (
      <div style={pageStyles.page}>
        <div style={pageStyles.card}>
          <p style={{ color: '#9ca3af', textAlign: 'center' }}>
            {isEn ? 'Checking authorization...' : 'Проверка авторизации...'}
          </p>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      await fetch('/api/robokassa/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
    } catch { /* non-critical */ }
    window.location.href = `/api/robokassa/checkout?plan=${planId}`;
  };

  return (
    <div style={pageStyles.page}>
      <div style={pageStyles.card}>
        <div style={pageStyles.cardHeader}>
          <Link href={homeUrl} style={pageStyles.logo}>
            <img src="/logo-icon.webp" alt="" width={24} height={24} />
            <span>Adgena</span>
          </Link>
        </div>

        <h1 style={pageStyles.title}>{isEn ? 'Subscribe' : 'Оформление подписки'}</h1>

        <div style={pageStyles.planBox}>
          <div style={pageStyles.planRow}>
            <span style={pageStyles.planName}>{plan.name}</span>
            <span style={pageStyles.planPrice}>{isEn ? `$${plan.price}` : `${plan.price.toLocaleString()} ₽`}<span style={pageStyles.perMonth}>{isEn ? '/mo' : '/мес'}</span></span>
          </div>
          <div style={pageStyles.planDetails}>
            <span>{plan.gens} {isEn ? 'generations per month' : 'генераций в месяц'}</span>
            <span>{isEn ? 'Auto-renews every 30 days' : 'Автопродление каждые 30 дней'}</span>
          </div>
        </div>

        <div style={pageStyles.userBox}>
          <span style={pageStyles.userLabel}>{isEn ? 'Account:' : 'Аккаунт:'}</span>
          <span style={pageStyles.userEmail}>{user?.email}</span>
        </div>

        <div style={pageStyles.infoBox}>
          <p style={pageStyles.infoText}>
            {isEn ? (
              <>Payment is charged <strong>automatically every 30 days</strong> from your bank card. You will be notified 3 days before the charge. You can cancel anytime in your <Link href="/profile" style={pageStyles.link}>profile</Link>.</>
            ) : (
              <>Оплата списывается <strong>автоматически каждые 30 дней</strong> с банковской карты. Вы получите уведомление за 3 дня до списания. Отменить подписку можно в любой момент в <Link href="/profile" style={pageStyles.link}>профиле</Link>.</>
            )}
          </p>
        </div>

        <label style={pageStyles.checkboxLabel}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={pageStyles.checkbox} />
          <span style={pageStyles.checkboxText}>
            {isEn ? (
              <>I agree to automatic charges per the <Link href="/terms" target="_blank" style={pageStyles.link}>terms of service</Link>. ${plan.price} will be charged every 30 days.</>
            ) : (
              <>Я согласен на автоматические списания согласно условиям <Link href="/terms" target="_blank" style={pageStyles.link}>оферты</Link>. Списание {plan.price.toLocaleString()} ₽ будет производиться каждые 30 дней.</>
            )}
          </span>
        </label>

        <button
          onClick={handlePay}
          disabled={!agreed || loading}
          style={{
            ...pageStyles.payBtn,
            opacity: (!agreed || loading) ? 0.5 : 1,
            cursor: (!agreed || loading) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading
            ? (isEn ? 'Redirecting to payment...' : 'Переход к оплате...')
            : (isEn ? `Pay $${plan.price}` : `Оплатить ${plan.price.toLocaleString()} ₽`)}
        </button>

        <div style={pageStyles.links}>
          <Link href="/terms" target="_blank" style={pageStyles.footerLink}>{isEn ? 'Terms' : 'Оферта'}</Link>
          <span style={pageStyles.linkSep}>•</span>
          <Link href="/privacy" target="_blank" style={pageStyles.footerLink}>{isEn ? 'Privacy' : 'Конфиденциальность'}</Link>
          <span style={pageStyles.linkSep}>•</span>
          <Link href={homeUrl} style={pageStyles.footerLink}>{isEn ? 'Home' : 'На главную'}</Link>
        </div>

        <p style={pageStyles.secureNote}>
          {isEn ? '🔒 Secure payment via Robokassa. Card data is not stored on our server.' : '🔒 Безопасная оплата через Робокассу. Данные карты не хранятся на сервере.'}
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPageComponent({ locale = 'ru' }) {
  return (
    <Suspense fallback={<div style={pageStyles.page}><p style={{ color: '#9ca3af' }}>{locale === 'en' ? 'Loading...' : 'Загрузка...'}</p></div>}>
      <CheckoutForm locale={locale} />
    </Suspense>
  );
}

const pageStyles = {
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
