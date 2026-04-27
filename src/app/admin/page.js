'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editPlan, setEditPlan] = useState('free');
  const [editLimit, setEditLimit] = useState(5);

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

  useEffect(() => { loadData(); }, []);

  const handleUpdateUser = async (userId) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan: editPlan, generationsLimit: editLimit }),
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

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const planColors = {
    free: '#6b7280',
    starter: '#3b82f6',
    pro: '#f59e0b',
    business: '#8b5cf6',
    unlimited: '#10b981',
  };

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loading}>Загрузка...</div>
    </div>
  );

  if (error) return (
    <div className={styles.page}>
      <div className={styles.error}>{error}</div>
    </div>
  );

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
          type="text"
          className={styles.search}
          placeholder="Поиск по email или имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className={styles.count}>
          {filteredUsers.length} из {users.length}
        </span>
      </div>

      {/* Users Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>План</th>
              <th>Генерации</th>
              <th>Регистрация</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td className={styles.emailCell}>{u.email}</td>
                <td>{u.name || '—'}</td>
                <td>
                  <span
                    className={styles.planBadge}
                    style={{ borderColor: planColors[u.plan] || '#666', color: planColors[u.plan] || '#666' }}
                  >
                    {u.plan}
                  </span>
                </td>
                <td>
                  <span className={styles.genCount}>
                    {u.generations_used} / {u.generations_limit}
                  </span>
                </td>
                <td className={styles.dateCell}>
                  {new Date(u.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td className={styles.actionsCell}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => {
                      setEditingUser(u.id);
                      setEditPlan(u.plan);
                      setEditLimit(u.generations_limit);
                    }}
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleResetGenerations(u.id)}
                    title="Сбросить генерации"
                  >
                    🔄
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionDelete}`}
                    onClick={() => handleDeleteUser(u.id, u.email)}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className={styles.modalOverlay} onClick={() => setEditingUser(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Редактирование пользователя</h3>
            <p className={styles.modalEmail}>
              {users.find(u => u.id === editingUser)?.email}
            </p>

            <label className={styles.modalLabel}>План</label>
            <select
              className={styles.modalSelect}
              value={editPlan}
              onChange={(e) => setEditPlan(e.target.value)}
            >
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
              <option value="unlimited">Unlimited</option>
            </select>

            <label className={styles.modalLabel}>Лимит генераций</label>
            <input
              type="number"
              className={styles.modalInput}
              value={editLimit}
              onChange={(e) => setEditLimit(parseInt(e.target.value) || 0)}
            />

            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setEditingUser(null)}>
                Отмена
              </button>
              <button className={styles.modalSave} onClick={() => handleUpdateUser(editingUser)}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
