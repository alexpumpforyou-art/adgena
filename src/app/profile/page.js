'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './profile.module.css';
import { IconCrown, IconShield, IconUser, IconMail } from '@/components/Icons';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSending, setTicketSending] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [referral, setReferral] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCard, setWithdrawCard] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!data.user) { router.push('/auth'); return; }
      setUser(data.user);
      setLoading(false);
    });
    fetch('/api/tickets').then(r => r.json()).then(data => {
      if (data.tickets) setTickets(data.tickets);
    });
    fetch('/api/referral').then(r => r.json()).then(data => {
      if (data.referral) setReferral(data.referral);
    });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSending(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setTicketSuccess('Тикет создан! Мы ответим в ближайшее время.');
        setTicketSubject('');
        setTicketMessage('');
        setShowTicketForm(false);
        // Refresh tickets
        const r2 = await fetch('/api/tickets');
        const d2 = await r2.json();
        if (d2.tickets) setTickets(d2.tickets);
      }
    } catch {
      // ignore
    } finally {
      setTicketSending(false);
    }
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (!user) return null;

  const initials = (user.name || user.email || '?').charAt(0).toUpperCase();
  const planNames = { free: 'Бесплатный', lite: 'Лайт', standard: 'Стандарт', pro: 'Про', business: 'Бизнес' };
  const usedPercent = user.generations_limit > 0
    ? Math.round((user.generations_used / user.generations_limit) * 100)
    : 0;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/dashboard" className={styles.headerLogo}>
          <img src="/logo-icon.webp" alt="" width={28} height={28} />
          <span>Adgena</span>
        </Link>
        <div className={styles.headerRight}>
          <Link href="/dashboard" className={styles.headerBtn}>← Генератор</Link>
        </div>
      </header>

      <main className={styles.main}>
        {/* Avatar + Name */}
        <div className={styles.profileHead}>
          <div className={styles.avatar}>{initials}</div>
          <h1 className={styles.userName}>{user.name || 'Пользователь'}</h1>
          <p className={styles.userEmail}>{user.email}</p>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{user.generations_used}</span>
            <span className={styles.statLabel}>Генераций</span>
          </div>
          <div className={`${styles.statCard} ${styles.statCardAccent}`}>
            <span className={styles.statValue}>{user.generations_limit - user.generations_used}</span>
            <span className={styles.statLabel}>Осталось</span>
          </div>
        </div>

        {/* Plan Bar */}
        <div className={styles.planSection}>
          <div className={styles.planHeader}>
            <span className={styles.planName}>Тариф: {planNames[user.plan] || user.plan}</span>
            <span className={styles.planUsage}>{user.generations_used}/{user.generations_limit}</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${Math.min(usedPercent, 100)}%` }} />
          </div>
        </div>

        {/* Info Cards */}
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>Данные аккаунта</h3>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>ID</span>
              <span className={styles.infoValue}>{user.id?.slice(0, 8)}...</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Зарегистрирован</span>
              <span className={styles.infoValue}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('ru') : '—'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Роль</span>
              <span className={styles.infoValue}>
                {user.role === 'admin' ? <><IconCrown size={14} /> Админ</> : user.role === 'support' ? <><IconShield size={14} /> Саппорт</> : <><IconUser size={14} /> Пользователь</>}
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div className={styles.infoCard}>
            <h3>Обратная связь</h3>
            <p className={styles.infoDesc}>Нашли баг? Есть предложение? Напишите нам!</p>
            <button
              className={styles.feedbackBtn}
              onClick={() => { setShowTicketForm(!showTicketForm); setTicketSuccess(''); }}
            >
              <IconMail size={14} /> Создать тикет
            </button>

            {ticketSuccess && <p className={styles.successMsg}>{ticketSuccess}</p>}
          </div>
        </div>

        {/* Ticket Form */}
        {showTicketForm && (
          <div className={styles.ticketForm}>
            <h3>Новый тикет</h3>
            <form onSubmit={handleCreateTicket}>
              <input
                type="text"
                className={styles.input}
                placeholder="Тема обращения"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
              />
              <textarea
                className={styles.textarea}
                placeholder="Опишите проблему или предложение..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                rows={4}
                required
              />
              <div className={styles.ticketActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowTicketForm(false)}>Отмена</button>
                <button type="submit" className={styles.submitBtn} disabled={ticketSending}>
                  {ticketSending ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        {tickets.length > 0 && (
          <div className={styles.ticketsList}>
            <h3>Мои тикеты</h3>
            {tickets.map(t => (
              <div key={t.id} className={styles.ticketItem}>
                <div className={styles.ticketInfo}>
                  <span className={styles.ticketSubject}>{t.subject}</span>
                  <span className={styles.ticketDate}>
                    {new Date(t.created_at).toLocaleDateString('ru')}
                  </span>
                </div>
                <span className={`${styles.ticketStatus} ${styles[`status_${t.status}`]}`}>
                  {t.status === 'open' ? '🟢 Открыт' : t.status === 'answered' ? '🔵 Ответ' : '⚫ Закрыт'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade Plans */}
        <div className={styles.upgradeSection}>
          <h3>Тарифные планы</h3>
          <p className={styles.upgradeDesc}>Выберите тариф и получите генерации мгновенно. Подписка продлевается автоматически.</p>
          <div className={styles.upgradeGrid}>
            {[
              { id: 'lite', name: 'Лайт', price: 390, gens: 10, desc: 'Для пробы' },
              { id: 'standard', name: 'Стандарт', price: 990, gens: 30, desc: 'Для серии товаров', hl: true },
              { id: 'pro', name: 'Про', price: 2490, gens: 80, desc: 'Оптимальный выбор' },
              { id: 'business', name: 'Бизнес', price: 4990, gens: 200, desc: 'Максимум' },
            ].map(p => (
              <div key={p.id} className={`${styles.upgradeCard} ${p.hl ? styles.upgradeCardHl : ''} ${user.plan === p.id ? styles.upgradeCardActive : ''}`}>
                <span className={styles.upgradeName}>{p.name}</span>
                <span className={styles.upgradePrice}>{p.price.toLocaleString()} ₽<small>/мес</small></span>
                <span className={styles.upgradeGens}>{p.gens} генераций</span>
                {user.plan === p.id ? (
                  <span className={styles.upgradeCurrent}>Текущий</span>
                ) : (
                  <a href={`/checkout?plan=${p.id}`} className={styles.upgradeBtn}>
                    {['lite', 'standard', 'pro', 'business'].indexOf(p.id) > ['lite', 'standard', 'pro', 'business'].indexOf(user.plan) ? 'Улучшить' : 'Выбрать'}
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Subscription status */}
          {user.plan !== 'free' && (
            <div className={styles.subscriptionInfo}>
              <p>Подписка: <strong>{planNames[user.plan] || user.plan}</strong> — автопродление включено</p>
              <button
                className={styles.cancelSubBtn}
                onClick={async () => {
                  if (!confirm('Отменить подписку? Тариф останется до конца периода, потом вернётся на бесплатный.')) return;
                  const res = await fetch('/api/robokassa/cancel', { method: 'POST' });
                  const data = await res.json();
                  if (data.success) {
                    alert('Подписка отменена');
                    window.location.reload();
                  }
                }}
              >
                Отменить подписку
              </button>
            </div>
          )}
        </div>

        {/* Referral Program */}
        {referral && (
          <div className={styles.upgradeSection}>
            <h3>Реферальная программа</h3>
            <p className={styles.upgradeDesc}>Приглашайте друзей и получайте 15% от каждого их платежа.</p>

            <div className={styles.referralStats}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{referral.referralsCount}</span>
                <span className={styles.statLabel}>Приглашённых</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{referral.totalEarned.toFixed(0)} ₽</span>
                <span className={styles.statLabel}>Всего заработано</span>
              </div>
              <div className={`${styles.statCard} ${styles.statCardAccent}`}>
                <span className={styles.statValue}>{referral.balance.toFixed(0)} ₽</span>
                <span className={styles.statLabel}>Доступно к выводу</span>
              </div>
            </div>

            <div className={styles.referralLinkBox}>
              <label className={styles.referralLabel}>Ваша реферальная ссылка:</label>
              <div className={styles.referralLinkRow}>
                <input type="text" readOnly value={referral.link} className={styles.referralInput} />
                <button
                  className={styles.referralCopyBtn}
                  onClick={() => { navigator.clipboard.writeText(referral.link); }}
                >
                  Копировать
                </button>
              </div>
            </div>

            {referral.balance >= 100 && (
              <div className={styles.withdrawBox}>
                <h4 style={{margin: '0 0 12px'}}>Вывод средств</h4>
                <input
                  type="number"
                  placeholder="Сумма (мин. 100 ₽)"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className={styles.input}
                  min={100}
                  max={referral.balance}
                />
                <input
                  type="text"
                  placeholder="Номер карты"
                  value={withdrawCard}
                  onChange={e => setWithdrawCard(e.target.value)}
                  className={styles.input}
                />
                {withdrawMsg && <p className={styles.withdrawMsg}>{withdrawMsg}</p>}
                <button
                  className={styles.upgradeBtn}
                  style={{marginTop: 8}}
                  onClick={async () => {
                    const res = await fetch('/api/referral', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ amount: parseFloat(withdrawAmount), cardInfo: withdrawCard }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setWithdrawMsg(data.message);
                      setWithdrawAmount(''); setWithdrawCard('');
                      fetch('/api/referral').then(r => r.json()).then(d => { if (d.referral) setReferral(d.referral); });
                    } else {
                      setWithdrawMsg(data.error || 'Ошибка');
                    }
                  }}
                >
                  Запросить вывод
                </button>
              </div>
            )}

            {referral.rewards?.length > 0 && (
              <div className={styles.referralHistory}>
                <h4 style={{margin: '16px 0 8px'}}>Последние начисления</h4>
                {referral.rewards.map((r, i) => (
                  <div key={i} className={styles.referralRow}>
                    <span>{r.referred_email}</span>
                    <span style={{color: '#22c55e', fontWeight: 700}}>+{r.amount.toFixed(0)} ₽</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Logout */}
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </main>
    </div>
  );
}
