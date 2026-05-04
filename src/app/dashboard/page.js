'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './dashboard.module.css';
import {
  IconFire, IconDiamond, IconLeaf, IconSparkle, IconPhone,
  IconSun, IconMoon, IconWand, IconLoader, IconDownload, IconRefresh,
  IconShield, IconClock, IconTrafficLight, IconChart, IconWarning,
  IconCamera, IconPalette, IconRocket, IconPlus,
} from '@/components/Icons';

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
  { id: 'ad-sale',    name: 'Яркий sale', desc: 'Акции, скидки, промо', icon: <IconFire size={22} /> },
  { id: 'ad-premium', name: 'Премиум', desc: 'Дорого, сдержанно, брендово', icon: <IconDiamond size={22} /> },
  { id: 'ad-fresh',   name: 'Свежий', desc: 'Светлый, мягкий, lifestyle', icon: <IconLeaf size={22} /> },
  { id: 'ad-minimal', name: 'Минималистичный', desc: 'Премиум стиль Apple/MUJI', icon: <IconSparkle size={22} /> },
  { id: 'ad-story',   name: 'Stories / Reels', desc: 'Вертикальный 9:16', icon: <IconPhone size={22} /> },
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
  // Toast (transient notification)
  const [toast, setToast] = useState(null);
  // Progress step during generation: 0=sending, 1=rendering, 2=saving
  const [genStep, setGenStep] = useState(0);
  // User & History
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [galleryFilter, setGalleryFilter] = useState('session');
  const [theme, setTheme] = useState('dark');
  // Onboarding: show tour on first visit
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Concept thumbnails (loaded from admin settings)
  const [conceptThumbs, setConceptThumbs] = useState({});
  // Auto-detect product
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.success) setUser(d.user); }).catch(() => {});
    fetch('/api/generations').then(r => r.json()).then(d => { if (d.success) setHistory(d.generations || []); }).catch(() => {});
    fetch('/api/admin/concepts').then(r => r.json()).then(d => { if (d.thumbnails) setConceptThumbs(d.thumbnails); }).catch(() => {});
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
      const fallback = allowed.includes('3:4') ? '3:4' : allowed[0];
      if (fallback) {
        const prev = aspectRatio;
        setAspectRatio(fallback);
        setToast(`Формат ${prev} недоступен для модели ${MODEL_LABELS[model]} — переключено на ${fallback}`);
      }
    }
  }, [tab, aspectRatio]);

  // Toast auto-hide after 4 sec
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Progress step ticker during generation
  useEffect(() => {
    if (!generating) { setGenStep(0); return; }
    // 0 → 1 at 5 sec, 1 → 2 at 50 sec
    const t1 = setTimeout(() => setGenStep(1), 5000);
    const t2 = setTimeout(() => setGenStep(2), 50000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [generating]);

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

  // Derive { ok, reason } to drive a helpful hint on the disabled Generate button
  const genReadiness = (() => {
    if (generating) return { ok: false, reason: null };
    if (!uploadedImage) return { ok: false, reason: 'Загрузите фото товара' };
    if (!productName.trim()) return { ok: false, reason: 'Введите название товара' };
    if (tab !== 'card' && !selectedConcept) return { ok: false, reason: 'Выберите концепцию ниже' };
    // Out-of-quota check (authenticated users)
    if (user && typeof user.generations_used === 'number' && typeof user.generations_limit === 'number' && user.generations_used >= user.generations_limit) {
      return { ok: false, reason: 'Лимит исчерпан — обновите тариф' };
    }
    return { ok: true, reason: null };
  })();
  const canGenerate = genReadiness.ok;

  // --- Handlers ---

  // Upload constraints (kept in sync with server-side check in /api/generate)
  const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
  const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

  const acceptFile = (file) => {
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) {
      alert(`Формат ${file.type || 'unknown'} не поддерживается. Загрузите JPG, PNG или WebP.`);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      alert(`Файл слишком большой: ${(file.size / 1024 / 1024).toFixed(1)} MB. Максимум — 10 MB.`);
      return;
    }
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    // Auto-detect product name + category
    if (!productName.trim()) {
      setDetecting(true);
      const fd = new FormData();
      fd.append('image', file);
      fetch('/api/detect-product', { method: 'POST', body: fd })
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            if (d.name) setProductName(d.name);
            if (d.category) { setCategory(d.category); setSelectedConcept(null); }
          }
        })
        .catch(() => {})
        .finally(() => setDetecting(false));
    }
  };

  const handleFileUpload = useCallback((e) => {
    acceptFile(e.target.files?.[0]);
    e.target.value = ''; // allow re-uploading the same file
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    acceptFile(e.dataTransfer.files?.[0]);
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
        // Refresh user counter (generations_used)
        fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.success) setUser(d.user); }).catch(() => {});
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
          {user && typeof user.generations_used === 'number' && typeof user.generations_limit === 'number' && (() => {
            const left = Math.max(0, user.generations_limit - user.generations_used);
            const ratio = user.generations_limit === 0 ? 0 : left / user.generations_limit;
            const color = left === 0 ? '#ef4444' : ratio < 0.25 ? '#f59e0b' : '#22c55e';
            return (
              <a
                href="/profile"
                title={`Использовано ${user.generations_used} из ${user.generations_limit}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 8,
                  border: `1px solid ${color}33`, background: `${color}14`,
                  color, fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}
              >
                <span style={{width: 6, height: 6, borderRadius: '50%', background: color}} />
                Осталось {left}/{user.generations_limit}
              </a>
            );
          })()}
          <button className={styles.navBtn} onClick={toggleTheme}>
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
          <button
            className={styles.navBtn}
            onClick={() => {
              setGeneratedResult(null); setShowResult(false);
              setGalleryFilter(prev => prev === 'all' ? 'session' : 'all');
            }}
          >
            {galleryFilter === 'all' ? 'Сессия' : 'Все работы'}
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
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} hidden />
            {imagePreview ? (
              <img src={imagePreview} alt="Product" className={styles.uploadPreview} />
            ) : (
              <div className={styles.uploadPlaceholder}>
                <span className={styles.uploadIcon}><IconPlus size={20} /></span>
                <span className={styles.uploadText}>Загрузить фото</span>
              </div>
            )}
          </div>
          {imagePreview ? (
            <button className={styles.linkBtn} onClick={() => { setUploadedImage(null); setImagePreview(null); }}>
              Удалить фото
            </button>
          ) : (
            <p style={{fontSize: 11, color: 'var(--text-muted, #888)', margin: '6px 0 0', textAlign: 'center'}}>
              JPG, PNG или WebP • до 10 MB
            </p>
          )}

          {/* Name */}
          <div style={{position: 'relative'}}>
            <input
              type="text"
              className={styles.input}
              placeholder={detecting ? 'Определяю товар...' : 'Название товара'}
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={detecting}
            />
            {detecting && <span style={{position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'var(--text-muted,#888)'}}>⏳</span>}
          </div>

          {/* Category */}
          <select
            className={styles.input}
            value={category}
            onChange={(e) => { setCategory(e.target.value); setSelectedConcept(null); }}
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className={styles.fieldHint}>Категория влияет на стиль, палитру и подбор концепций</span>
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
                {concepts.map(c => {
                  const thumbKey = `${category}__${c.id}`;
                  const thumbUrl = conceptThumbs[thumbKey];
                  return (
                    <div
                      key={c.id}
                      className={`${styles.conceptItem} ${selectedConcept === c.id ? styles.conceptItemActive : ''}`}
                      onClick={() => setSelectedConcept(c.id)}
                    >
                      {thumbUrl ? (
                        <img src={thumbUrl} alt={c.name} className={styles.conceptThumb} />
                      ) : (
                        <span className={styles.conceptIcon}>{c.icon}</span>
                      )}
                      <div className={styles.conceptText}>
                        <span className={styles.conceptName}>{c.name}</span>
                        <span className={styles.conceptDesc}>{c.desc}</span>
                      </div>
                    </div>
                  );
                })}
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
                  {aiSuggesting ? <IconLoader size={14} /> : <IconWand size={14} />} AI
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
              <span className={styles.fieldHint}>0 — максимально близко к оригиналу, 1 — свободная интерпретация AI</span>
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
                  {aiSuggesting ? <IconLoader size={14} /> : <IconWand size={14} />} AI
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
            <span className={styles.fieldHint}>Опишите стиль, фон, атмосферу — AI учтёт при генерации</span>
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
              </>
            );
          })()}
        </section>

        {/* Generate Button */}
        <button
          className={styles.generateBtn}
          disabled={!canGenerate}
          onClick={handleGenerate}
          title={genReadiness.reason || ''}
        >
          {generating ? (
            <><span className={styles.spinner} /> Генерирую...</>
          ) : genReadiness.reason ? (
            <>⬆ {genReadiness.reason}</>
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
        {generating && (() => {
          const steps = [
            { label: 'Отправляем в AI...', hint: 'Упаковываем ваше фото и передаём модели' },
            { label: 'AI рисует...',       hint: 'Обычно это самый долгий шаг, 20-50 секунд' },
            { label: 'Сохраняем...',       hint: 'Оптимизируем и загружаем в хранилище' },
          ];
          return (
            <div className={styles.emptyState}>
              <div className={styles.loadingPulse}><span className={styles.spinner} /></div>
              <h2 style={{marginTop: 12}}>{steps[genStep].label}</h2>
              <p>{steps[genStep].hint}</p>
              <div style={{display: 'flex', gap: 6, marginTop: 14}}>
                {steps.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 28, height: 4, borderRadius: 2,
                      background: i <= genStep ? 'var(--brand-primary, #FF6A00)' : 'var(--border-primary, #ddd)',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
              </div>
              <p style={{fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 10}}>
                Всё вместе обычно 30-60 секунд
              </p>
            </div>
          );
        })()}

        {!generating && !generatedResult && (() => {
          // Merge workspace (session) + history (DB) into one gallery
          const wsIds = new Set(workspace.map(w => w.id));
          const historyItems = history
            .filter(g => g.imageOutput?.startsWith('http') && !wsIds.has(g.id))
            .map(g => ({
              id: g.id,
              imageUrl: g.imageOutput,
              productName: g.productName || '—',
              type: g.type,
              aspectRatio: null,
              timestamp: new Date(g.createdAt).getTime(),
              templateId: g.templateId,
              fromHistory: true,
            }));
          const items = galleryFilter === 'all'
            ? [...workspace, ...historyItems].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            : workspace.slice().reverse();
          const total = items.length;

          return (
            <div className={styles.emptyState} style={{paddingTop: total ? 24 : undefined}}>
              {total === 0 ? (
                <>
                  <div className={styles.emptyIcon}><IconCamera size={48} /></div>
                  <h2>Ваши результаты</h2>
                  <p>Загрузите фото, выберите настройки и нажмите «Сгенерировать»</p>
                </>
              ) : (
                <div style={{width: '100%', padding: '0 24px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
                    <h2 style={{margin: 0}}>{galleryFilter === 'all' ? 'Все работы' : 'Рабочее пространство'}</h2>
                    <span style={{fontSize: 13, color: 'var(--text-secondary)'}}>{total} работ</span>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12}}>
                    {items.map(item => (
                      <div
                        key={item.id}
                        className={styles.galleryCard}
                        onClick={() => {
                          if (item.fromHistory) {
                            setGeneratedResult({ imageUrl: item.imageUrl, generationId: item.id });
                            setShowResult(false);
                          } else {
                            selectWorkspaceItem(item.id);
                          }
                        }}
                      >
                        <img src={item.imageUrl || item.imageDataUrl} alt={item.productName} className={styles.galleryThumb} />
                        <div style={{padding: '8px 10px', fontSize: 12}}>
                          <div style={{fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.productName}</div>
                          <div style={{color: 'var(--text-secondary)', marginTop: 2, fontSize: 11}}>
                            {{ photo: 'фото', card: 'карточка', ads: 'реклама' }[item.type] || item.type}{item.aspectRatio ? ` • ${item.aspectRatio}` : ''}
                            {item.fromHistory ? ' • история' : ''}
                          </div>
                        </div>
                        {/* Hover overlay with actions */}
                        <div className={styles.galleryOverlay}>
                          <button
                            className={styles.galleryAction}
                            title="Использовать как входное фото"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = item.imageUrl || item.imageDataUrl;
                              if (url) {
                                const proxyUrl = url.startsWith('data:') ? url : `/api/proxy-image?url=${encodeURIComponent(url)}`;
                                fetch(proxyUrl)
                                  .then(r => { if (!r.ok) throw new Error(); return r.blob(); })
                                  .then(blob => {
                                    const file = new File([blob], 'reuse.webp', { type: blob.type || 'image/webp' });
                                    acceptFile(file);
                                    setToast('Изображение загружено как исходное');
                                  })
                                  .catch(() => setToast('Не удалось загрузить изображение'));
                              }
                            }}
                          ><IconDownload size={14} /> Как исходное</button>
                          <button
                            className={styles.galleryAction}
                            title="Создать похожее (использует те же настройки)"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.fromHistory && item.type) setTab(item.type);
                              if (item.productName && item.productName !== '—') setProductName(item.productName);
                              if (item.category) setCategory(item.category);
                              if (item.templateId) setSelectedConcept(item.templateId);
                              if (item.aspectRatio) setAspectRatio(item.aspectRatio);
                              setToast('Настройки скопированы — загрузите фото и нажмите Сгенерировать');
                            }}
                          ><IconRefresh size={14} /> Повторить</button>
                        </div>
                        {!item.fromHistory && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromWorkspace(item.id); }}
                            title="Убрать из рабочего пространства"
                            style={{
                              position: 'absolute', top: 6, right: 6, width: 22, height: 22,
                              borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)',
                              color: '#fff', cursor: 'pointer', fontSize: 13, lineHeight: 1,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                            }}
                          >✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {generatedResult && !generating && !showResult && (
          <div className={styles.emptyState}>
            {generatedResult.error ? (
              <div className={styles.errorBlock}>
                {(() => {
                  const err = generatedResult.error;
                  let ErrorIcon = IconWarning;
                  let hint = null;
                  if (/safety|content.?policy|block|moderation/i.test(err)) {
                    ErrorIcon = IconShield;
                    hint = 'AI отклонил запрос по правилам безопасности. Попробуйте изменить пожелания или выбрать другую концепцию.';
                  } else if (/timeout|timed?.?out|ETIMEDOUT/i.test(err)) {
                    ErrorIcon = IconClock;
                    hint = 'Превышено время ожидания. Попробуйте ещё раз или выберите другой формат.';
                  } else if (/rate.?limit|429|too many/i.test(err)) {
                    ErrorIcon = IconTrafficLight;
                    hint = 'Слишком много запросов. Подождите немного и попробуйте снова.';
                  } else if (/лимит|quota|403/i.test(err)) {
                    ErrorIcon = IconChart;
                    hint = 'Обновите тариф в профиле для продолжения.';
                  }
                  return (
                    <>
                      <div style={{marginBottom: 8, color: 'var(--text-tertiary)'}}><ErrorIcon size={40} /></div>
                      <p>{err}</p>
                      {hint && <p style={{fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4}}>{hint}</p>}
                    </>
                  );
                })()}
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
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center'}}>
                  <button className={styles.btnPrimary} onClick={() => setShowResult(true)}>Открыть</button>
                  <button
                    className={styles.downloadBtn}
                    style={{flex: 'none', marginLeft: 0, padding: '10px 20px', cursor: 'pointer'}}
                    onClick={() => {
                      const url = generatedResult.imageUrl || generatedResult.imageDataUrl;
                      const proxyUrl = url.startsWith('data:') ? url : `/api/proxy-image?url=${encodeURIComponent(url)}`;
                      fetch(proxyUrl).then(r => r.blob()).then(blob => {
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `adgena-${generatedResult.generationId || 'result'}.webp`;
                        a.click();
                        URL.revokeObjectURL(a.href);
                      }).catch(() => setToast('Не удалось скачать'));
                    }}
                  >
                    Скачать
                  </button>
                </div>
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
                <button
                  className={styles.downloadBtn}
                  style={{cursor: 'pointer'}}
                  onClick={() => {
                    const url = generatedResult.imageUrl || generatedResult.imageDataUrl;
                    const proxyUrl = url.startsWith('data:') ? url : `/api/proxy-image?url=${encodeURIComponent(url)}`;
                    fetch(proxyUrl).then(r => r.blob()).then(blob => {
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `adgena-${generatedResult.generationId || 'result'}.webp`;
                      a.click();
                      URL.revokeObjectURL(a.href);
                    }).catch(() => setToast('Не удалось скачать'));
                  }}
                >
                  Скачать
                </button>
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

      {/* ONBOARDING TOUR */}
      {showOnboarding && (
        <div className={styles.resultModal} onClick={() => { setShowOnboarding(false); fetch('/api/auth/onboarded', { method: 'POST' }).catch(() => {}); }}>
          <div
            className={styles.resultModalContent}
            style={{maxWidth: 520, gridTemplateColumns: '1fr', padding: 32, textAlign: 'center', cursor: 'default'}}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{margin: '0 0 20px', fontSize: 22, color: 'var(--text-primary)'}}>Добро пожаловать в AdGena!</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', fontSize: 14, color: 'var(--text-secondary)'}}>
              <div style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
                <span style={{flexShrink: 0, color: 'var(--brand-primary)'}}><IconCamera size={28} /></span>
                <div><strong style={{color: 'var(--text-primary)'}}>1. Загрузите фото товара</strong><br />JPG, PNG или WebP до 10 МБ. Чем лучше качество — тем красивее результат.</div>
              </div>
              <div style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
                <span style={{flexShrink: 0, color: 'var(--brand-primary)'}}><IconPalette size={28} /></span>
                <div><strong style={{color: 'var(--text-primary)'}}>2. Выберите стиль</strong><br />Фото, карточка или реклама. Укажите категорию и концепцию — AI адаптирует палитру и композицию.</div>
              </div>
              <div style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
                <span style={{flexShrink: 0, color: 'var(--brand-primary)'}}><IconRocket size={28} /></span>
                <div><strong style={{color: 'var(--text-primary)'}}>3. Генерируйте!</strong><br />Нажмите кнопку — через 30-60 секунд получите результат. Можно доработать или создать новый вариант.</div>
              </div>
            </div>
            <button
              className={styles.btnPrimary}
              style={{marginTop: 24, alignSelf: 'center', padding: '12px 32px'}}
              onClick={() => { setShowOnboarding(false); fetch('/api/auth/onboarded', { method: 'POST' }).catch(() => {}); }}
            >
              Начать работу
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          role="status"
          style={{
            position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-secondary, #1a1d28)', color: 'var(--text-primary, #fff)',
            padding: '12px 18px', borderRadius: 10,
            border: '1px solid var(--border-primary, rgba(255,255,255,0.12))',
            boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
            fontSize: 13, maxWidth: 'calc(100vw - 40px)', zIndex: 10000,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
