'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editPlan, setEditPlan] = useState('free');
  const [editLimit, setEditLimit] = useState(5);
  const [editRole, setEditRole] = useState('user');

  // History & Impersonate
  const [historyUser, setHistoryUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Tickets
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Prompts
  const [prompts, setPrompts] = useState(null);
  const [promptOverrides, setPromptOverrides] = useState({});
  const [openPrompt, setOpenPrompt] = useState(null);
  const [editingPromptText, setEditingPromptText] = useState('');
  const [savingPrompt, setSavingPrompt] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setStats(data.stats);
      } else {
        setError(data.error || 'Доступ запрещён');
        if (res.status === 403) router.push('/auth');
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const res = await fetch('/api/admin/tickets');
      const data = await res.json();
      if (data.tickets) setTickets(data.tickets);
    } catch { /* ignore */ }
  };

  const loadPrompts = async () => {
    try {
      const res = await fetch('/api/admin/prompts');
      const data = await res.json();
      if (data.prompts) setPrompts(data.prompts);
      if (data.overrides) setPromptOverrides(data.overrides);
    } catch { /* ignore */ }
  };

  const handleSavePrompt = async (key) => {
    setSavingPrompt(true);
    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: editingPromptText }),
      });
      const data = await res.json();
      if (data.overrides) setPromptOverrides(data.overrides);
    } catch { /* ignore */ }
    setSavingPrompt(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (activeTab === 'tickets' && tickets.length === 0) loadTickets();
    if (activeTab === 'prompts' && !prompts) loadPrompts();
  }, [activeTab]);

  const handleUpdateUser = async (userId) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan: editPlan, generationsLimit: editLimit }),
    });
    // Update role
    await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setRole', userId, role: editRole }),
    });
    setEditingUser(null);
    loadData();
  };

  const handleResetGenerations = async (userId) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, resetGenerations: true }),
    });
    loadData();
  };

  const handleDeleteUser = async (userId, email) => {
    if (!confirm(`Удалить пользователя ${email}?`)) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    loadData();
  };

  const handleViewHistory = async (user) => {
    setHistoryUser(user);
    setLoadingHistory(true);
    setUserHistory([]);
    try {
      const res = await fetch(`/api/admin/users/history?userId=${user.id}`);
      const data = await res.json();
      if (data.history) setUserHistory(data.history);
    } catch { /* ignore */ }
    setLoadingHistory(false);
  };

  const handleImpersonate = async (userId) => {
    if (!confirm('Войти как этот пользователь? Вы будете перенаправлены в дашборд.')) return;
    try {
      const res = await fetch('/api/admin/users/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/dashboard';
      } else {
        alert(data.error || 'Ошибка входа');
      }
    } catch (err) {
      alert('Ошибка соединения');
    }
  };

  const handleViewTicket = async (ticketId) => {
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'details', ticketId }),
    });
    const data = await res.json();
    if (data.ticket) setSelectedTicket(data.ticket);
  };

  const handleReplyTicket = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reply', ticketId: selectedTicket.id, message: replyText }),
    });
    setReplyText('');
    handleViewTicket(selectedTicket.id);
    loadTickets();
  };

  const handleCloseTicket = async (ticketId) => {
    await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', ticketId, status: 'closed' }),
    });
    loadTickets();
    setSelectedTicket(null);
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const planColors = {
    free: '#6b7280', lite: '#38bdf8', standard: '#3b82f6', pro: '#f59e0b',
    business: '#8b5cf6', unlimited: '#10b981',
  };

  if (loading) return <div className={styles.page}><div className={styles.loading}>Загрузка...</div></div>;
  if (error) return <div className={styles.page}><div className={styles.error}>{error}</div></div>;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.headerLogo}>
            <img src="/logo-icon.webp" alt="" width={28} height={28} />
            <span>AdGena Admin</span>
          </Link>
        </div>
        <Link href="/dashboard" className={styles.headerBtn}>← Дашборд</Link>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'users' ? styles.tabActive : ''}`} onClick={() => setActiveTab('users')}>
          👤 Пользователи
        </button>
        <button className={`${styles.tab} ${activeTab === 'tickets' ? styles.tabActive : ''}`} onClick={() => setActiveTab('tickets')}>
          🎫 Тикеты {tickets.filter(t => t.status === 'open').length > 0 && <span className={styles.tabBadge}>{tickets.filter(t => t.status === 'open').length}</span>}
        </button>
        <button className={`${styles.tab} ${activeTab === 'prompts' ? styles.tabActive : ''}`} onClick={() => setActiveTab('prompts')}>
          📝 Промпты
        </button>
        <button className={`${styles.tab} ${activeTab === 'infra' ? styles.tabActive : ''}`} onClick={() => setActiveTab('infra')}>
          🏗️ Инфраструктура
        </button>
      </div>

      {/* ===== TAB: USERS ===== */}
      {activeTab === 'users' && (
        <>
          {/* Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.totalUsers || 0}</span>
              <span className={styles.statLabel}>Пользователей</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.totalGenerations || 0}</span>
              <span className={styles.statLabel}>Всего генераций</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{stats.todayGenerations || 0}</span>
              <span className={styles.statLabel}>За сегодня</span>
            </div>
          </div>

          {/* Search */}
          <div className={styles.toolbar}>
            <input
              type="text" className={styles.search}
              placeholder="Поиск по email или имени..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
            <span className={styles.count}>{filteredUsers.length} из {users.length}</span>
          </div>

          {/* Users Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th><th>Имя</th><th>Роль</th><th>План</th><th>Генерации</th><th>Регистрация</th><th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td className={styles.emailCell}>{u.email}</td>
                    <td>{u.name || '—'}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[`role_${u.role || 'user'}`]}`}>
                        {u.role === 'admin' ? '👑' : u.role === 'support' ? '🛡️' : '👤'} {u.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <span className={styles.planBadge} style={{ borderColor: planColors[u.plan] || '#666', color: planColors[u.plan] || '#666' }}>
                        {u.plan}
                      </span>
                    </td>
                    <td><span className={styles.genCount}>{u.generations_used} / {u.generations_limit}</span></td>
                    <td className={styles.dateCell}>{new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className={styles.actionsCell}>
                      <button className={styles.actionBtn} onClick={() => { setEditingUser(u.id); setEditPlan(u.plan); setEditLimit(u.generations_limit); setEditRole(u.role || 'user'); }} title="Редактировать">✏️</button>
                      <button className={styles.actionBtn} onClick={() => handleViewHistory(u)} title="История">📄</button>
                      <button className={styles.actionBtn} onClick={() => handleImpersonate(u.id)} title="Войти как">👤</button>
                      <button className={styles.actionBtn} onClick={() => handleResetGenerations(u.id)} title="Сбросить генерации">🔄</button>
                      <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDeleteUser(u.id, u.email)} title="Удалить">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===== TAB: TICKETS ===== */}
      {activeTab === 'tickets' && (
        <div className={styles.ticketsSection}>
          {!selectedTicket ? (
            <>
              <h2 className={styles.sectionTitle}>Тикеты поддержки</h2>
              {tickets.length === 0 && <p className={styles.emptyMsg}>Тикетов нет</p>}
              {tickets.map(t => (
                <div key={t.id} className={styles.ticketRow} onClick={() => handleViewTicket(t.id)}>
                  <div className={styles.ticketRowInfo}>
                    <span className={styles.ticketRowSubject}>{t.subject}</span>
                    <span className={styles.ticketRowMeta}>{t.email} • {new Date(t.created_at).toLocaleDateString('ru')}</span>
                  </div>
                  <span className={`${styles.ticketRowStatus} ${styles[`ts_${t.status}`]}`}>
                    {t.status === 'open' ? '🟢 Открыт' : t.status === 'answered' ? '🔵 Ответ' : '⚫ Закрыт'}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <div className={styles.ticketDetail}>
              <button className={styles.backBtn} onClick={() => setSelectedTicket(null)}>← Назад</button>
              <h2 className={styles.ticketTitle}>{selectedTicket.subject}</h2>
              <p className={styles.ticketMeta}>От: {selectedTicket.email} ({selectedTicket.name || '—'}) • Статус: {selectedTicket.status}</p>

              <div className={styles.messages}>
                {selectedTicket.messages?.map(m => (
                  <div key={m.id} className={`${styles.msg} ${m.is_staff ? styles.msgStaff : styles.msgUser}`}>
                    <span className={styles.msgSender}>{m.is_staff ? '🛡️ Поддержка' : `👤 ${m.sender_email}`}</span>
                    <p className={styles.msgText}>{m.message}</p>
                    <span className={styles.msgTime}>{new Date(m.created_at).toLocaleString('ru')}</span>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className={styles.replyBox}>
                  <textarea
                    className={styles.replyInput}
                    rows={3}
                    placeholder="Ответ..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className={styles.replyActions}>
                    <button className={styles.closeTicketBtn} onClick={() => handleCloseTicket(selectedTicket.id)}>Закрыть тикет</button>
                    <button className={styles.replyBtn} onClick={handleReplyTicket} disabled={!replyText.trim()}>Ответить</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB: PROMPTS ===== */}
      {activeTab === 'prompts' && (
        <div className={styles.promptsSection}>
          <h2 className={styles.sectionTitle}>Промпты генерации</h2>
          <p className={styles.promptsDesc}>Нажмите на промпт для просмотра и редактирования. Измените текст и сохраните.</p>

          {!prompts ? (
            <p className={styles.emptyMsg}>Загрузка...</p>
          ) : (
            <>
              {Object.entries(prompts).map(([type, concepts]) => (
                <div key={type} className={styles.promptGroup}>
                  <h3 className={styles.promptGroupTitle}>
                    {type === 'photo' ? '📸 Фото' : type === 'card' ? '🃏 Карточки' : '📢 Реклама'}
                  </h3>
                  {Object.entries(concepts).map(([id, text]) => {
                    const promptKey = `${type}.${id}`;
                    const isOpen = openPrompt === promptKey;
                    const hasOverride = promptOverrides[promptKey];
                    return (
                      <div key={id} className={styles.promptItem}>
                        <button
                          className={styles.promptToggle}
                          onClick={() => {
                            if (isOpen) {
                              setOpenPrompt(null);
                            } else {
                              setOpenPrompt(promptKey);
                              setEditingPromptText(hasOverride || text);
                            }
                          }}
                        >
                          <span>{id} {hasOverride ? '✏️' : ''}</span>
                          <span>{isOpen ? '▲' : '▼'}</span>
                        </button>
                        {isOpen && (
                          <div className={styles.promptEditor}>
                            <textarea
                              className={styles.promptTextarea}
                              rows={12}
                              value={editingPromptText}
                              onChange={(e) => setEditingPromptText(e.target.value)}
                            />
                            <div className={styles.promptActions}>
                              {hasOverride && (
                                <button
                                  className={styles.promptResetBtn}
                                  onClick={() => {
                                    setEditingPromptText(text);
                                    handleSavePrompt(promptKey).then(() => setEditingPromptText(text));
                                    const newOverrides = {...promptOverrides};
                                    delete newOverrides[promptKey];
                                    setPromptOverrides(newOverrides);
                                  }}
                                >
                                  Сбросить
                                </button>
                              )}
                              <button
                                className={styles.promptSaveBtn}
                                disabled={savingPrompt}
                                onClick={() => handleSavePrompt(promptKey)}
                              >
                                {savingPrompt ? 'Сохраняю...' : '💾 Сохранить'}
                              </button>
                            </div>
                            {hasOverride && (
                              <p className={styles.promptOverrideHint}>✏️ Используется кастомный промпт</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ===== TAB: INFRASTRUCTURE ===== */}
      {activeTab === 'infra' && (
        <div className={styles.promptsSection}>
          <h2 className={styles.sectionTitle}>🏗️ Инфраструктура проекта</h2>
          <p className={styles.promptsDesc}>
            Справка по всем используемым сервисам, чтобы ничего не забыть. Обновляйте при изменениях.
          </p>

          <div className={styles.infraGrid}>
            {/* Domain & DNS */}
            <div className={styles.infraCard}>
              <h3 className={styles.infraTitle}>🌐 Домен и DNS</h3>
              <div className={styles.infraRow}><span className={styles.infraKey}>Регистратор</span><span className={styles.infraVal}>reg.ru</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Домен</span><span className={styles.infraVal}>adgena.pro</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>NS-серверы</span><span className={styles.infraVal}>Cloudflare (oaklyn / terry .ns.cloudflare.com)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>DNS-управление</span><a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className={styles.infraLink}>dash.cloudflare.com →</a></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>SSL</span><span className={styles.infraVal}>Let&apos;s Encrypt (auto через Caddy)</span></div>
              <div className={styles.infraNote}>⚠️ A-записи @ и www указывают на VPS-прокси (5.188.27.14), Proxy: DNS only (серое облако)</div>
            </div>

            {/* App hosting */}
            <div className={styles.infraCard}>
              <h3 className={styles.infraTitle}>🚀 Хостинг приложения</h3>
              <div className={styles.infraRow}><span className={styles.infraKey}>Платформа</span><span className={styles.infraVal}>Railway</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Регион</span><span className={styles.infraVal}>EU West (Amsterdam)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Auto-домен</span><span className={styles.infraVal}>adgena-production.up.railway.app</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Custom domain</span><span className={styles.infraVal}>adgena.pro</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Реплики</span><span className={styles.infraVal}>1 × 8 vCPU</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Volume</span><span className={styles.infraVal}>adgena-volume → /app/data (SQLite)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Auto-deploy</span><span className={styles.infraVal}>GitHub main → push</span></div>
              <div className={styles.infraRow}><a href="https://railway.app/dashboard" target="_blank" rel="noreferrer" className={styles.infraLink}>railway.app/dashboard →</a></div>
            </div>

            {/* Russia proxy */}
            <div className={styles.infraCard}>
              <h3 className={styles.infraTitle}>🛡️ Прокси для РФ</h3>
              <div className={styles.infraRow}><span className={styles.infraKey}>Провайдер</span><span className={styles.infraVal}>FastVPS (RU-SMART-10, ~165₽/мес)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>IP</span><span className={styles.infraVal}>5.188.27.14</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>OS</span><span className={styles.infraVal}>Ubuntu 22.04</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Локация</span><span className={styles.infraVal}>Россия (Москва)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Прокси</span><span className={styles.infraVal}>Caddy 2 в Docker</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Конфиги</span><span className={styles.infraVal}>/opt/adgena-proxy/ (Caddyfile, docker-compose.yml, .env)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Команды</span><span className={styles.infraVal}>cd /opt/adgena-proxy &amp;&amp; docker compose logs -f</span></div>
              <div className={styles.infraNote}>💡 Зачем: TLS терминируется в РФ → DPI РКН не блокирует SSL-handshake до Railway (EU)</div>
            </div>

            {/* Storage */}
            <div className={styles.infraCard}>
              <h3 className={styles.infraTitle}>📦 Хранилище файлов</h3>
              <div className={styles.infraRow}><span className={styles.infraKey}>Текущее</span><span className={styles.infraVal}>Cloudflare R2 (bucket: adgena-files)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Public URL</span><span className={styles.infraVal}>files.adgena.pro (CF custom domain)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Запланировано</span><span className={styles.infraVal}>⚠️ Миграция на Yandex Object Storage</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Yandex bucket</span><span className={styles.infraVal}>adgena-files (создан, не подключён)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Yandex URL</span><span className={styles.infraVal}>storage.yandexcloud.net/adgena-files</span></div>
              <div className={styles.infraNote}>⏳ TODO: Создать сервисный аккаунт + ключ в Yandex Cloud, прописать STORAGE_PROVIDER=yandex и S3_* переменные в Railway</div>
            </div>

            {/* Database */}
            <div className={styles.infraCard}>
              <h3 className={styles.infraTitle}>💾 База данных</h3>
              <div className={styles.infraRow}><span className={styles.infraKey}>Тип</span><span className={styles.infraVal}>SQLite (better-sqlite3)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Файл</span><span className={styles.infraVal}>/app/data/adgena.db (Railway volume)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Таблицы</span><span className={styles.infraVal}>users, generations, tickets, sessions</span></div>
              <div className={styles.infraNote}>⚠️ При &gt;200 одновременных юзеров мигрировать на PostgreSQL (Railway Managed Postgres ~$5/мес или Yandex Managed PostgreSQL)</div>
            </div>

            {/* AI Generation */}
            <div className={styles.infraCard}>
              <h3 className={styles.infraTitle}>🤖 AI-генерация</h3>
              <div className={styles.infraRow}><span className={styles.infraKey}>Провайдер</span><span className={styles.infraVal}>APIYI (api.apiyi.com)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Основная модель</span><span className={styles.infraVal}>gpt-image-2 (через images.edit API)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Fallback</span><span className={styles.infraVal}>gemini-3-pro-image-preview</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Env</span><span className={styles.infraVal}>APIYI_API_KEY, APIYI_BASE_URL, IMAGE_GEN_MODEL</span></div>
              <div className={styles.infraNote}>💰 Оплата за генерацию. При &gt;1000 генераций/час — нужны несколько ключей или своя очередь</div>
            </div>

            {/* Payments */}
            <div className={styles.infraCard}>
              <h3 className={styles.infraTitle}>💳 Платежи</h3>
              <div className={styles.infraRow}><span className={styles.infraKey}>Провайдер</span><span className={styles.infraVal}>Robokassa</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Тип</span><span className={styles.infraVal}>Подписки (рекуррентные платежи)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>Endpoints</span><span className={styles.infraVal}>/api/robokassa/{`{result,consent,recurring,cancel}`}</span></div>
              <div className={styles.infraRow}><a href="https://partner.robokassa.ru" target="_blank" rel="noreferrer" className={styles.infraLink}>partner.robokassa.ru →</a></div>
            </div>

            {/* Email */}
            <div className={styles.infraCard}>
              <h3 className={styles.infraTitle}>📧 Почта</h3>
              <div className={styles.infraRow}><span className={styles.infraKey}>Сервис</span><span className={styles.infraVal}>Yandex 360 для домена adgena.pro</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>MX</span><span className={styles.infraVal}>mx.yandex.net (10)</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>SPF</span><span className={styles.infraVal}>v=spf1 redirect=_spf.yandex.net</span></div>
              <div className={styles.infraRow}><span className={styles.infraKey}>DKIM</span><span className={styles.infraVal}>mail._domainkey (TXT в Cloudflare)</span></div>
            </div>

            {/* Scaling roadmap */}
            <div className={styles.infraCard} style={{ gridColumn: '1 / -1' }}>
              <h3 className={styles.infraTitle}>📈 План масштабирования</h3>
              <table className={styles.infraTable}>
                <thead>
                  <tr><th>Юзеров (active)</th><th>Что сделать</th><th>Стоимость</th></tr>
                </thead>
                <tbody>
                  <tr><td>0–200</td><td>Текущий сетап</td><td>~₽500/мес (VPS+R2+Railway)</td></tr>
                  <tr><td>200–500</td><td>Закончить миграцию на Yandex S3, очередь генераций (BullMQ + Redis)</td><td>+₽300/мес</td></tr>
                  <tr><td>500–2000</td><td>SQLite → PostgreSQL, 2 реплики Railway</td><td>+$15/мес</td></tr>
                  <tr><td>2000+</td><td>Апгрейд VPS до 2 ГБ RAM, несколько APIYI ключей, monitoring (Grafana)</td><td>+₽500–1000/мес</td></tr>
                </tbody>
              </table>
            </div>

            {/* Important commands */}
            <div className={styles.infraCard} style={{ gridColumn: '1 / -1' }}>
              <h3 className={styles.infraTitle}>⚙️ Полезные команды</h3>
              <pre className={styles.infraPre}>{`# Прокси-сервер (5.188.27.14)
ssh root@5.188.27.14
cd /opt/adgena-proxy
docker compose logs -f caddy           # логи
docker compose restart                 # перезапуск
docker compose down && docker compose up -d  # полный рестарт

# Изменение Railway upstream — отредактировать /opt/adgena-proxy/.env
nano /opt/adgena-proxy/.env

# Деплой приложения — auto через GitHub
git push origin main

# Проверить DNS
nslookup adgena.pro 1.1.1.1
curl -I https://adgena.pro`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Редактирование пользователя</h3>
            <p className={styles.modalEmail}>{users.find(u => u.id === editingUser)?.email}</p>

            <label className={styles.modalLabel}>Роль</label>
            <select className={styles.modalSelect} value={editRole} onChange={(e) => setEditRole(e.target.value)}>
              <option value="user">👤 Пользователь</option>
              <option value="support">🛡️ Саппорт</option>
              <option value="admin">👑 Админ</option>
            </select>

            <label className={styles.modalLabel}>План</label>
            <select className={styles.modalSelect} value={editPlan} onChange={(e) => setEditPlan(e.target.value)}>
              <option value="free">Free</option>
              <option value="lite">Лайт</option>
              <option value="standard">Стандарт</option>
              <option value="pro">Про</option>
              <option value="business">Бизнес</option>
              <option value="unlimited">Unlimited</option>
            </select>

            <label className={styles.modalLabel}>Лимит генераций</label>
            <input type="number" className={styles.modalInput} value={editLimit} onChange={(e) => setEditLimit(parseInt(e.target.value) || 0)} />

            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setEditingUser(null)}>Отмена</button>
              <button className={styles.modalSave} onClick={() => handleUpdateUser(editingUser)}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyUser && (
        <div className={styles.modalOverlay} onClick={() => setHistoryUser(null)}>
          <div className={styles.modal} style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>История: {historyUser.email}</h3>
              <button className={styles.modalCloseBtn} onClick={() => setHistoryUser(null)}>✕</button>
            </div>
            
            {loadingHistory ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Загрузка истории...</p>
            ) : userHistory.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>У пользователя нет генераций</p>
            ) : (
              <div className={styles.historyGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px', maxHeight: '60vh', overflowY: 'auto', padding: '10px' }}>
                {userHistory.map(gen => (
                  <div key={gen.id} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    {gen.image_output_path ? (
                      <a href={gen.image_output_path} target="_blank" rel="noreferrer">
                        <img src={gen.image_output_path} alt="gen" style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                      </a>
                    ) : (
                      <div style={{ width: '100%', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1f2937', color: '#9ca3af', fontSize: '12px' }}>Нет фото</div>
                    )}
                    <div style={{ padding: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{gen.product_name || 'Без названия'}</div>
                      <div>{gen.type} • {gen.template_id}</div>
                      <div>{new Date(gen.created_at).toLocaleDateString('ru-RU')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
