# Прокси для AdGena: улучшение доступа из РФ

## Идея

Railway остаётся как есть. Добавляем:
1. **Маленький VPS в Yandex Cloud** (РФ) — работает как прокси
2. **Yandex Object Storage** — заменяет Cloudflare R2 для картинок

```
РФ-юзер ──HTTPS──► Yandex VPS (РФ IP) ──HTTPS──► Railway
                       (Caddy proxy)
                                                     │
                                                     ▼
                                       Yandex Object Storage (РФ)
                                            (картинки)
```

**Плюсы:**
- Railway не трогаем — БД, код, env, всё работает как сейчас
- Прокси в РФ → быстрый доступ для российских юзеров
- Картинки с Yandex S3 → быстрая загрузка в РФ
- При падении прокси — можно временно переключить DNS обратно на Railway

---

## Часть 1: Yandex Object Storage (замена R2)

### Шаг 1.1: Создать бакет
1. https://console.yandex.cloud → создать платёжный аккаунт (можно физ.лицу)
2. Создать каталог (folder)
3. **Object Storage** → создать бакет:
   - Имя: `adgena-files`
   - Класс хранения: **Стандартное**
   - Доступ к объектам: **Публичный** (на чтение)
4. Перейти в бакет → **Настройки** → CORS:
   ```json
   [{
     "AllowedMethods": ["GET", "HEAD"],
     "AllowedOrigins": ["*"],
     "AllowedHeaders": ["*"]
   }]
   ```

### Шаг 1.2: Создать ключи доступа
1. **Сервисные аккаунты** → создать → имя `adgena-storage`
2. Роль: `storage.editor`
3. У созданного аккаунта → **Создать новый ключ** → **Создать статический ключ доступа**
4. Сохранить **Access Key ID** и **Secret Key** (Secret показывается ОДИН РАЗ)

### Шаг 1.3: Обновить env на Railway
В Railway → Variables, добавить:
```
STORAGE_PROVIDER=yandex
S3_ACCESS_KEY_ID=<Access Key ID>
S3_SECRET_ACCESS_KEY=<Secret Key>
S3_BUCKET=adgena-files
S3_PUBLIC_URL=https://storage.yandexcloud.net/adgena-files
```

**Старые `R2_*` переменные можно удалить**, либо оставить — они игнорируются при `STORAGE_PROVIDER=yandex`.

### Шаг 1.4: Перенос существующих картинок (опционально)
Если у вас уже есть картинки в R2, нужно их перенести. Самый простой способ — **rclone**:

```bash
# На локальной машине
rclone config  # настроить r2 и yandex как remotes
rclone copy r2:adgena-files yandex:adgena-files --progress
```

Или просто оставить старые URL рабочими (R2 пока не отключать) и новые писать в Yandex S3 — со временем старые картинки сами вытеснятся.

После деплоя Railway подхватит новые env и начнёт писать в Yandex S3.

---

## Часть 2: Прокси на Timeweb Cloud VPS

### Шаг 2.1: Создать VPS
1. https://timeweb.cloud → **Облачные серверы** → **Создать**
2. Конфигурация:
   - **Тариф**: **Apollo** (или любой минимальный): 1 CPU, 1 ГБ RAM, 15 ГБ NVMe
   - **ОС**: **Ubuntu 22.04**
   - **Регион**: **Москва** или **Санкт-Петербург**
   - **Сеть**: публичный IPv4 (включён по умолчанию)
   - **SSH-ключ**: добавить ваш публичный ключ (если нет — можно создать там же)
3. Стоимость: **~175₽/мес**

После создания получите IP, root-доступ — на email или в панели.

### Шаг 2.2: Настроить VPS
```bash
ssh root@<IP>

# Обновить пакеты
apt update && apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com | sh

# Создать пользователя deploy (необязательно, но безопаснее чем работать под root)
adduser deploy
usermod -aG docker,sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

# Открыть порты в фаерволе
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Шаг 2.3: Развернуть прокси
```bash
ssh deploy@<IP>

mkdir -p /opt/adgena-proxy
cd /opt/adgena-proxy
```

Скопировать **только папку `proxy/`** из репозитория на сервер (можно через `scp` или `git clone` всего репо и `cp -r adgena/proxy/* /opt/adgena-proxy/`).

```bash
# С локальной машины (PowerShell):
scp -r proxy/* deploy@<IP>:/opt/adgena-proxy/
```

На сервере:
```bash
cd /opt/adgena-proxy
cp env.example .env
nano .env
# Заполнить RAILWAY_UPSTREAM и RAILWAY_HOST значением вашего Railway-домена
# например: adgena-production-abcd.up.railway.app
```

### Шаг 2.4: Запустить
```bash
docker compose up -d
docker compose logs -f
```

Caddy сразу попытается получить SSL-сертификат для `adgena.pro` — это сработает только после переключения DNS (шаг 2.5).

### Шаг 2.5: Переключить DNS
В DNS-провайдере домена `adgena.pro`:
- A-запись `adgena.pro` → `<IP Yandex VPS>`
- A-запись `www.adgena.pro` → `<IP Yandex VPS>`

После распространения DNS (5-30 мин) Caddy автоматически получит SSL и начнёт работать.

Проверить: `https://adgena.pro` должен открываться так же, как Railway.

---

## Часть 3: Обновить redirect URI у внешних сервисов

После переключения DNS все внешние сервисы должны работать без изменений (URL `https://adgena.pro` тот же), но проверьте:
- **Робокасса** Result/Success/Fail URL — должны быть на `adgena.pro`, не на Railway-домене
- **Google OAuth** redirect URI — `https://adgena.pro/api/auth/google/callback`
- **Яндекс OAuth** redirect URI — `https://adgena.pro/api/auth/yandex/callback`
- **Resend** sender domain — DNS-записи Resend должны остаться (они на DNS, не на A-записи)
- **CRON** — `https://adgena.pro/api/robokassa/recurring`

---

## Часть 4: Мониторинг

### Логи прокси
```bash
ssh deploy@<IP>
cd /opt/adgena-proxy
docker compose logs -f --tail 100
```

### Логи доступа
```bash
docker exec adgena-proxy tail -f /data/access.log
```

### Перезапуск
```bash
docker compose restart
```

### Обновить конфиг
Если меняете `Caddyfile` или `.env`:
```bash
docker compose down
docker compose up -d
```

---

## Откат

Если что-то сломалось:
1. Поменять DNS обратно на Railway
2. Откатить env-переменные R2 на Railway (поменять `STORAGE_PROVIDER=r2` или удалить)

---

## Итоговая стоимость

| Сервис | Стоимость |
|---|---|
| Railway (приложение) | $5 ≈ 450₽ |
| Timeweb Cloud VPS (прокси) | ~175₽ |
| Yandex Object Storage | ~0₽ (10 ГБ free) |
| **Итого** | **~625₽/мес** |

vs текущие проблемы с РФ-доступом и медленные картинки — стоит того.
