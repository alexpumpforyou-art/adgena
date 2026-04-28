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
  { id: 'ad-sale',    name: 'Распродажа', desc: 'Баннер для скидок' },
  { id: 'ad-minimal', name: 'Минимал', desc: 'Apple-стиль' },
  { id: 'ad-story',   name: 'Stories', desc: 'Вертикальный для сторис' },
];

const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16' },
  { id: '3:4',  label: '3:4' },
  { id: '1:1',  label: '1:1' },
  { id: '4:3',  label: '4:3' },
  { id: '16:9', label: '16:9' },
];

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
  // Result modal
  const [improveText, setImproveText] = useState('');
  const [versions, setVersions] = useState([]);
  const [activeVersion, setActiveVersion] = useState(0);
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
  }, []);

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

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setGenerating(true);
    setGeneratedResult(null);
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('templateId', selectedConcept || 'infographic');
      formData.append('productName', productName);
      formData.append('type', tab);
      formData.append('category', category);
      formData.append('lang', 'ru');
      formData.append('wishes', wishes);
      formData.append('aspectRatio', aspectRatio);
      if (tab === 'card') {
        formData.append('cardText', cardText);
        formData.append('cardStyle', cardStyle);
        formData.append('creativity', creativity.toString());
      }

      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const v = { imageDataUrl: data.imageDataUrl, timestamp: new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'}), label: `V${versions.length}`, note: wishes || '—' };
        setVersions(prev => [...prev, v]);
        setActiveVersion(versions.length);
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
    const oldWishes = wishes;
    setWishes(improveText);
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('templateId', selectedConcept || 'infographic');
      formData.append('productName', productName);
      formData.append('type', tab);
      formData.append('category', category);
      formData.append('lang', 'ru');
      formData.append('wishes', improveText);
      formData.append('aspectRatio', aspectRatio);

      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const v = { imageDataUrl: data.imageDataUrl, timestamp: new Date().toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'}), label: `V${versions.length}`, note: improveText };
        setVersions(prev => [...prev, v]);
        setActiveVersion(versions.length);
        setGeneratedResult(data);
        setImproveText('');
      }
    } catch (err) {
      console.error('Improve error:', err);
    } finally {
      setGenerating(false);
      setWishes(oldWishes);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setProductName('');
    setSelectedConcept(null);
    setGeneratedResult(null);
    setWishes('');
    setCardText('');
    setVersions([]);
    setActiveVersion(0);
    setShowResult(false);
  };

  const handleAiSuggest = async () => {
    if (!productName.trim()) return;
    setAiSuggesting(true);
    try {
      const res = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Ты — копирайтер для маркетплейсов. Для товара "${productName}" (категория: ${CATEGORIES.find(c => c.id === category)?.name || category}) напиши 3-5 ключевых преимуществ и продающих особенностей, разделяя запятыми. Кратко, по-русски, без номеров. Только преимущества, ничего больше.`
        }),
      });
      const data = await res.json();
      if (data.text) setCardText(data.text);
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
              <div key={g.id} className={styles.historyItem}>
                <div className={styles.historyItemInfo}>
                  <span className={styles.historyName}>{g.productName || '—'}</span>
                  <span className={styles.historyMeta}>{g.type} • {g.templateId} • {new Date(g.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
                <span className={`${styles.historyStatus} ${g.status === 'done' ? styles.historyStatusDone : ''}`}>
                  {g.status === 'done' ? '✓' : '…'}
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

          {/* ADS: concept picker */}
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
            </>
          )}

          {/* Wishes (photo + card) */}
          {(tab === 'photo' || tab === 'card') && (
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
          )}

          {/* Format — visual shapes */}
          <label className={styles.label} style={{marginTop: 16}}>Формат</label>
          <div className={styles.ratioRow}>
            {ASPECT_RATIOS.map(r => {
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
                >
                  <span className={styles.ratioShape} style={{ width: shapeW, height: shapeH }} />
                  <span className={styles.ratioLabel}>{r.label}</span>
                </button>
              );
            })}
          </div>
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
      </aside>

      {/* RIGHT PANEL — Results */}
      <main className={styles.rightPanel}>
        {!generating && !generatedResult && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}></div>
            <h2>Ваши результаты</h2>
            <p>Загрузите фото, выберите настройки и нажмите «Сгенерировать»</p>
          </div>
        )}
        {generating && (
          <div className={styles.emptyState}>
            <div className={styles.loadingPulse}><span className={styles.spinner} /></div>
            <h2>Генерация...</h2>
            <p>Обычно занимает 20-30 секунд</p>
          </div>
        )}
        {generatedResult && !generating && !showResult && (
          <div className={styles.emptyState}>
            {generatedResult.error ? (
              <div className={styles.errorBlock}>
                <p>{generatedResult.error}</p>
                <button className={styles.linkBtn} onClick={() => setGeneratedResult(null)}>Попробовать снова</button>
              </div>
            ) : (
              <div className={styles.resultArea}>
                <div className={styles.resultImageWrap} onClick={() => setShowResult(true)}>
                  <img src={generatedResult.imageDataUrl} alt="Generated" className={styles.resultImage} />
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
            {/* Close */}
            <button className={styles.modalClose} onClick={() => setShowResult(false)}>✕</button>

            {/* Left: Image */}
            <div className={styles.modalLeft}>
              <div className={styles.modalImageWrap}>
                <img src={versions[activeVersion]?.imageDataUrl || generatedResult.imageDataUrl} alt="Result" className={styles.modalImage} />
              </div>
              <div className={styles.modalImageActions}>
                <button className={styles.iconBtn} title="Нравится">+</button>
                <button className={styles.iconBtn} title="Не нравится">&minus;</button>
                <a
                  href={versions[activeVersion]?.imageDataUrl || generatedResult.imageDataUrl}
                  download={`adgena-${generatedResult.generationId || 'result'}.jpg`}
                  className={styles.downloadBtn}
                >
                  Скачать оригинал
                </a>
              </div>
            </div>

            {/* Right: Info + Improve + Versions */}
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

              {/* Quick actions */}
              <div className={styles.modalQuickActions}>
                <button className={styles.quickBtn} onClick={() => { setTab('card'); setShowResult(false); }}>Создать карточку</button>
                <button className={styles.quickBtn} disabled title="Скоро">Создать видео</button>
              </div>

              {/* Improve */}
              <div className={styles.modalSection}>
                <div className={styles.modalLabelRow}>
                  <span className={styles.modalLabel}>Улучшения</span>
                  <span className={styles.modalCount}>Сделано: {versions.length > 0 ? versions.length - 1 : 0}</span>
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
                  disabled={!improveText.trim() || generating}
                  onClick={handleImprove}
                >
                  {generating ? 'Улучшаю...' : 'Улучшить'}
                </button>
              </div>

              {/* Versions */}
              <div className={styles.modalSection}>
                <div className={styles.modalLabelRow}>
                  <span className={styles.modalLabel}>Версии</span>
                  <span className={styles.modalCount}>Текущая: V{activeVersion}</span>
                </div>
                <div className={styles.versionList}>
                  {versions.map((v, i) => (
                    <div
                      key={i}
                      className={`${styles.versionItem} ${activeVersion === i ? styles.versionItemActive : ''}`}
                      onClick={() => { setActiveVersion(i); setGeneratedResult(prev => ({...prev, imageDataUrl: v.imageDataUrl})); }}
                    >
                      <span className={styles.versionLabel}>{v.label} {i === 0 ? '- Оригинал' : ''}</span>
                      <span className={styles.versionTime}>{v.timestamp}</span>
                      <span className={styles.versionNote}>{v.note}</span>
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
