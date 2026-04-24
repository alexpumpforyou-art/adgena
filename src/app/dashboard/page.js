'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import styles from './dashboard.module.css';

const TEMPLATES = [
  { id:'minimal-clean', name:'Минимализм', cat:'marketplace', pro:false, bg:'#ffffff', color:'#1a1a1a', desc:'Чистый белый фон' },
  { id:'gradient-modern', name:'Градиент', cat:'marketplace', pro:false, bg:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', desc:'Яркий градиентный фон' },
  { id:'dark-premium', name:'Премиум', cat:'marketplace', pro:true, bg:'linear-gradient(180deg,#0f0f1a,#1a1a2e)', color:'#f0e6d2', desc:'Тёмный фон, золото' },
  { id:'neon-vibrant', name:'Неон', cat:'marketplace', pro:true, bg:'linear-gradient(135deg,#0a0a1a,#1a0a2e)', color:'#00f5ff', desc:'Киберпанк стиль' },
  { id:'nature-organic', name:'Натуральный', cat:'marketplace', pro:false, bg:'linear-gradient(180deg,#f5f0e8,#e8e0d0)', color:'#2d5016', desc:'Эко-стиль' },
  { id:'ad-bold-sale', name:'Распродажа', cat:'ads', pro:false, bg:'linear-gradient(135deg,#ff416c,#ff4b2b)', color:'#fff', desc:'Яркий со скидкой' },
  { id:'ad-minimal-product', name:'Минимал', cat:'ads', pro:false, bg:'#fafafa', color:'#1a1a1a', desc:'Фокус на товаре' },
  { id:'ad-dark-luxury', name:'Люкс', cat:'ads', pro:true, bg:'linear-gradient(180deg,#0c0c1d,#1a1a3e)', color:'#e0d5c5', desc:'Премиальный креатив' },
  { id:'ad-social-story', name:'Stories', cat:'ads', pro:false, bg:'linear-gradient(180deg,#6366f1,#a855f7)', color:'#fff', desc:'Для сторис' },
];

const SIZES = {
  marketplace: [
    { id:'wb', name:'Wildberries', w:900, h:1200 },
    { id:'ozon', name:'Ozon', w:1200, h:1200 },
    { id:'yandex', name:'Яндекс Маркет', w:1200, h:1200 },
  ],
  ads: [
    { id:'fb-feed', name:'Facebook Feed', w:1080, h:1080 },
    { id:'fb-story', name:'FB/IG Story', w:1080, h:1920 },
    { id:'vk-post', name:'VK Пост', w:1080, h:1080 },
    { id:'tg-ad', name:'Telegram Ads', w:1080, h:1080 },
    { id:'google', name:'Google Display', w:1200, h:628 },
  ],
};

export default function DashboardPage() {
  const [tab, setTab] = useState('marketplace');
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

  const filteredTemplates = TEMPLATES.filter(t => t.cat === tab);
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
              <button className={`${styles.tab} ${tab==='marketplace'?styles.tabActive:''}`} onClick={()=>{setTab('marketplace');setSelectedTemplate(null);setSelectedSize(null);}}>
                📦 Карточки товара
              </button>
              <button className={`${styles.tab} ${tab==='ads'?styles.tabActive:''}`} onClick={()=>{setTab('ads');setSelectedTemplate(null);setSelectedSize(null);}}>
                🎯 Рекламные креативы
              </button>
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

                {/* Templates + Sizes */}
                <div className={styles.configPanel}>
                  <h3 className={styles.configTitle}>Выберите шаблон</h3>
                  <div className={styles.templateGrid}>
                    {filteredTemplates.map(t => (
                      <div
                        key={t.id}
                        className={`${styles.templateCard} ${selectedTemplate===t.id?styles.templateCardSelected:''}`}
                        onClick={() => setSelectedTemplate(t.id)}
                      >
                        <div className={styles.templatePreview} style={{background: t.bg}}>
                          <span style={{color: t.color, fontSize: '20px', fontWeight: 700}}>Aa</span>
                        </div>
                        <div className={styles.templateInfo}>
                          <span className={styles.templateName}>{t.name}</span>
                          {t.pro && <span className={styles.proBadge}>PRO</span>}
                        </div>
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
                    <span>Шаблон: {TEMPLATES.find(t=>t.id===selectedTemplate)?.name}</span>
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
                  {generatedResult?.imageUrl ? (
                    <img src={generatedResult.imageUrl} alt="Result" className={styles.resultImg} />
                  ) : (
                    <div className={styles.resultPlaceholder}>
                      <div className={styles.resultMockup}>
                        <div className={styles.mockupBg} style={{
                          background: TEMPLATES.find(t=>t.id===selectedTemplate)?.bg || '#1a1a2e'
                        }}>
                          {imagePreview && <img src={imagePreview} alt="" className={styles.mockupProduct} />}
                          <div className={styles.mockupText} style={{
                            color: TEMPLATES.find(t=>t.id===selectedTemplate)?.color || '#fff'
                          }}>
                            <h3>{generatedText?.title || generatedText?.headline || productName}</h3>
                            {(generatedText?.bullets || []).slice(0,3).map((b,i) => (
                              <p key={i} className={styles.mockupBullet}>✓ {b}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.resultActions}>
                  <h3>🎉 Карточка готова!</h3>
                  <p className={styles.resultInfo}>Ваша карточка сгенерирована с использованием AI</p>
                  <div className={styles.resultBtns}>
                    <button className="btn btn-primary btn-lg">📥 Скачать PNG</button>
                    <button className="btn btn-secondary">📥 Скачать JPG</button>
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
