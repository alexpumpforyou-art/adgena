'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

// Content type tabs
const CONTENT_TYPES = [
  { id: 'photo', label: '📸 Фото' },
  { id: 'card', label: '🃏 Карточка' },
  { id: 'ads', label: '🎯 Реклама' },
];

// Categories
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

// Category-specific photo concepts
const PHOTO_CONCEPTS = {
  clothing: [
    { id: 'on-model', name: 'На модели',         icon: '👤', desc: 'Носимый контекст, акцент на посадке' },
    { id: 'in-store', name: 'Как в магазине',     icon: '🏪', desc: 'На вешалке или подставке' },
    { id: 'flat-lay', name: 'Раскладка сверху',   icon: '📐', desc: 'Вид строго сверху' },
    { id: 'studio',   name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  accessories: [
    { id: 'on-model',   name: 'На модели',         icon: '👤', desc: 'На руке, шее, в ушах' },
    { id: 'flat-lay',   name: 'Раскладка сверху',   icon: '📐', desc: 'Flat lay с аксессуарами' },
    { id: 'in-context', name: 'В окружении',        icon: '🏠', desc: 'На столе, у зеркала' },
    { id: 'studio',     name: 'Каталог (студийно)',  icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  food: [
    { id: 'plated',     name: 'Сервировка',          icon: '🍽️', desc: 'На тарелке, в бокале' },
    { id: 'in-context', name: 'В окружении',          icon: '🏠', desc: 'На кухне, с ингредиентами' },
    { id: 'flat-lay',   name: 'Раскладка сверху',     icon: '📐', desc: 'Вид сверху с ингредиентами' },
    { id: 'studio',     name: 'Каталог (студийно)',    icon: '📸', desc: 'Упаковка на чистом фоне' },
  ],
  beauty: [
    { id: 'in-use',     name: 'В использовании',     icon: '👤', desc: 'Нанесение на кожу, в руках' },
    { id: 'in-context', name: 'В окружении',          icon: '🏠', desc: 'Ванная, полка, зеркало' },
    { id: 'texture',    name: 'Текстура крупно',      icon: '🧪', desc: 'Текстура крема, масла' },
    { id: 'studio',     name: 'Каталог (студийно)',    icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  gadgets: [
    { id: 'in-use',     name: 'В использовании',     icon: '👐', desc: 'Руки, рабочий процесс' },
    { id: 'in-context', name: 'В окружении',          icon: '🏠', desc: 'Стол, рабочее место' },
    { id: 'close-up',   name: 'Крупный план',         icon: '🔍', desc: 'Кнопки, экраны, детали' },
    { id: 'studio',     name: 'Каталог (студийно)',    icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  home: [
    { id: 'in-interior',name: 'В интерьере',          icon: '🏠', desc: 'В комнате, на своём месте' },
    { id: 'in-use',     name: 'В использовании',     icon: '👤', desc: 'Человек использует предмет' },
    { id: 'close-up',   name: 'Крупный план',         icon: '🔍', desc: 'Текстура, материал, детали' },
    { id: 'studio',     name: 'Каталог (студийно)',    icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  kids: [
    { id: 'in-use',     name: 'Ребёнок с товаром',   icon: '👶', desc: 'Ребёнок играет, использует' },
    { id: 'in-context', name: 'В детской',            icon: '🏠', desc: 'В детской комнате' },
    { id: 'flat-lay',   name: 'Раскладка сверху',     icon: '📐', desc: 'Вид сверху среди игрушек' },
    { id: 'studio',     name: 'Каталог (студийно)',    icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
  other: [
    { id: 'in-use',     name: 'В использовании',     icon: '👤', desc: 'Товар в процессе использования' },
    { id: 'in-context', name: 'В окружении',          icon: '🏠', desc: 'В подходящей обстановке' },
    { id: 'flat-lay',   name: 'Раскладка сверху',     icon: '📐', desc: 'Вид строго сверху' },
    { id: 'studio',     name: 'Каталог (студийно)',    icon: '📸', desc: 'Чистый объект на нейтральном фоне' },
  ],
};

// Ad concepts
const AD_CONCEPTS = [
  { id: 'ad-sale',    name: 'Распродажа', icon: '🔥', desc: 'Баннер для скидок' },
  { id: 'ad-minimal', name: 'Минимал',    icon: '🤍', desc: 'Apple-стиль' },
  { id: 'ad-story',   name: 'Stories',    icon: '📱', desc: 'Вертикальный для сторис' },
];

// Aspect ratios
const ASPECT_RATIOS = [
  { id: '9:16', label: '9:16' },
  { id: '3:4',  label: '3:4' },
  { id: '1:1',  label: '1:1' },
  { id: '4:3',  label: '4:3' },
  { id: '16:9', label: '16:9' },
];

export default function DashboardPage() {
  // Core state
  const [tab, setTab] = useState('photo');
  const [category, setCategory] = useState('other');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [generatedText, setGeneratedText] = useState(null);
  const [textLoading, setTextLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const fileInputRef = useRef(null);

  // Photo-specific
  const [wishes, setWishes] = useState('');

  // Card-specific
  const [cardText, setCardText] = useState('');
  const [cardStyle, setCardStyle] = useState('classic');
  const [creativity, setCreativity] = useState(0.5);
  const [aspectRatio, setAspectRatio] = useState('3:4');

  // Computed
  const concepts = tab === 'photo'
    ? (PHOTO_CONCEPTS[category] || PHOTO_CONCEPTS.other)
    : tab === 'ads'
      ? AD_CONCEPTS
      : []; // card doesn't use concepts

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    if (step === 1) setStep(2);
  }, [step]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    if (step === 1) setStep(2);
  }, [step]);

  const handleGenerateText = async () => {
    if (!productName.trim()) return;
    setTextLoading(true);
    try {
      const res = await fetch('/api/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, category, type: tab }),
      });
      const data = await res.json();
      if (data.success) setGeneratedText(data.result);
    } catch (err) {
      console.error('Text generation error:', err);
    } finally {
      setTextLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;
    if ((tab === 'photo' || tab === 'ads') && !selectedTemplate) return;
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('templateId', selectedTemplate || 'infographic');
      formData.append('productName', productName);
      formData.append('productDesc', productDesc);
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
      if (generatedText) formData.append('text', JSON.stringify(generatedText));

      const res = await fetch('/api/generate', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setGeneratedResult(data);
        setStep(4);
      } else {
        setGeneratedResult({ error: data.error });
        setStep(4);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setGeneratedResult({ error: err.message });
      setStep(4);
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setProductName('');
    setProductDesc('');
    setSelectedTemplate(null);
    setGeneratedResult(null);
    setGeneratedText(null);
    setWishes('');
    setCardText('');
    setStep(1);
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>AdGena</span>
          </Link>
          <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◁' : '▷'}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <a href="#" className={`${styles.navItem} ${styles.navItemActive}`}>
            <span className={styles.navIcon}>🎨</span>
            {sidebarOpen && <span>Генератор</span>}
          </a>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>📁</span>
            {sidebarOpen && <span>Мои проекты</span>}
          </a>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>📊</span>
            {sidebarOpen && <span>Шаблоны</span>}
          </a>
          <a href="#" className={styles.navItem}>
            <span className={styles.navIcon}>⚙️</span>
            {sidebarOpen && <span>Настройки</span>}
          </a>
        </nav>

        {sidebarOpen && (
          <div className={styles.sidebarFooter}>
            <div className={styles.usageCard}>
              <div className={styles.usageHeader}>
                <span>Генерации</span>
                <span className={styles.usageBadge}>Free</span>
              </div>
              <div className={styles.usageBar}>
                <div className={styles.usageBarFill} style={{ width: '40%' }} />
              </div>
              <span className={styles.usageText}>2 / 5 использовано</span>
              <Link href="/#pricing" className={`btn btn-primary btn-sm ${styles.upgradeBtn}`}>
                Улучшить план
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1 className={styles.pageTitle}>Генератор</h1>
            <div className={styles.tabs}>
              {CONTENT_TYPES.map(ct => (
                <button key={ct.id} className={`${styles.tab} ${tab===ct.id?styles.tabActive:''}`} onClick={()=>{setTab(ct.id);setSelectedTemplate(null);}}>
                  {ct.label}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.credits}>
              <span className={styles.creditsIcon}>✨</span>
              <span>3 генерации</span>
            </div>
          </div>
        </div>

        {/* Steps Progress */}
        <div className={styles.stepsBar}>
          {['Загрузка фото', 'Шаблон и размер', 'Текст и настройки', 'Результат'].map((s, i) => (
            <div key={i} className={`${styles.stepItem} ${step > i ? styles.stepDone : ''} ${step === i+1 ? styles.stepCurrent : ''}`}>
              <div className={styles.stepDot}>{step > i+1 ? '✓' : i+1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className={styles.workspace}>
          {/* Step 1: Upload + Product Info */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.stepOneLayout}>
                {/* Upload zone */}
                <div
                  className={styles.dropzone}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className={styles.fileInput} />
                  <div className={styles.dropzoneIcon}>📸</div>
                  <h3>Перетащите фото товара сюда</h3>
                  <p>или нажмите для выбора файла</p>
                  <span className={styles.dropzoneFormats}>PNG, JPG, WebP • до 10 МБ</span>
                </div>

                {/* Product info */}
                <div className={styles.productInfo}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Название товара</label>
                    <input
                      type="text"
                      className={styles.textInput}
                      placeholder="Например: Аппендикс-вера"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Категория</label>
                    <select
                      className={styles.selectInput}
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setSelectedTemplate(null); }}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Settings (content-type dependent) */}
          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.stepTwoLayout}>
                {/* Preview */}
                <div className={styles.previewPanel}>
                  <div className={styles.previewCard}>
                    {imagePreview && <img src={imagePreview} alt="Preview" className={styles.previewImg} />}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setStep(1); setUploadedImage(null); setImagePreview(null); }}>
                    Загрузить другое фото
                  </button>
                </div>

                {/* Config panel */}
                <div className={styles.configPanel}>

                  {/* PHOTO: category-dependent concepts */}
                  {tab === 'photo' && (
                    <>
                      <h3 className={styles.configTitle}>Как показать товар?</h3>
                      <div className={styles.templateGrid}>
                        {concepts.map(c => (
                          <div
                            key={c.id}
                            className={`${styles.templateCard} ${selectedTemplate===c.id?styles.templateCardSelected:''}`}
                            onClick={() => setSelectedTemplate(c.id)}
                          >
                            <div className={styles.templatePreview} style={{background: 'var(--bg-tertiary)', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                              {c.icon}
                            </div>
                            <div className={styles.templateInfo}>
                              <span className={styles.templateName}>{c.name}</span>
                            </div>
                            <span style={{fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '0 4px'}}>{c.desc}</span>
                          </div>
                        ))}
                      </div>

                      {/* Wishes */}
                      <div className={styles.fieldGroup} style={{marginTop: 24}}>
                        <label className={styles.fieldLabel}>Пожелания <span style={{color:'var(--text-tertiary)', fontWeight: 400}}>({wishes.length}/2000)</span></label>
                        <textarea
                          className={styles.textArea}
                          rows={3}
                          maxLength={2000}
                          placeholder="Например: мягкий свет, минимализм, нейтральный фон."
                          value={wishes}
                          onChange={(e) => setWishes(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {/* CARD: text input + settings */}
                  {tab === 'card' && (
                    <>
                      <h3 className={styles.configTitle}>О чём рассказать?</h3>
                      <textarea
                        className={styles.textArea}
                        rows={4}
                        maxLength={2000}
                        placeholder="Напишите в свободной форме, какой текст хотите видеть на карточке (преимущества или качества товара)."
                        value={cardText}
                        onChange={(e) => setCardText(e.target.value)}
                      />
                      <p className={styles.fieldHint}>Например: натуральный состав, приятный запах, быстрый эффект...</p>

                      {/* Card style */}
                      <h3 className={styles.configTitle} style={{marginTop: 24}}>Стиль карточки</h3>
                      <div className={styles.styleBtns}>
                        {['classic', 'premium'].map(s => (
                          <button
                            key={s}
                            className={`${styles.styleBtn} ${cardStyle === s ? styles.styleBtnActive : ''}`}
                            onClick={() => setCardStyle(s)}
                          >
                            {s === 'classic' ? 'Классический' : 'Премиум'}
                          </button>
                        ))}
                      </div>

                      {/* Creativity slider */}
                      <div className={styles.fieldGroup} style={{marginTop: 20}}>
                        <label className={styles.fieldLabel}>Креативность</label>
                        <div className={styles.sliderRow}>
                          <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Точная копия</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={creativity}
                            onChange={(e) => setCreativity(parseFloat(e.target.value))}
                            className={styles.slider}
                          />
                          <span style={{fontSize: '12px', color: 'var(--text-tertiary)'}}>Свободный стиль</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ADS: ad concepts */}
                  {tab === 'ads' && (
                    <>
                      <h3 className={styles.configTitle}>Тип рекламы</h3>
                      <div className={styles.templateGrid}>
                        {concepts.map(c => (
                          <div
                            key={c.id}
                            className={`${styles.templateCard} ${selectedTemplate===c.id?styles.templateCardSelected:''}`}
                            onClick={() => setSelectedTemplate(c.id)}
                          >
                            <div className={styles.templatePreview} style={{background: 'var(--bg-tertiary)', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                              {c.icon}
                            </div>
                            <div className={styles.templateInfo}>
                              <span className={styles.templateName}>{c.name}</span>
                            </div>
                            <span style={{fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '0 4px'}}>{c.desc}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Format (aspect ratio) — shared */}
                  <h3 className={styles.configTitle} style={{marginTop: 24}}>Формат</h3>
                  <div className={styles.ratioGrid}>
                    {ASPECT_RATIOS.map(r => (
                      <button
                        key={r.id}
                        className={`${styles.ratioBtn} ${aspectRatio===r.id?styles.ratioBtnActive:''}`}
                        onClick={() => setAspectRatio(r.id)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <button
                    className={`btn btn-primary ${styles.nextBtn}`}
                    disabled={tab !== 'card' && !selectedTemplate}
                    onClick={() => setStep(3)}
                    style={{marginTop: 24}}
                  >
                    Далее →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Text & Settings */}
          {step === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.stepTwoLayout}>
                {/* Preview */}
                <div className={styles.previewPanel}>
                  <div className={styles.previewCard}>
                    {imagePreview && <img src={imagePreview} alt="Preview" className={styles.previewImg} />}
                  </div>
                  <div className={styles.previewMeta}>
                    <span>{tab === 'photo' ? `Концепция: ${concepts.find(c=>c.id===selectedTemplate)?.name || '—'}` : tab === 'card' ? `Карточка (${cardStyle})` : `Реклама: ${concepts.find(c=>c.id===selectedTemplate)?.name || '—'}`}</span>
                    <span>Формат: {aspectRatio}</span>
                    <span>Категория: {CATEGORIES.find(c=>c.id===category)?.name}</span>
                  </div>
                </div>

                {/* Text Config */}
                <div className={styles.configPanel}>
                  <h3 className={styles.configTitle}>Информация о товаре</h3>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Название товара *</label>
                    <input
                      type="text"
                      className={`input ${styles.formInput}`}
                      placeholder="Например: Беспроводные наушники TWS Pro"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Категория / Описание</label>
                    <textarea
                      className={`input textarea ${styles.formInput}`}
                      placeholder="Электроника, наушники, bluetooth 5.3, шумоподавление..."
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <button
                    className={`btn btn-secondary ${styles.aiBtn}`}
                    onClick={handleGenerateText}
                    disabled={!productName.trim() || textLoading}
                  >
                    {textLoading ? (
                      <><span className={styles.spinner} /> Генерирую текст...</>
                    ) : (
                      <>✨ Сгенерировать текст с AI</>
                    )}
                  </button>

                  {generatedText && (
                    <div className={styles.generatedTextBlock}>
                      <h4>🤖 Сгенерированный текст:</h4>
                      <div className={styles.genTextItem}>
                        <strong>Заголовок:</strong>
                        <p>{generatedText.title || generatedText.headline}</p>
                      </div>
                      {(generatedText.bullets || []).length > 0 && (
                        <div className={styles.genTextItem}>
                          <strong>Буллеты:</strong>
                          <ul>{generatedText.bullets.map((b,i) => <li key={i}>{b}</li>)}</ul>
                        </div>
                      )}
                      {generatedText.description && (
                        <div className={styles.genTextItem}>
                          <strong>Описание:</strong>
                          <p>{generatedText.description || generatedText.body}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.stepActions}>
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>← Назад</button>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleGenerate}
                      disabled={!productName.trim() || generating}
                    >
                      {generating ? (
                        <><span className={styles.spinner} /> Генерирую...</>
                      ) : (
                        <>⚡ Сгенерировать карточку</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Result */}
          {step === 4 && (
            <div className={styles.stepContent}>
              <div className={styles.resultLayout}>
                <div className={styles.resultPreview}>
                  {(generatedResult?.imageDataUrl) ? (
                    <img
                      src={generatedResult.imageDataUrl}
                      alt="Generated product card"
                      className={styles.resultImg}
                      onClick={() => setFullscreen(true)}
                      style={{cursor: 'zoom-in'}}
                    />
                  ) : generatedResult?.error ? (
                    <div style={{padding: '40px', textAlign: 'center'}}>
                      <p style={{color: '#ff6b6b', fontSize: '18px'}}>❌ Ошибка генерации</p>
                      <p style={{color: '#888', fontSize: '14px', marginTop: '8px'}}>{generatedResult.error}</p>
                      <button className="btn btn-primary" style={{marginTop: '16px'}} onClick={() => setStep(3)}>
                        Попробовать снова
                      </button>
                    </div>
                  ) : (
                    <div style={{padding: '40px', textAlign: 'center'}}>
                      <span className={styles.spinner} />
                      <p style={{marginTop: '12px', color: '#888'}}>Загрузка...</p>
                    </div>
                  )}
                </div>
                <div className={styles.resultActions}>
                  <h3>🎉 Карточка готова!</h3>
                  <p className={styles.resultInfo}>Ваша карточка сгенерирована с использованием AI</p>
                  {generatedResult?.model && (
                    <p style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
                      Модель: {generatedResult.model}
                    </p>
                  )}
                  {generatedResult?.dimensions && (
                    <p style={{fontSize: '12px', color: '#666', marginBottom: '16px'}}>
                      Размер: {generatedResult.dimensions.w}×{generatedResult.dimensions.h}px
                    </p>
                  )}
                  <div className={styles.resultBtns}>
                    {generatedResult?.imageDataUrl && (
                      <>
                        <a
                          href={generatedResult.imageDataUrl}
                          download={`adgena-${generatedResult.generationId || 'card'}.jpg`}
                          className="btn btn-primary btn-lg"
                        >
                          📥 Скачать
                        </a>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setFullscreen(true)}
                        >
                          🔍 На весь экран
                        </button>
                      </>
                    )}
                    <button className="btn btn-ghost" onClick={handleReset}>🔄 Создать новую</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fullscreen Lightbox */}
      {fullscreen && generatedResult?.imageDataUrl && (
        <div
          className={styles.lightbox}
          onClick={() => setFullscreen(false)}
        >
          <button
            className={styles.lightboxClose}
            onClick={() => setFullscreen(false)}
          >✕</button>
          <img
            src={generatedResult.imageDataUrl}
            alt="Fullscreen preview"
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <div className={styles.lightboxActions} onClick={(e) => e.stopPropagation()}>
            <a
              href={generatedResult.imageDataUrl}
              download={`adgena-${generatedResult.generationId || 'card'}.jpg`}
              className="btn btn-primary"
            >
              📥 Скачать
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
