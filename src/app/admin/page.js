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
    free: '#6b7280', starter: '#3b82f6', pro: '#f59e0b',
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
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
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
    </div>
  );
}
