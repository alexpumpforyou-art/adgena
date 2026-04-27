'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './dashboard.module.css';

// ========================================
// DATA
// ========================================

const CONTENT_TYPES = [
  { id: 'photo', label: '📸 Фото' },
  { id: 'card', label: '🃏 Карточка' },
  { id: 'ads', label: '🎯 Реклама' },
];

const CATEGORIES = [
  { id: 'clothing',    name: 'Одежда и обувь',   icon: '👗' },
  { id: 'accessories', name: 'Аксессуары',        icon: '💍' },
  { id: 'food',        name: 'Еда и напитки',     icon: '🍕' },
  { id: 'beauty',      name: 'Косметика и уход',  icon: '💄' },
  { id: 'gadgets',     name: 'Гаджеты и техника', icon: '📱' },
  { id: 'home',        name: 'Дом и сад',         icon: '🏠' },
  { id: 'kids',        name: 'Детские товары',     icon: '🧸' },
  { id: 'other',       name: 'Прочее',            icon: '📦' },
];

const PHOTO_CONCEPTS = {
  clothing: [
    { id: 'on-model', name: 'На модели', icon: '👤', desc: 'Носимый контекст, акцент на посадке' },
    { id: 'in-store', name: 'Как в магазине', icon: '🏪', desc: 'На вешалке или подставке' },
    { id: 'flat-lay', name: 'Раскладка сверху', icon: '📐', desc: 'Вид строго сверху' },
    { id: 'studio',   name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  accessories: [
    { id: 'on-model',   name: 'На модели', icon: '👤', desc: 'На руке, шее, в ушах' },
    { id: 'flat-lay',   name: 'Раскладка сверху', icon: '📐', desc: 'Flat lay с аксессуарами' },
    { id: 'in-context', name: 'В окружении', icon: '🏠', desc: 'На столе, у зеркала' },
    { id: 'studio',     name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  food: [
    { id: 'plated',     name: 'Сервировка', icon: '🍽️', desc: 'На тарелке, в бокале' },
    { id: 'in-context', name: 'В окружении', icon: '🏠', desc: 'На кухне, с ингредиентами' },
    { id: 'flat-lay',   name: 'Раскладка сверху', icon: '📐', desc: 'Вид сверху с ингредиентами' },
    { id: 'studio',     name: 'Каталог (студийно)', icon: '📸', desc: 'Упаковка на чистом фоне' },
  ],
  beauty: [
    { id: 'in-use',     name: 'В использовании', icon: '👤', desc: 'Нанесение на кожу, в руках' },
    { id: 'in-context', name: 'В окружении', icon: '🏠', desc: 'Ванная, полка, зеркало' },
    { id: 'texture',    name: 'Текстура крупно', icon: '🧪', desc: 'Текстура крема, масла' },
    { id: 'studio',     name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  gadgets: [
    { id: 'in-use',     name: 'В использовании', icon: '👐', desc: 'Руки, рабочий процесс' },
    { id: 'in-context', name: 'В окружении', icon: '🏠', desc: 'Стол, рабочее место' },
    { id: 'close-up',   name: 'Крупный план', icon: '🔍', desc: 'Кнопки, экраны, детали' },
    { id: 'studio',     name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  home: [
    { id: 'in-interior', name: 'В интерьере', icon: '🏠', desc: 'В комнате, на своём месте' },
    { id: 'in-use',      name: 'В использовании', icon: '👤', desc: 'Человек использует предмет' },
    { id: 'close-up',    name: 'Крупный план', icon: '🔍', desc: 'Текстура, материал, детали' },
    { id: 'studio',      name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  kids: [
    { id: 'in-use',     name: 'Ребёнок с товаром', icon: '👶', desc: 'Ребёнок играет, использует' },
    { id: 'in-context', name: 'В детской', icon: '🏠', desc: 'В детской комнате' },
    { id: 'flat-lay',   name: 'Раскладка сверху', icon: '📐', desc: 'Вид сверху среди игрушек' },
    { id: 'studio',     name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  other: [
    { id: 'in-use',     name: 'В использовании', icon: '👤', desc: 'Товар в процессе использования' },
    { id: 'in-context', name: 'В окружении', icon: '🏠', desc: 'В подходящей обстановке' },
    { id: 'flat-lay',   name: 'Раскладка сверху', icon: '📐', desc: 'Вид строго сверху' },
    { id: 'studio',     name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
};

const AD_CONCEPTS = [
  { id: 'ad-sale',    name: 'Распродажа', icon: '🔥', desc: 'Баннер для скидок' },
  { id: 'ad-minimal', name: 'Минимал', icon: '🤍', desc: 'Apple-стиль' },
  { id: 'ad-story',   name: 'Stories', icon: '📱', desc: 'Вертикальный для сторис' },
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
  const [fullscreen, setFullscreen] = useState(false);
  const fileInputRef = useRef(null);

  // Photo
  const [wishes, setWishes] = useState('');
  // Card
  const [cardText, setCardText] = useState('');
  const [cardStyle, setCardStyle] = useState('classic');
  const [creativity, setCreativity] = useState(0.5);
  // Shared
  const [aspectRatio, setAspectRatio] = useState('3:4');

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
      setGeneratedResult(data.success ? data : { error: data.error || 'Ошибка генерации' });
    } catch (err) {
      setGeneratedResult({ error: err.message });
    } finally {
      setGenerating(false);
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
  };

  // --- Render ---

  return (
    <div className={styles.page}>
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
              <label className={styles.label} style={{marginTop: 16}}>О чём рассказать?</label>
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

          {/* Format */}
          <label className={styles.label} style={{marginTop: 16}}>Формат</label>
          <div className={styles.ratioRow}>
            {ASPECT_RATIOS.map(r => (
              <button
                key={r.id}
                className={`${styles.ratioBtn} ${aspectRatio === r.id ? styles.ratioBtnActive : ''}`}
                onClick={() => setAspectRatio(r.id)}
              >
                {r.label}
              </button>
            ))}
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
            <>⚡ Сгенерировать</>
          )}
        </button>
      </aside>

      {/* RIGHT PANEL — Results */}
      <main className={styles.rightPanel}>
        {/* Empty state */}
        {!generatedResult && !generating && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎨</div>
            <h2>Ваши результаты</h2>
            <p>Загрузите фото, выберите настройки и нажмите «Сгенерировать»</p>
          </div>
        )}

        {/* Loading state */}
        {generating && (
          <div className={styles.emptyState}>
            <div className={styles.loadingPulse}>
              <span className={styles.spinner} />
            </div>
            <h2>Генерация...</h2>
            <p>Обычно занимает 20-30 секунд</p>
          </div>
        )}

        {/* Result */}
        {generatedResult && !generating && (
          <div className={styles.resultArea}>
            {generatedResult.error ? (
              <div className={styles.errorBlock}>
                <p>❌ {generatedResult.error}</p>
                <button className={styles.linkBtn} onClick={() => setGeneratedResult(null)}>Попробовать снова</button>
              </div>
            ) : (
              <>
                <div className={styles.resultImageWrap}>
                  <img
                    src={generatedResult.imageDataUrl}
                    alt="Generated"
                    className={styles.resultImage}
                    onClick={() => setFullscreen(true)}
                  />
                </div>
                <div className={styles.resultMeta}>
                  {generatedResult.dimensions && (
                    <span className={styles.metaBadge}>{generatedResult.dimensions.w}×{generatedResult.dimensions.h}</span>
                  )}
                  {generatedResult.model && (
                    <span className={styles.metaBadge}>{generatedResult.model}</span>
                  )}
                </div>
                <div className={styles.resultActions}>
                  <a
                    href={generatedResult.imageDataUrl}
                    download={`adgena-${generatedResult.generationId || 'result'}.jpg`}
                    className={styles.btnPrimary}
                  >
                    📥 Скачать
                  </a>
                  <button className={styles.btnSecondary} onClick={() => setFullscreen(true)}>
                    🔍 На весь экран
                  </button>
                  <button className={styles.btnGhost} onClick={handleReset}>
                    🔄 Создать новую
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Fullscreen Lightbox */}
      {fullscreen && generatedResult?.imageDataUrl && (
        <div className={styles.lightbox} onClick={() => setFullscreen(false)}>
          <button className={styles.lightboxClose} onClick={() => setFullscreen(false)}>✕</button>
          <img
            src={generatedResult.imageDataUrl}
            alt="Fullscreen"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <div className={styles.lightboxActions} onClick={(e) => e.stopPropagation()}>
            <a href={generatedResult.imageDataUrl} download={`adgena-${generatedResult.generationId || 'result'}.jpg`} className={styles.btnPrimary}>
              📥 Скачать
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
