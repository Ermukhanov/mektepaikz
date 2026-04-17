# 🚀 Развертывание MEKTEP AI

Инструкции по развертыванию на различных платформах.

## Быстрый старт (Локально)

```bash
# 1. Установьте зависимости
npm install

# 2. Инициализируйте разработку
npm run setup:dev

# 3. Обновите .env.local с вашими ключами

# 4. Инициализируйте Supabase
npm run setup:supabase

# 5. Настройте Telegram бота
npm run setup:telegram

# 6. Запустите dev сервер
npm run dev
```

## 🌐 Развертывание на Cloudflare Pages

Проект уже настроен для Cloudflare Pages (Wrangler + Vite).

### 1. Создайте Cloudflare аккаунт

- Перейдите на https://dash.cloudflare.com
- Зарегистрируйтесь или войдите

### 2. Установите Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

### 3. Создайте Cloudflare проект

```bash
# Инициализируйте новый проект
wrangler init mektepaikz --type "hello-world"

# Или используйте существующий wrangler.jsonc
```

### 4. Установите Environment Variables

В Cloudflare Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-your-key
VITE_TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_WEBHOOK_URL=https://mektepaikz.pages.dev/api/telegram/webhook
```

### 5. Разверните

```bash
# Разработка
npm run dev

# Production
npm run build
wrangler deploy
```

Приложение будет доступно на `https://mektepaikz.pages.dev`

## 🐳 Docker (для контейнеризации)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Сборка
RUN npm run build

# Запуск через Node.js сервер
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Запуск:
```bash
docker build -t mektepaikz .
docker run -e VITE_SUPABASE_URL=... -p 3000:3000 mektepaikz
```

## ☁️ Развертывание на Vercel

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Разверните
vercel deploy

# 3. Установите environment variables в Vercel Dashboard
```

## 🔑 Переменные окружения для Production

Все эти переменные должны быть установлены на вашей платформе:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
VITE_OPENAI_API_KEY=sk-...

# Telegram
VITE_TELEGRAM_BOT_TOKEN=123:ABC...
VITE_TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# App
VITE_APP_URL=https://your-domain.com
```

## 🔐 Безопасность при развертывании

1. **Никогда не коммитьте .env.local в Git**
   ```bash
   # Уже добавлено в .gitignore
   echo ".env.local" >> .gitignore
   ```

2. **Используйте Secrets в CI/CD**
   - GitHub Secrets для GitHub Actions
   - Cloudflare Secrets в Dashboard
   - Vercel Environment Variables

3. **Ограничьте CORS**
   ```typescript
   // В API routes
   res.setHeader('Access-Control-Allow-Origin', 'https://your-domain.com');
   ```

4. **Включите Row Level Security в Supabase**
   - Все таблицы имеют RLS policies
   - Проверьте в Supabase Dashboard → Authentication

## 📊 Production Monitoring

### Supabase
- Logs: Dashboard → Logs
- Usage: Dashboard → Billing → Usage
- Performance: Database → Query Performance

### Cloudflare
- Analytics: Dashboard → Analytics & Logs
- Rate limiting: Security → Rate Limiting

### OpenAI
- Usage: https://platform.openai.com/usage
- Costs: https://platform.openai.com/billing/overview

### Telegram
- Bot statistics доступны через `getMe` и `getWebhookInfo`

## 🚨 Troubleshooting

### Webhook не срабатывает
```bash
# Проверьте статус webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

### CORS ошибки
- Проверьте `Access-Control-Allow-Origin` в API response

### OpenAIRate Limit
- Реализуйте exponential backoff
- Кэшируйте результаты

### Supabase подключение
- Проверьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`
- Убедитесь, что Row Level Security политики корректны

## ✅ Production Checklist

- [ ] Environment variables установлены
- [ ] Database migrations выполнены
- [ ] Telegram webhook настроен
- [ ] OpenAI API ключ работает
- [ ] CORS правильно настроен
- [ ] RLS policies активированы
- [ ] Backups настроены
- [ ] Мониторинг активирован
- [ ] SSL сертификат действителен
- [ ] Domain указывает на correct IP

## 📈 Масштабирование

Для большого количества пользователей:

1. **Database**
   - Используйте connection pooling (PgBouncer)
   - Добавьте индексы на часто запрашиваемые поля
   - Включите Supabase replication для backup

2. **API**
   - Кэшируйте ответы (Redis)
   - Используйте CDN (Cloudflare)
   - Impl rate limiting

3. **AI**
   - Используйте очередь задач (BullMQ, Celery)
   - Батчеявайте запросы к OpenAI API
   - Кэшируйте результаты анализа

4. **Бект**
   - Горизонтальное масштабирование через load balancer
   - Используйте WebSocket для real-time обновлений
   - Очередь для асинхронных задач

---

**Документация обновлена**: 18 апреля 2024  
**Поддержка**: Cloudflare Pages, Vercel, Docker, Kubernetes-ready
