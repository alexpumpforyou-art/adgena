# AdGena — Проектная документация

> AI-генератор рекламных креативов для маркетплейсов
> Последнее обновление: 2026-05-06

---

## 🏗️ Стек

| Компонент | Технология |
|-----------|-----------|
| Фреймворк | Next.js 16 (App Router, standalone output) |
| UI | React 19, CSS Modules |
| БД | SQLite (better-sqlite3), файл `data/adgena.db` |
| AI | APIYI (gpt-image-2, gemini-3-pro, GPT 5.4) |
| Хранилище | Yandex Object Storage (S3-совместимое) |
| Платежи | Robokassa (разовые + рекуррентные) |
| OAuth | Google, Яндекс ID |
| Email | Resend |
| Хостинг | Railway (Node.js, persistent volume `/app/data`) |
| Домен | adgena.pro |
| CDN/DNS | Cloudflare |
| Аналитика | Яндекс.Метрика (ID: 109048904) |

---

## 📁 Структура проекта

```
src/
├── app/
│   ├── page.js              — Лендинг (RU)
│   ├── layout.js            — Root layout (метрика, favicons)
│   ├── admin/page.js        — Админка
│   ├── auth/page.js         — Авторизация (RU)
│   ├── checkout/page.js     — Оплата (RU)
│   ├── dashboard/page.js    — Дашборд генерации
│   ├── profile/page.js      — Профиль пользователя
│   ├── payment/success/     — Успешная оплата
│   ├── payment/fail/        — Ошибка оплаты
│   ├── en/                  — Английская версия (landing, auth, checkout, terms, privacy)
│   ├── terms/, privacy/     — Правовые страницы (RU)
│   ├── sitemap.js           — Динамический sitemap.xml
│   ├── robots.js            — robots.txt
│   └── api/                 — API Routes (см. ниже)
├── components/
│   ├── LandingPage.js       — Лендинг компонент
│   ├── AuthPage.js          — Форма регистрации/входа
│   └── CheckoutPage.js      — Страница оплаты
├── lib/
│   ├── apiyi.js             — AI-генерация (APIYI клиент)
│   ├── auth.js              — JWT, сессии, getCurrentUser
│   ├── db.js                — SQLite инициализация, CRUD
│   ├── email.js             — Resend email
│   ├── i18n.js              — Переводы RU/EN
│   ├── plans.js             — Тарифы (единый источник)
│   ├── prompts.js           — AI-промпты
│   ├── ratelimit.js         — Rate limiting
│   ├── renderer.js          — Рендеринг карточек (fabric)
│   ├── storage.js           — S3 upload/delete
│   └── templates.js         — Шаблоны карточек
start.js                     — Точка входа (Next.js + встроенный CRON)
```

---

## 🔌 API Endpoints

### Auth
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация (email + password) |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/logout` | Выход |
| GET | `/api/auth/me` | Текущий пользователь |
| POST | `/api/auth/onboarded` | Пометить онбординг пройденным |
| GET | `/api/auth/verify` | Верификация email |
| GET | `/api/auth/google` | Google OAuth start |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| GET | `/api/auth/yandex` | Яндекс OAuth start |
| GET | `/api/auth/yandex/callback` | Яндекс OAuth callback |

### Генерация
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/generate` | Генерация изображения |
| POST | `/api/generate-text` | AI-текст (название/описание) |
| POST | `/api/detect-product` | Определение товара на фото |
| GET | `/api/generations` | История генераций пользователя |
| GET | `/api/proxy-image` | Проксирование внешних картинок |

### Платежи
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/robokassa/checkout` | Редирект на Robokassa |
| POST | `/api/robokassa/result` | Callback от Robokassa (подтверждение) |
| GET | `/api/robokassa/recurring` | CRON: обработка рекуррентных платежей |
| POST | `/api/robokassa/cancel` | Отмена подписки |
| GET | `/api/robokassa/consent` | Согласие на рекуррент |

### Тикеты / Реферралы
| Метод | Путь | Описание |
|-------|------|----------|
| GET/POST | `/api/tickets` | Тикеты пользователя |
| GET | `/api/referral` | Реферальная система |

### Админ
| Метод | Путь | Описание |
|-------|------|----------|
| GET/PUT/DELETE | `/api/admin/users` | Управление пользователями |
| GET | `/api/admin/users/history` | История генераций пользователя |
| POST | `/api/admin/users/impersonate` | Войти как пользователь |
| GET/POST | `/api/admin/subscriptions` | Список подписок / отмена |
| POST | `/api/admin/trigger-recurring` | Ручной запуск ребила |
| GET/POST | `/api/admin/tickets` | Управление тикетами |
| GET/PUT | `/api/admin/prompts` | Управление промптами |
| GET | `/api/admin/quotas` | Лимиты и квоты |
| GET | `/api/admin/concepts` | Примеры концепций |
| GET/POST | `/api/admin/withdrawals` | Выводы средств |

---

## 💰 Тарифы

| ID | Название | Цена (₽) | Цена ($) | Генераций | Ребил |
|----|----------|-----------|----------|-----------|-------|
| test | Тест | 1 | — | 1 | 1 час (только админ) |
| lite | Лайт | 390 | $4.50 | 10 | 30 дней |
| standard | Стандарт | 990 | $11.50 | 30 | 30 дней |
| pro | Про | 2,490 | $29 | 80 | 30 дней |
| business | Бизнес | 4,990 | $58 | 200 | 30 дней |
| free | Free | 0 | 0 | 1 | — |

**Источник:** `src/lib/plans.js` (RU/Robokassa), `src/lib/i18n.js` (EN/USD)

---

## 🔄 Рекуррентные платежи

### Как работает:
1. Пользователь оплачивает → Robokassa с `Recurring: true`
2. Robokassa → POST `/api/robokassa/result` → создаёт подписку (next_charge_at = +30 дней)
3. **CRON** (встроен в `start.js`, каждый час) → GET `/api/robokassa/recurring` → находит подписки к списанию → отправляет recurring в Robokassa
4. Robokassa подтверждает → result callback → обновляет plan, сбрасывает generations_used, +30 дней

### ✅ CRON: работает автоматически
- Встроен в `start.js` — запускается каждый **1 час**
- Не нужен внешний cron-job.org
- Railway запускает `node start.js` → Next.js сервер + CRON scheduler
- Секрет: `CRON_SECRET` env var (default: `adgena_cron_2026`)

### Ручной запуск:
- Админка → вкладка **💰 Оплата** → кнопка **🔄 Запустить ребил сейчас**

### Мониторинг в админке:
- Вкладка **💰 Оплата** показывает все подписки: статус, план, сумму, следующее списание, `InvID`
- Для каждой подписки видны: общее количество платежей, количество ребилов, общая сумма, последнее списание
- Ниже отображается история последних списаний (`payments`): первая оплата / ребил, сумма, статус, `InvID`
- Активную подписку можно отменить из таблицы подписок

### Защита от дублей:
- Robokassa Result callback идемпотентный: повторный `InvId` игнорируется и получает `OK{InvId}`
- Перед отправкой ребила подписка переводится в `billing_status = processing`
- Пока подписка в `processing`, CRON и ручной запуск не отправляют повторный ребил
- Если `processing` завис более 3 часов, следующий запуск CRON вернёт подписку в `idle`
- Тестовый план `test` доступен только админам через админку, прямой checkout для обычных пользователей запрещён

---

## 🌍 Локализация

| Язык | Путь | Валюта | OAuth |
|------|------|--------|-------|
| RU | `/` | ₽ (Robokassa) | Google + Яндекс |
| EN | `/en` | $ (планируется LemonSqueezy) | Google only |

---

## 📊 Аналитика (Яндекс.Метрика)

- **ID:** 109048904
- **Цели:** `registration` (при успешной регистрации), `payment` (на /payment/success)
- **Скрипт:** в `src/app/layout.js` <head>

---

## 🔑 Переменные окружения

| Переменная | Описание | Обязательна |
|-----------|----------|-------------|
| `JWT_SECRET` | Секрет для JWT токенов | ✅ |
| `ADMIN_EMAILS` | Email админов (через запятую) | ✅ |
| `OPENAI_API_KEY` | Ключ OpenAI для gpt-image-1 (карточки и реклама) | ✅ |
| `APIYI_API_KEY` | Ключ APIYI для Gemini/текста | ✅ |
| `APIYI_BASE_URL` | Base URL APIYI | нет (default: api.apiyi.com) |
| `IMAGE_GEN_MODEL_OPENAI` | Модель OpenAI Images API | нет (default: gpt-image-1) |
| `OPENAI_IMAGE_TIMEOUT_MS` | Таймаут прямого OpenAI image-запроса | нет (default: 240000) |
| `S3_ACCESS_KEY_ID` | Yandex Object Storage key | ✅ |
| `S3_SECRET_ACCESS_KEY` | Yandex Object Storage secret | ✅ |
| `S3_BUCKET` | Название бакета | нет (default: adgena-files) |
| `S3_PUBLIC_URL` | Публичный URL бакета | ✅ |
| `ROBOKASSA_MERCHANT_LOGIN` | Логин Robokassa | ✅ |
| `ROBOKASSA_PASSWORD1` | Пароль 1 Robokassa | ✅ |
| `ROBOKASSA_PASSWORD2` | Пароль 2 Robokassa | ✅ |
| `ROBOKASSA_TEST_MODE` | `true` для тестовых платежей | нет |
| `CRON_SECRET` | Секрет для CRON эндпоинта | нет (default есть) |
| `GOOGLE_CLIENT_ID` | Google OAuth | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | ✅ |
| `YANDEX_CLIENT_ID` | Яндекс OAuth | ✅ |
| `YANDEX_CLIENT_SECRET` | Яндекс OAuth | ✅ |
| `RESEND_API_KEY` | Resend для email | нет |
| `NEXT_PUBLIC_APP_URL` | URL приложения | ✅ |

---

## ✅ Реализовано

- [x] AI-генерация (фото, карточки, реклама)
- [x] Регистрация / Вход (email, Google, Яндекс)
- [x] Тарифы и оплата через Robokassa
- [x] Рекуррентные платежи (автоматический CRON в start.js)
- [x] Отмена подписки
- [x] Админка (пользователи, тикеты, промпты, подписки, платежи/ребилы, квоты)
- [x] Импersonation (войти как пользователь)
- [x] История генераций (input + output)
- [x] Тестовая оплата 1₽ (только в админке)
- [x] Реферальная система (15% от оплат)
- [x] SEO: sitemap.xml, robots.txt, favicons (до 512x512)
- [x] Яндекс.Метрика (counter + goals: registration, payment)
- [x] Английская версия (/en) с USD ценами
- [x] Тикет-система
- [x] Yandex Object Storage (S3)
- [x] Rate limiting
- [x] 54-ФЗ чеки в платежах
- [x] Онбординг
- [x] Idempotency Robokassa callback
- [x] Защита ребилов от повторной отправки при задержке callback

## 🔲 Не реализовано / В планах

- [ ] LemonSqueezy для международных платежей ($)
- [ ] GeoIP маршрутизация платежей (RU → Robokassa, остальные → LS)
- [ ] Испанская версия (/es)
- [ ] Email-уведомления (за 3 дня до списания)
- [ ] Dockerfile (был, сейчас отсутствует — Railway через Nixpacks?)
- [ ] Тесты (unit, e2e)
- [ ] Brand Kit (для тарифа Business)
- [ ] API доступ (для тарифа Business)
- [ ] Multi-users (для тарифа Business)
- [ ] Version history генераций

---

## 🚀 Деплой

**Хостинг:** Railway
- Репозиторий: `github.com/alexpumpforyou-art/adgena`
- Билд: `npm run build` (Next.js standalone + копирование public/static)
- Старт: `node start.js` (Next.js сервер + встроенный CRON)
- Persistent volume: `/app/data` (SQLite БД)
- Auto-deploy: push в `main` → Railway авто-деплой

---

## 📝 Заметки

- SQLite `CREATE TABLE IF NOT EXISTS` не меняет DEFAULT у существующих таблиц → всегда явно указывать значения в INSERT
- Все API GET-роуты имеют `export const dynamic = 'force-dynamic'` для корректной работы с cookies
- Тестовый план (test) виден только в админке, не показывается на лендинге/чекауте
- Free план: 1 генерация (лимит)
