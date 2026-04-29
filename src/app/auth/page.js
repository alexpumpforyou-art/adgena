'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './auth.module.css';

const OAUTH_ERRORS = {
  google_not_configured: 'Google авторизация ещё не настроена. Используйте email.',
  google_denied: 'Вы отменили вход через Google.',
  google_token_failed: 'Ошибка получения токена Google.',
  google_no_email: 'Не удалось получить email из Google.',
  google_failed: 'Ошибка авторизации через Google.',
  yandex_not_configured: 'Яндекс авторизация ещё не настроена. Используйте email.',
  yandex_denied: 'Вы отменили вход через Яндекс.',
  yandex_token_failed: 'Ошибка получения токена Яндекс.',
  yandex_no_email: 'Не удалось получить email из Яндекс.',
  yandex_failed: 'Ошибка авторизации через Яндекс.',
};

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState('email'); // 'email' | 'code' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const errCode = searchParams.get('error');
    if (errCode && OAUTH_ERRORS[errCode]) {
      setError(OAUTH_ERRORS[errCode]);
    }
  }, [searchParams]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Send verification code
  const handleSendCode = async () => {
    if (!email) { setError('Введите email'); return; }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStep('code');
        setSuccess(`Код отправлен на ${email}`);
        setCountdown(60);
      } else {
        setError(data.error || 'Не удалось отправить код');
      }
    } catch {
      setError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Verify code
  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) { setError('Введите 6-значный код'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (data.verified) {
        setStep('password');
        setSuccess('Email подтверждён! Задайте пароль.');
        setError('');
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  };

  // Final registration (after code verified)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) { setError('Пароль минимум 6 символов'); return; }
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, verified: true }),
      });
      const data = await res.json();

      if (data.success) {
        const redirectUrl = searchParams.get('redirect');
        window.location.href = redirectUrl || '/dashboard';
      } else {
        setError(data.error || 'Ошибка регистрации');
      }
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  };

  // Login (no verification needed)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        const redirectUrl = searchParams.get('redirect');
        window.location.href = redirectUrl || '/dashboard';
      } else {
        setError(data.error || 'Неверный email или пароль');
      }
    } catch {
      setError('Ошибка сети.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setStep('email');
    setError('');
    setSuccess('');
    setCode('');
  };

  // Registration title/subtitle by step
  const getRegisterTitle = () => {
    if (step === 'email') return 'Регистрация';
    if (step === 'code') return 'Подтверждение';
    return 'Завершение';
  };

  const getRegisterSubtitle = () => {
    if (step === 'email') return 'Укажите email для получения кода';
    if (step === 'code') return `Введите 6-значный код, отправленный на ${email}`;
    return 'Задайте пароль для входа';
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.headerLogo}>
          <img src="/logo-icon.webp" alt="" width={32} height={32} />
          <span>Adgena</span>
        </Link>
        <Link href="/" className={styles.headerBtn}>На главную</Link>
      </header>

      {/* Auth Card */}
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            {mode === 'login' ? 'Авторизация' : getRegisterTitle()}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Для доступа к сервису необходимо войти'
              : getRegisterSubtitle()}
          </p>

          {/* ===== LOGIN MODE ===== */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className={styles.form}>
              <input
                type="email"
                className={styles.input}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <input
                type="password"
                className={styles.input}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Загрузка...' : 'Войти'}
              </button>
            </form>
          )}

          {/* ===== REGISTER: STEP 1 — Email ===== */}
          {mode === 'register' && step === 'email' && (
            <div className={styles.form}>
              <input
                type="email"
                className={styles.input}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="button"
                className={styles.submitBtn}
                disabled={loading || !email}
                onClick={handleSendCode}
              >
                {loading ? 'Отправка...' : 'Получить код'}
              </button>
            </div>
          )}

          {/* ===== REGISTER: STEP 2 — Code ===== */}
          {mode === 'register' && step === 'code' && (
            <div className={styles.form}>
              {success && <p className={styles.success}>{success}</p>}

              <input
                type="text"
                className={styles.codeInput}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
                autoFocus
              />

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="button"
                className={styles.submitBtn}
                disabled={loading || code.length !== 6}
                onClick={handleVerifyCode}
              >
                {loading ? 'Проверка...' : 'Подтвердить'}
              </button>

              <button
                type="button"
                className={styles.resendBtn}
                disabled={countdown > 0}
                onClick={handleSendCode}
              >
                {countdown > 0 ? `Отправить повторно (${countdown}с)` : 'Отправить код повторно'}
              </button>
            </div>
          )}

          {/* ===== REGISTER: STEP 3 — Password ===== */}
          {mode === 'register' && step === 'password' && (
            <form onSubmit={handleRegister} className={styles.form}>
              {success && <p className={styles.success}>{success}</p>}

              <input
                type="text"
                className={styles.input}
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                autoFocus
              />
              <input
                type="password"
                className={styles.input}
                placeholder="Пароль (мин. 6 символов)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <input
                type="password"
                className={styles.input}
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Создание...' : 'Создать аккаунт'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className={styles.divider}>
            <span>или</span>
          </div>

          {/* OAuth Buttons */}
          <div className={styles.oauthRow}>
            <button
              className={`${styles.oauthBtn} ${styles.oauthYandex}`}
              onClick={() => handleOAuth('yandex')}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M13.32 7.67h-.94c-1.75 0-2.67.98-2.67 2.41 0 1.56.68 2.35 2.1 3.39l1.17.82-3.36 5.27H7.23l3.05-4.6c-1.81-1.36-2.82-2.63-2.82-4.78 0-2.76 1.88-4.51 5.13-4.51h2.87V19.6h-2.14V7.67z"/>
              </svg>
              <span>Яндекс ID</span>
            </button>
            <button
              className={`${styles.oauthBtn} ${styles.oauthGoogle}`}
              onClick={() => handleOAuth('google')}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>
          </div>

          {/* Terms */}
          <p className={styles.terms}>
            Продолжая, вы соглашаетесь с{' '}
            <a href="/terms" className={styles.link}>Условиями использования</a>{' '}
            и{' '}
            <a href="/privacy" className={styles.link}>Политикой конфиденциальности</a>
          </p>

          {/* Toggle mode */}
          <div className={styles.toggle}>
            {mode === 'login' ? (
              <>
                Нет аккаунта?{' '}
                <button className={styles.toggleBtn} onClick={() => switchMode('register')}>
                  Зарегистрироваться
                </button>
              </>
            ) : (
              <>
                Уже есть аккаунт?{' '}
                <button className={styles.toggleBtn} onClick={() => switchMode('login')}>
                  Войти
                </button>
              </>
            )}
          </div>
        </div>

        {/* Back link */}
        <Link href="/" className={styles.backLink}>
          ← Вернуться на главную
        </Link>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>© 2026 Adgena</span>
        <div className={styles.footerLinks}>
          <a href="/privacy">Конфиденциальность</a>
          <a href="/terms">Условия</a>
          <a href="/offer">Оферта</a>
        </div>
      </footer>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} />}>
      <AuthForm />
    </Suspense>
  );
}
