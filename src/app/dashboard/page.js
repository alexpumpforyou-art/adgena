'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

// Content type tabs
const CONTENT_TYPES = [
  { id: 'photo', label: '📸 Фото', labelEn: '📸 Photo' },
  { id: 'card', label: '🃏 Карточка', labelEn: '🃏 Card' },
  { id: 'ads', label: '🎯 Реклама', labelEn: '🎯 Ads' },
];

// Concepts per content type (like Aidentika)
const CONCEPTS = {
  photo: [
    { id: 'in-use', name: 'В использовании', icon: '👤', desc: 'Товар в руках у человека' },
    { id: 'in-context', name: 'В окружении', icon: '🏠', desc: 'На столе, в интерьере, flat lay' },
    { id: 'studio', name: 'Каталог (студийно)', icon: '📸', desc: 'Чистый студийный фон' },
  ],
  card: [
    { id: 'infographic', name: 'Инфографика', icon: '📊', desc: 'Иконки, выноски, характеристики' },
    { id: 'minimal-card', name: 'Минималистичная', icon: '✨', desc: 'Чистая с названием и буллетами' },
    { id: 'gradient-card', name: 'Градиентная', icon: '🎨', desc: 'Яркий градиентный фон' },
  ],
  ads: [
    { id: 'ad-sale', name: 'Распродажа', icon: '🔥', desc: 'Баннер для скидок' },
    { id: 'ad-minimal', name: 'Минимал', icon: '🤍', desc: 'Apple-стиль' },
    { id: 'ad-story', name: 'Stories', icon: '📱', desc: 'Вертикальный для сторис' },
  ],
};

const SIZES = {
  photo: [
    { id: 'wb', name: 'Wildberries', w: 900, h: 1200 },
    { id: 'ozon', name: 'Ozon', w: 900, h: 1200 },
    { id: 'amazon', name: 'Amazon', w: 2000, h: 2000 },
    { id: 'ebay', name: 'eBay', w: 1600, h: 1600 },
  ],
  card: [
    { id: 'wb', name: 'Wildberries', w: 900, h: 1200 },
    { id: 'ozon', name: 'Ozon', w: 900, h: 1200 },
    { id: 'amazon', name: 'Amazon', w: 2000, h: 2000 },
  ],
  ads: [
    { id: 'fb-feed', name: 'Facebook/Instagram', w: 1080, h: 1080 },
    { id: 'fb-story', name: 'Stories/Reels', w: 1080, h: 1920 },
    { id: 'google-gdn', name: 'Google Display', w: 1200, h: 628 },
    { id: 'vk-post', name: 'ВКонтакте', w: 1080, h: 607 },
  ],
};

export default function DashboardPage() {
  const [tab, setTab] = useState('photo');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
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
  const fileInputRef = useRef(null);

  const concepts = CONCEPTS[tab] || [];
  const sizes = SIZES[tab] || [];

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
        body: JSON.stringify({
          productName,
          category: productDesc,
          type: tab,
        }),
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
    if (!uploadedImage || !selectedTemplate) return;
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      formData.append('templateId', selectedTemplate);
      formData.append('sizeId', selectedSize || sizes[0]?.id);
      formData.append('productName', productName);
      formData.append('productDesc', productDesc);
      formData.append('type', tab);
      if (generatedText) formData.append('text', JSON.stringify(generatedText));

      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedResult(data);
        setStep(4);
      }
    } catch (err) {
      console.error('Generation error:', err);
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
    setSelectedSize(null);
    setGeneratedResult(null);
    setGeneratedText(null);
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
                <button key={ct.id} className={`${styles.tab} ${tab===ct.id?styles.tabActive:''}`} onClick={()=>{setTab(ct.id);setSelectedTemplate(null);setSelectedSize(null);}}>
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
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className={styles.stepContent}>
              <div
                className={styles.dropzone}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className={styles.fileInput}
                />
                <div className={styles.dropzoneIcon}>📸</div>
                <h3>Перетащите фото товара сюда</h3>
                <p>или нажмите для выбора файла</p>
                <span className={styles.dropzoneFormats}>PNG, JPG, WebP • до 10 МБ</span>
              </div>
            </div>
          )}

          {/* Step 2: Template & Size */}
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

                {/* Concepts + Sizes */}
                <div className={styles.configPanel}>
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

                  <h3 className={styles.configTitle} style={{marginTop: 32}}>Размер</h3>
                  <div className={styles.sizeGrid}>
                    {sizes.map(s => (
                      <button
                        key={s.id}
                        className={`${styles.sizeBtn} ${selectedSize===s.id?styles.sizeBtnActive:''}`}
                        onClick={() => setSelectedSize(s.id)}
                      >
                        <span className={styles.sizeName}>{s.name}</span>
                        <span className={styles.sizeDim}>{s.w}×{s.h}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    className={`btn btn-primary ${styles.nextBtn}`}
                    disabled={!selectedTemplate}
                    onClick={() => setStep(3)}
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
                    <span>Концепция: {concepts.find(c=>c.id===selectedTemplate)?.name}</span>
                    <span>Размер: {sizes.find(s=>s.id===selectedSize)?.name || sizes[0]?.name}</span>
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
                  {(generatedResult?.imageDataUrl || generatedResult?.imageUrl) ? (
                    <img
                      src={generatedResult.imageDataUrl || generatedResult.imageUrl}
                      alt="Generated product card"
                      className={styles.resultImg}
                      onError={(e) => {
                        console.error('Image failed to load:', generatedResult.imageUrl);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div style="padding:40px;text-align:center;color:#ff6b6b"><p>⚠️ Изображение не загрузилось</p><p style="font-size:12px;margin-top:8px;color:#888">URL: ' + generatedResult.imageUrl + '</p></div>';
                      }}
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
                    <p style={{fontSize: '12px', color: '#666', marginBottom: '16px'}}>
                      Модель: {generatedResult.model}
                    </p>
                  )}
                  <div className={styles.resultBtns}>
                    {generatedResult?.imageUrl && (
                      <>
                        <a
                          href={generatedResult.imageUrl}
                          download={`adgena-card-${generatedResult.generationId || 'result'}.png`}
                          className="btn btn-primary btn-lg"
                        >
                          📥 Скачать PNG
                        </a>
                        <a
                          href={generatedResult.imageUrl}
                          download={`adgena-card-${generatedResult.generationId || 'result'}.jpg`}
                          className="btn btn-secondary"
                        >
                          📥 Скачать JPG
                        </a>
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
    </div>
  );
}
