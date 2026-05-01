'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './dashboard.module.css';

// ========================================
// DATA
// ========================================

const CONTENT_TYPES = [
  { id: 'photo', label: 'Фото' },
  { id: 'card', label: 'Карточка' },
  { id: 'ads', label: 'Реклама' },
];

const CATEGORIES = [
  { id: 'clothing',    name: 'Одежда и обувь' },
  { id: 'accessories', name: 'Аксессуары' },
  { id: 'food',        name: 'Еда и напитки' },
  { id: 'beauty',      name: 'Косметика и уход' },
  { id: 'gadgets',     name: 'Гаджеты и техника' },
  { id: 'home',        name: 'Дом и сад' },
  { id: 'kids',        name: 'Детские товары' },
  { id: 'other',       name: 'Прочее' },
];

const PHOTO_CONCEPTS = {
  clothing: [
    { id: 'on-model', name: 'На модели', desc: 'Носимый контекст, акцент на посадке' },
    { id: 'in-store', name: 'Как в магазине', desc: 'На вешалке или подставке' },
    { id: 'flat-lay', name: 'Раскладка сверху', desc: 'Вид строго сверху' },
    { id: 'studio',   name: 'Каталог (студийно)', desc: 'Чистый объект на нейтральном фоне' },
  ],
  accessories: [
    { id: 'on-model',   name: 'На модели', desc: 'На руке, шее, в ушах' },
    { id: 'flat-lay',   name: 'Раскладка сверху', desc: 'Flat lay с аксессуарами' },
    { id: 'in-context', name: 'В окружении', desc: 'На столе, у зеркала' },
    { id: 'studio',     name: 'Каталог (студийно)', desc: 'Чистый объект на нейтральном фоне' },
  ],
  food: [
    { id: 'plated',     name: 'Сервировка', desc: 'На тарелке, в бокале' },
    { id: 'in-context', name: 'В окружении', desc: 'На кухне, с ингредиентами' },
    { id: 'flat-lay',   name: 'Раскладка сверху', desc: 'Вид сверху с ингредиентами' },
    { id: 'studio',     name: 'Каталог (студийно)', desc: 'Упаковка на чистом фоне' },
  ],
  beauty: [
    { id: 'in-use',     name: 'В использовании', desc: 'Нанесение на кожу, в руках' },
    { id: 'in-context', name: 'В окружении', desc: 'Ванная, полка, зеркало' },
    { id: 'texture',    name: 'Текстура крупно', desc: 'Текстура крема, масла' },
    { id: 'studio',     name: 'Каталог (студийно)', desc: 'Чистый объект на нейтральном фоне' },
  ],
  gadgets: [
    { id: 'in-use',     name: 'В использовании', desc: 'Руки, рабочий процесс' },
    { id: 'in-context', name: 'В окружении', desc: 'Стол, рабочее место' },
    { id: 'close-up',   name: 'Крупный план', desc: 'Кнопки, экраны, детали' },
    { id: 'studio',     name: 'Каталог (студийно)', desc: 'Чистый объект на нейтральном фоне' },
  ],
  home: [
    { id: 'in-interior', name: 'В интерьере', desc: 'В комнате, на своём месте' },
    { id: 'in-use',      name: 'В использовании', desc: 'Человек использует предмет' },
    { id: 'close-up',    name: 'Крупный план', desc: 'Текстура, материал, детали' },
    { id: 'studio',      name: 'Каталог (студийно)', desc: 'Чистый объект на нейтральном фоне' },
  ],
  kids: [
    { id: 'in-use',     name: 'Ребёнок с товаром', desc: 'Ребёнок играет, использует' },
    { id: 'in-context', name: 'В детской', desc: 'В детской комнате' },
    { id: 'flat-lay',   name: 'Раскладка сверху', desc: 'Вид сверху среди игрушек' },
    { id: 'studio',     name: 'Каталог (студийно)', desc: 'Чистый объект на нейтральном фоне' },
  ],
  other: [
    { id: 'in-use',     name: 'В использовании', desc: 'Товар в процессе использования' },
    { id: 'in-context', name: 'В окружении', desc: 'В подходящей обстановке' },
    { id: 'flat-lay',   name: 'Раскладка сверху', desc: 'Вид строго сверху' },
    { id: 'studio',     name: 'Каталог (студийно)', desc: 'Чистый объект на нейтральном фоне' },
  ],
};

const AD_CONCEPTS = [
  { id: 'ad-sale',    name: 'Продающий баннер', desc: 'Акции, скидки, промо', icon: '🔥' },
  { id: 'ad-minimal', name: 'Минималистичный', desc: 'Премиум стиль Apple/MUJI', icon: '✨' },
  { id: 'ad-story',   name: 'Stories / Reels', desc: 'Вертикальный 9:16', icon: '📱' },
];

const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16', hint: 'Stories / Reels', platform: 'stories' },
  { id: '3:4',  label: '3:4',  hint: 'WB / Ozon',       platform: 'marketplace' },
  { id: '1:1',  label: '1:1',  hint: 'ВК / Авито',      platform: 'social' },
  { id: '4:3',  label: '4:3',  hint: 'Горизонталь',     platform: 'general' },
  { id: '16:9', label: '16:9', hint: 'Я.Директ / РСЯ',  platform: 'yandex' },
];

// Which aspect ratios each model can produce NATIVELY (without lossy crop).
// gpt-image-2 only has 1024², 1024x1536 (2:3), 1536x1024 (3:2). 9:16/16:9 would crop content.
// Gemini can produce any ratio via prompt.
const MODEL_RATIOS = {
  'gpt-image-2': ['1:1', '3:4', '4:3'],
  'gemini':      ['9:16', '3:4', '1:1', '4:3', '16:9'],
};

const MODEL_LABELS = {
  'gpt-image-2': 'GPT Image',
  'gemini':      'Gemini (nanobanana)',
};

// Mirror backend routing in src/lib/apiyi.js:
// ads/card → gpt-image-2 (text on image), photo → Gemini.
function resolveModelFromTab(tab) {
  return (tab === 'ads' || tab === 'card') ? 'gpt-image-2' : 'gemini';
}

// ========================================
// COMPONENT
// ========================================

export default function DashboardPage() {
  const [tab, setTab] = useState('photo');
  const [category, setCategory] = useState('other');
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [productName, setProductName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const fileInputRef = useRef(null);

  // Photo
  const [wishes, setWishes] = useState('');
  // Card
  const [cardText, setCardText] = useState('');
  const [cardStyle, setCardStyle] = useState('classic');
  const [creativity, setCreativity] = useState(0.5);
  // Shared
  const [aspectRatio, setAspectRatio] = useState('3:4');
  // Ads fields
  const [adHeadline, setAdHeadline] = useState('');
  const [adCta, setAdCta] = useState('');
  const [adPrice, setAdPrice] = useState('');
  const [adShowButton, setAdShowButton] = useState(false);
  // Result modal
  const [improveText, setImproveText] = useState('');
  // Workspace: array of generated items in current session (persisted to localStorage)
  // Each item: { id, imageDataUrl, imageUrl, productName, type, templateId, category, aspectRatio, concept, note, timestamp, settings }
  const [workspace, setWorkspace] = useState([]);
  const [activeWsId, setActiveWsId] = useState(null);
  // AI helper
  const [aiSuggesting, setAiSuggesting] = useState(false);
  // User & History
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.success) setUser(d.user); }).catch(() => {});
    fetch('/api/generations').then(r => r.json()).then(d => { if (d.success) setHistory(d.generations || []); }).catch(() => {});
    const saved = localStorage.getItem('adgena-theme');
    if (saved) { setTheme(saved); document.documentElement.setAttribute('data-theme', saved); }
    // Restore workspace
    try {
      const ws = JSON.parse(localStorage.getItem('adgena-workspace') || '[]');
      if (Array.isArray(ws) && ws.length) setWorkspace(ws);
    } catch { /* ignore */ }
  }, []);

  // Persist workspace (keep last 20). IMPORTANT: strip base64 data URLs — they blow up localStorage.
  // Items without imageUrl (S3 upload failed) are transient and won't survive reload.
  useEffect(() => {
    try {
      const persistable = workspace
        .filter(w => w.imageUrl)
        .slice(-20)
        .map(w => ({ ...w, imageDataUrl: undefined }));
      localStorage.setItem('adgena-workspace', JSON.stringify(persistable));
    } catch { /* quota exceeded — ignore */ }
  }, [workspace]);

  // Keep aspectRatio valid for the currently-selected model
  useEffect(() => {
    const model = resolveModelFromTab(tab);
    const allowed = MODEL_RATIOS[model] || [];
    if (!allowed.includes(aspectRatio)) {
      // Pick the closest sensible default
      const fallback = allowed.includes('3:4') ? '3:4' : allowed[0];
      if (fallback) setAspectRatio(fallback);
    }
  }, [tab, aspectRatio]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('adgena-theme', next);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const concepts = tab === 'photo'
    ? (PHOTO_CONCEPTS[category] || PHOTO_CONCEPTS.other)
    : tab === 'ads' ? AD_CONCEPTS : [];

  const canGenerate = uploadedImage && productName.trim() &&
    (tab === 'card' || selectedConcept) && !generating;

  // --- Handlers ---

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const buildFormData = (noteText) => {
    const fd = new FormData();
    fd.append('image', uploadedImage);
    fd.append('templateId', selectedConcept || 'infographic');
    fd.append('productName', productName);
    fd.append('type', tab);
    fd.append('category', category);
    fd.append('lang', 'ru');
    fd.append('wishes', noteText || wishes);
    fd.append('aspectRatio', aspectRatio);
    if (tab === 'card') {
      fd.append('cardText', cardText);
      fd.append('cardStyle', cardStyle);
      fd.append('creativity', creativity.toString());
    }
    if (tab === 'ads') {
      fd.append('headline', adHeadline);
      fd.append('cta', adCta);
      fd.append('price', adPrice);
      fd.append('showButton', adShowButton ? 'true' : 'false');
    }
    return fd;
  };

  const addToWorkspace = (data, { noteText, parentId } = {}) => {
    const conceptName = tab === 'card'
      ? `Карточка (${cardStyle})`
      : (PHOTO_CONCEPTS[category]?.concat(AD_CONCEPTS).find(c => c.id === selectedConcept)?.name || '—');
    const item = {
      id: data.generationId || `ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      parentId: parentId || null,
      imageDataUrl: data.imageDataUrl,
      imageUrl: data.imageUrl || null,
      productName: productName || 'Без названия',
      type: tab,
      templateId: selectedConcept || null,
      conceptName,
      category,
      aspectRatio,
      note: noteText || wishes || '',
      timestamp: Date.now(),
      model: data.model,
    };
    setWorkspace(prev => [...prev, item]);
    setActiveWsId(item.id);
    return item;
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setGeneratedResult(null);
    try {
      const res = await fetch('/api/generate', { method: 'POST', body: buildFormData() });
      const data = await res.json();
      if (data.success) {
        addToWorkspace(data);
        setGeneratedResult(data);
        setShowResult(true);
      } else {
        setGeneratedResult({ error: data.error || 'Ошибка генерации' });
        setShowResult(true);
      }
    } catch (err) {
      setGeneratedResult({ error: err.message });
      setShowResult(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleImprove = async () => {
    if (!improveText.trim() || !uploadedImage) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', { method: 'POST', body: buildFormData(improveText) });
      const data = await res.json();
      if (data.success) {
        addToWorkspace(data, { noteText: improveText, parentId: activeWsId });
        setGeneratedResult(data);
        setImproveText('');
      }
    } catch (err) {
      console.error('Improve error:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Close current result (keeps form + workspace intact — user can generate another)
  const handleCloseResult = () => {
    setGeneratedResult(null);
    setShowResult(false);
    setActiveWsId(null);
  };

  // Select an item from workspace to view it in the right panel
  const selectWorkspaceItem = (id) => {
    const item = workspace.find(w => w.id === id);
    if (!item) return;
    setActiveWsId(id);
    setGeneratedResult({ imageDataUrl: item.imageDataUrl, imageUrl: item.imageUrl, generationId: item.id, model: item.model });
    setShowResult(false);
  };

  const removeFromWorkspace = (id) => {
    setWorkspace(prev => prev.filter(w => w.id !== id));
    if (activeWsId === id) handleCloseResult();
  };

  // Full reset — clear form AND selection (workspace stays in localStorage)
  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setProductName('');
    setSelectedConcept(null);
    setWishes('');
    setCardText('');
    setAdHeadline('');
    setAdCta('');
    setAdPrice('');
    setAdShowButton(false);
    handleCloseResult();
  };

  const handleAiSuggest = async () => {
    if (!productName.trim()) return;
    setAiSuggesting(true);
    try {
      const catName = CATEGORIES.find(c => c.id === category)?.name || category;
      const res = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          category: catName,
          type: tab,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        const r = data.result;
        if (tab === 'ads') {
          if (r.headline) setAdHeadline(r.headline);
          if (r.cta) setAdCta(r.cta);
        } else {
          const text = r.bullets?.join(', ') || r.description || '';
          if (text) setCardText(text);
        }
      }
    } catch { /* ignore */ }
    setAiSuggesting(false);
  };

  // --- Render ---

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <header className={styles.navbar}>
        <div className={styles.navLeft}>
          <span className={styles.logo}>AdGena</span>
        </div>
        <div className={styles.navRight}>
          <button className={styles.navBtn} onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '☽'}
          </button>
          <button className={styles.navBtn} onClick={() => setShowHistory(!showHistory)}>
            История
          </button>
          {user && (
            <div className={styles.userMenu}>
              <a href="/profile" className={styles.userAvatar} title="Профиль">
                {(user.name || user.email)?.[0]?.toUpperCase() || '?'}
              </a>
            </div>
          )}
        </div>
      </header>

      {/* HISTORY PANEL */}
      {showHistory && (
        <div className={styles.historyPanel}>
          <div className={styles.historyHeader}>
            <h3>История генераций</h3>
            <button className={styles.historyClose} onClick={() => setShowHistory(false)}>✕</button>
          </div>
          <div className={styles.historyList}>
            {history.length === 0 && <p className={styles.historyEmpty}>Пока нет генераций</p>}
            {history.map(g => (
              <div
                key={g.id}
                className={`${styles.historyItem} ${g.imageOutput?.startsWith('http') ? styles.historyItemClickable : ''}`}
                onClick={() => {
                  if (g.imageOutput?.startsWith('http')) {
                    setGeneratedResult({ imageDataUrl: g.imageOutput, generationId: g.id });
                    setShowHistory(false);
                  }
                }}
              >
                {g.imageOutput?.startsWith('http') && (
                  <img src={g.imageOutput} alt="" className={styles.historyThumb} />
                )}
                <div className={styles.historyItemInfo}>
                  <span className={styles.historyName}>{g.productName || '—'}</span>
                  <span className={styles.historyMeta}>{g.type} • {g.templateId} • {new Date(g.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
                <span className={`${styles.historyStatus} ${g.status === 'completed' ? styles.historyStatusDone : ''}`}>
                  {g.status === 'completed' ? '✓' : '…'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEFT PANEL — Settings */}
      <aside className={styles.leftPanel}>
        {/* Section 1: Product */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ваш товар</h2>

          {/* Upload */}
          <div
            className={`${styles.uploadZone} ${imagePreview ? styles.uploadZoneHasImage : ''}`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} hidden />
            {imagePreview ? (
              <img src={imagePreview} alt="Product" className={styles.uploadPreview} />
            ) : (
              <div className={styles.uploadPlaceholder}>
                <span className={styles.uploadIcon}>+</span>
                <span className={styles.uploadText}>Загрузить фото</span>
              </div>
            )}
          </div>
          {imagePreview && (
            <button className={styles.linkBtn} onClick={() => { setUploadedImage(null); setImagePreview(null); }}>
              Удалить фото
            </button>
          )}

          {/* Name */}
          <input
            type="text"
            className={styles.input}
            placeholder="Название товара"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />

          {/* Category */}
          <select
            className={styles.input}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setSelectedConcept(null); }}
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </section>

        <div className={styles.divider} />

        {/* Section 2: Generation Settings */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Настройте генерацию</h2>

          {/* Content type tabs */}
          <label className={styles.label}>Тип контента</label>
          <div className={styles.tabRow}>
            {CONTENT_TYPES.map(ct => (
              <button
                key={ct.id}
                className={`${styles.tabBtn} ${tab === ct.id ? styles.tabBtnActive : ''}`}
                onClick={() => { setTab(ct.id); setSelectedConcept(null); }}
              >
                {ct.label}
              </button>
            ))}
          </div>

          {/* PHOTO: concept picker */}
          {tab === 'photo' && (
            <>
              <label className={styles.label} style={{marginTop: 16}}>Как показать товар?</label>
              <div className={styles.conceptList}>
                {concepts.map(c => (
                  <div
                    key={c.id}
                    className={`${styles.conceptItem} ${selectedConcept === c.id ? styles.conceptItemActive : ''}`}
                    onClick={() => setSelectedConcept(c.id)}
                  >
                    <span className={styles.conceptIcon}>{c.icon}</span>
                    <div className={styles.conceptText}>
                      <span className={styles.conceptName}>{c.name}</span>
                      <span className={styles.conceptDesc}>{c.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CARD: text + style */}
          {tab === 'card' && (
            <>
              <div className={styles.labelRow} style={{marginTop: 16}}>
                <label className={styles.label}>О чём рассказать?</label>
                <button
                  type="button"
                  className={styles.aiBtn}
                  disabled={aiSuggesting || !productName.trim()}
                  onClick={handleAiSuggest}
                >
                  {aiSuggesting ? '⏳' : '✨'} AI
                </button>
              </div>
              <textarea
                className={styles.textarea}
                rows={3}
                maxLength={2000}
                placeholder="Например: натуральный состав, приятный запах, быстрый эффект..."
                value={cardText}
                onChange={(e) => setCardText(e.target.value)}
              />

              <label className={styles.label} style={{marginTop: 16}}>Стиль карточки</label>
              <div className={styles.tabRow}>
                <button className={`${styles.tabBtn} ${cardStyle === 'classic' ? styles.tabBtnActive : ''}`} onClick={() => setCardStyle('classic')}>Классический</button>
                <button className={`${styles.tabBtn} ${cardStyle === 'premium' ? styles.tabBtnActive : ''}`} onClick={() => setCardStyle('premium')}>Премиум</button>
              </div>

              <label className={styles.label} style={{marginTop: 16}}>Креативность</label>
              <div className={styles.sliderRow}>
                <span className={styles.sliderLabel}>Точная копия</span>
                <input type="range" min="0" max="1" step="0.1" value={creativity} onChange={(e) => setCreativity(parseFloat(e.target.value))} className={styles.slider} />
                <span className={styles.sliderLabel}>Свободный стиль</span>
              </div>
            </>
          )}

          {/* ADS: concept picker + headline/cta */}
          {tab === 'ads' && (
            <>
              <label className={styles.label} style={{marginTop: 16}}>Тип рекламы</label>
              <div className={styles.conceptList}>
                {concepts.map(c => (
                  <div
                    key={c.id}
                    className={`${styles.conceptItem} ${selectedConcept === c.id ? styles.conceptItemActive : ''}`}
                    onClick={() => setSelectedConcept(c.id)}
                  >
                    <span className={styles.conceptIcon}>{c.icon}</span>
                    <div className={styles.conceptText}>
                      <span className={styles.conceptName}>{c.name}</span>
                      <span className={styles.conceptDesc}>{c.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.labelRow} style={{marginTop: 16}}>
                <label className={styles.label}>Заголовок и CTA</label>
                <button
                  type="button"
                  className={styles.aiBtn}
                  disabled={aiSuggesting || !productName.trim()}
                  onClick={handleAiSuggest}
                >
                  {aiSuggesting ? '⏳' : '✨'} AI
                </button>
              </div>
              <input
                type="text"
                className={styles.input}
                placeholder="Заголовок: СКИДКА 50%, Новинка сезона..."
                value={adHeadline}
                onChange={(e) => setAdHeadline(e.target.value)}
              />
              <input
                type="text"
                className={styles.input}
                style={{marginTop: 8}}
                placeholder="Текст кнопки: Купить, Подробнее, Заказать..."
                value={adCta}
                onChange={(e) => setAdCta(e.target.value)}
              />

              <label style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, cursor: 'pointer', color: 'var(--text-secondary)'}}>
                <input
                  type="checkbox"
                  checked={adShowButton}
                  onChange={(e) => setAdShowButton(e.target.checked)}
                />
                Показать кнопку на картинке
              </label>

              <label className={styles.label} style={{marginTop: 16}}>Цена (опционально)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Например: 1990₽ или -50% или $19.99"
                value={adPrice}
                onChange={(e) => setAdPrice(e.target.value)}
              />
              <p style={{fontSize: 11, color: 'var(--text-muted, #888)', margin: '4px 0 0'}}>
                Оставьте пустым — на картинке не будет никакой цены.
              </p>
            </>
          )}

          {/* Wishes (all tabs) */}
          <>
            <label className={styles.label} style={{marginTop: 16}}>Пожелания</label>
            <textarea
              className={styles.textarea}
              rows={2}
              maxLength={2000}
              placeholder="Например: мягкий свет, минимализм, нейтральный фон."
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
            />
          </>

          {/* Format — visual shapes (filtered by the model that will be used) */}
          {(() => {
            const activeModel = resolveModelFromTab(tab);
            const allowed = MODEL_RATIOS[activeModel] || [];
            const filtered = ASPECT_RATIOS.filter(r => allowed.includes(r.id));
            return (
              <>
                <label className={styles.label} style={{marginTop: 16}}>Формат</label>
                <div className={styles.ratioRow}>
                  {filtered.map(r => {
                    const [w, h] = r.id.split(':').map(Number);
                    const maxSize = 28;
                    const ratio = w / h;
                    const shapeW = ratio >= 1 ? maxSize : Math.round(maxSize * ratio);
                    const shapeH = ratio <= 1 ? maxSize : Math.round(maxSize / ratio);
                    return (
                      <button
                        key={r.id}
                        className={`${styles.ratioBtn} ${aspectRatio === r.id ? styles.ratioBtnActive : ''}`}
                        onClick={() => setAspectRatio(r.id)}
                        title={r.hint}
                      >
                        <span className={styles.ratioShape} style={{ width: shapeW, height: shapeH }} />
                        <span className={styles.ratioLabel}>{r.label}</span>
                        <span className={styles.ratioHint}>{r.hint}</span>
                      </button>
                    );
                  })}
                </div>
                <p style={{fontSize: 11, color: 'var(--text-muted, #888)', margin: '6px 0 0'}}>
                  Модель: <b>{MODEL_LABELS[activeModel]}</b>. Доступны только форматы, которые она поддерживает без потери качества.
                </p>
              </>
            );
          })()}
        </section>

        {/* Generate Button */}
        <button
          className={styles.generateBtn}
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {generating ? (
            <><span className={styles.spinner} /> Генерирую...</>
          ) : (
            <>Сгенерировать</>
          )}
        </button>
        {(uploadedImage || productName || selectedConcept) && !generating && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 12, padding: '8px 0', marginTop: 4,
              textDecoration: 'underline',
            }}
          >
            Очистить форму
          </button>
        )}
      </aside>

      {/* RIGHT PANEL — Results / Workspace */}
      <main className={styles.rightPanel}>
        {generating && (
          <div className={styles.emptyState}>
            <div className={styles.loadingPulse}><span className={styles.spinner} /></div>
            <h2>Генерация...</h2>
            <p>Обычно занимает 20-30 секунд</p>
          </div>
        )}

        {!generating && !generatedResult && (
          <div className={styles.emptyState} style={{paddingTop: workspace.length ? 24 : undefined}}>
            {workspace.length === 0 ? (
              <>
                <div className={styles.emptyIcon}></div>
                <h2>Ваши результаты</h2>
                <p>Загрузите фото, выберите настройки и нажмите «Сгенерировать»</p>
              </>
            ) : (
              <div style={{width: '100%', padding: '0 24px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                  <h2 style={{margin: 0}}>Рабочее пространство</h2>
                  <span style={{fontSize: 13, color: 'var(--text-secondary)'}}>{workspace.length} работ</span>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12}}>
                  {workspace.slice().reverse().map(item => (
                    <div
                      key={item.id}
                      style={{
                        position: 'relative',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, border-color 0.15s',
                      }}
                      onClick={() => selectWorkspaceItem(item.id)}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--accent-primary, #3b82f6)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                    >
                      <img src={item.imageUrl || item.imageDataUrl} alt={item.productName} style={{width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block'}} />
                      <div style={{padding: '8px 10px', fontSize: 12}}>
                        <div style={{fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.productName}</div>
                        <div style={{color: 'var(--text-secondary)', marginTop: 2, fontSize: 11}}>
                          {item.type} • {item.aspectRatio}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFromWorkspace(item.id); }}
                        title="Убрать из рабочего пространства"
                        style={{
                          position: 'absolute', top: 6, right: 6, width: 22, height: 22,
                          borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)',
                          color: '#fff', cursor: 'pointer', fontSize: 13, lineHeight: 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {generatedResult && !generating && !showResult && (
          <div className={styles.emptyState}>
            {generatedResult.error ? (
              <div className={styles.errorBlock}>
                <p>{generatedResult.error}</p>
                <button className={styles.linkBtn} onClick={handleCloseResult}>Попробовать снова</button>
              </div>
            ) : (
              <div className={styles.resultArea} style={{position: 'relative'}}>
                <button
                  onClick={handleCloseResult}
                  title="Закрыть (работа сохранится в рабочем пространстве)"
                  style={{
                    position: 'absolute', top: 8, right: 8, zIndex: 2,
                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                    border: 'none', borderRadius: 20, padding: '6px 12px',
                    cursor: 'pointer', fontSize: 13,
                  }}
                >✕ Новая генерация</button>
                <div className={styles.resultImageWrap} onClick={() => setShowResult(true)}>
                  <img src={generatedResult.imageUrl || generatedResult.imageDataUrl} alt="Generated" className={styles.resultImage} />
                </div>
                <button className={styles.btnPrimary} onClick={() => setShowResult(true)}>Открыть</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* RESULT MODAL (Aidentika-style) */}
      {showResult && generatedResult && !generatedResult.error && (
        <div className={styles.resultModal}>
          <div className={styles.resultModalContent}>
            {/* Close — just hides modal, keeps result visible */}
            <button className={styles.modalClose} onClick={() => setShowResult(false)}>✕</button>

            {/* Left: Image */}
            <div className={styles.modalLeft}>
              <div className={styles.modalImageWrap}>
                <img src={generatedResult.imageUrl || generatedResult.imageDataUrl} alt="Result" className={styles.modalImage} />
              </div>
              <div className={styles.modalImageActions} style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                <a
                  href={generatedResult.imageUrl || generatedResult.imageDataUrl}
                  download={`adgena-${generatedResult.generationId || 'result'}.webp`}
                  target={generatedResult.imageUrl ? '_blank' : undefined}
                  rel={generatedResult.imageUrl ? 'noopener noreferrer' : undefined}
                  className={styles.downloadBtn}
                >
                  Скачать
                </a>
                <button
                  className={styles.downloadBtn}
                  style={{background: 'transparent', border: '1px solid var(--border-subtle)', cursor: 'pointer'}}
                  onClick={() => { handleCloseResult(); }}
                  title="Закрыть и начать новую генерацию (работа сохранится)"
                >
                  ✕ Новая генерация
                </button>
              </div>
            </div>

            {/* Right: Info + Improve + Workspace */}
            <div className={styles.modalRight}>
              {/* Concept info */}
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Концепция</span>
                <h3 className={styles.modalConceptName}>
                  {concepts.find(c => c.id === selectedConcept)?.name || (tab === 'card' ? `Карточка (${cardStyle})` : '—')}
                </h3>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Пожелания</span>
                <p className={styles.modalValue}>{wishes || '—'}</p>
              </div>

              {/* Improve */}
              <div className={styles.modalSection}>
                <div className={styles.modalLabelRow}>
                  <span className={styles.modalLabel}>Доделать / улучшить</span>
                </div>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Например: сделай фон темнее"
                  value={improveText}
                  onChange={(e) => setImproveText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleImprove()}
                />
                <button
                  className={styles.improveBtn}
                  disabled={!improveText.trim() || generating || !uploadedImage}
                  onClick={handleImprove}
                >
                  {generating ? 'Генерирую...' : 'Создать версию'}
                </button>
              </div>

              {/* Workspace */}
              <div className={styles.modalSection}>
                <div className={styles.modalLabelRow}>
                  <span className={styles.modalLabel}>Рабочее пространство</span>
                  <span className={styles.modalCount}>{workspace.length}</span>
                </div>
                <div className={styles.versionList}>
                  {workspace.slice().reverse().map(item => (
                    <div
                      key={item.id}
                      className={`${styles.versionItem} ${activeWsId === item.id ? styles.versionItemActive : ''}`}
                      onClick={() => selectWorkspaceItem(item.id)}
                      style={{cursor: 'pointer'}}
                    >
                      <span className={styles.versionLabel}>{item.productName}</span>
                      <span className={styles.versionTime}>
                        {new Date(item.timestamp).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'})}
                      </span>
                      <span className={styles.versionNote}>
                        {item.type} • {item.aspectRatio} {item.note ? `• ${item.note}` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
