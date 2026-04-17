# AIS Hack 3.0 - MEKTEP AI 🚀

Цифровой AI-завуч для управления школой. Автоматизация рутины, анализ чатов, умное расписание и голосовые команды.

## 📋 Функционал

- 🎤 **Voice-to-Task**: Голосовые команды директора преобразуются в структурированные задачи
- 📊 **NLP Чат-парсер**: Анализ сообщений из Telegram/WhatsApp для извлечения посещаемости и инцидентов
- 📅 **Smart Schedule**: Автоматическое находение замен при болезни учителя
- 📋 **Task Management**: Распределение задач с приоритизацией
- 🚨 **Incident Tracking**: Автоматическое обнаружение и триаж инцидентов
- 📚 **RAG Knowledge Base**: Упрощение сложных приказов до чек-листов
- 🌍 **Мультиязычность**: Русский, казахский, английский

## 🛠️ Технический стек

- **Frontend**: TanStack Start (React) + TypeScript + Tailwind CSS
- **Backend**: TanStack Start API Routes (Node.js)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-3.5/4
- **Bots**: Telegram Bot API
- **i18n**: i18next + react-i18next

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- npm или bun
- Supabase аккаунт
- OpenAI API ключ
- Telegram Bot Token

### 1. Установка

```bash
# Клонировать репозиторий
git clone <repo-url>
cd mektepaikz

# Установить зависимости
npm install
# или
bun install
```

### 2. Конфигурация окружения

Создайте файл `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
VITE_OPENAI_API_KEY=sk-your-key

# Telegram
VITE_TELEGRAM_BOT_TOKEN=your-bot-token
VITE_TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# App
VITE_APP_URL=http://localhost:5173
```

### 3. Настройка Supabase

1. Создайте новый проект на Supabase
2. Запустите SQL миграции из `supabase/migrations/001_init_schema.sql`:

```bash
# Через Supabase Dashboard (SQL Editor) или:
psql $SUPABASE_CONNECTION_STRING < supabase/migrations/001_init_schema.sql
```

3. Включите Row Level Security (RLS) по необходимости

### 4. Таблицы в Supabase

- `schools` - Школы (school_id, name, city, address, т.д.)
- `users` - Пользователи (директоры, учителя, администраторы)
- `classes` - Классы
- `attendance` - История посещаемости
- `incidents` - Инциденты (поломки, происшествия)
- `schedule` - Расписание уроков
- `tasks` - Задачи и поручения
- `chat_messages` - Сообщения из Telegram
- `knowledge_base` - База приказов и регуляций

### 5. Запуск разработки

```bash
npm run dev
# или
bun dev
```

Приложение откроется на `http://localhost:5173`

## 📱 Использование

### Страница выбора языка
- Выберите язык (Русский/Казахский/Английский)
- Автоматически сохраняется в браузер

### Вход / Регистрация
- Вход: email + пароль
- Роли: Директор, Учитель, Администратор
- Первый вход автоматически настраивает онбординг

### Основной интерфейс

#### 1. Dashboard
- Общая статистика
- Recent activity
- Quick actions

#### 2. Голосовые команды 🎤
- Кнопка Mic в левом нижнем углу
- Скажите задачу: "Айгерим, подготовь актовый зал"
- AI найдёт сотрудника и распредели задачу

#### 3. Расписание
- Просмотр расписания по дням
- Кнопка "Болезнь учителя"
- Автоматический поиск замены
- История замен

#### 4. Задачи
- Создание заданий
- Приоритизация
- Отслеживание статуса
- История выполнения

#### 5. Инциденты
- Автоматическое обнаружение из чатов
- Классификация по тяжести
- Распределение ответственности
- Ведение журнала

#### 6. Сотрудники
- База всех учителей и администраторов
- Квалификации и предметы
- История замен

#### 7. Приказы (Knowledge Base)
- Загрузка приказов МЗ РК №76, №110, МОН РК №130
- AI упрощает в чек-листы
- Автоматическая проверка соответствия

## 🤖 Telegram Bot

### Чаты учителей → AI парсинг

**Учитель пишет в чат:**
```
1А - 25 детей, 2 болеют, 1 отсутствует
```

**AI парсит и создаёт:**
- Запись посещаемости в БД
- Отправляет подтверждение

**Бот автоматически:**
- Собирает все сообщения
- В 09:00 отправляет директору готовый отчёт:
  ```
  📊 ИТОГОВАЯ ПОСЕЩАЕМОСТЬ
  Всего: 180 учеников
  Присутствуют: 175
  Болеют: 3
  Отсутствуют: 2
  ```

### Инциденты

**Учитель сообщает:**
```
В кабинете 12 сломалась парта
```

**AI обнаруживает инцидент:**
- Название: "Поломка мебели"
- Место: "Кабинет 12"
- Тяжесть: Medium
- Уведомляет завхоза

## 📊 API Endpoints

### Telegram Webhook
```
POST /api/telegram/webhook
```
Получает сообщения от Telegram бота, парсит и сохраняет данные.

### Создание задачи (Voice)
```
POST /api/tasks
{
  "title": "string",
  "description": "string",
  "assignedTo": "user_id",
  "priority": "low|medium|high|urgent",
  "dueDate": "ISO8601"
}
```

## 🎯 Mock данные для тестирования

В `src/lib/mektep-data.ts` есть:
- 4 примера классов с реальной посещаемостью
- 4 сотрудников с разными ролями
- 3 примера сообщений из чата
- 3 примера задач

Используются для симуляции работы системы.

## 📝 Структура проекта

```
src/
├── routes/
│   ├── language.tsx           # Выбор языка
│   ├── auth.tsx               # Вход/Регистрация
│   ├── api/
│   │   └── telegram.webhook.ts # Telegram webhook
│   └── _authenticated/
│       ├── index.tsx           # Dashboard
│       ├── schedule.tsx        # Расписание
│       ├── tasks.tsx           # Задачи
│       ├── incidents.tsx       # Инциденты
│       ├── employees.tsx       # Сотрудники
│       └── knowledge.tsx       # Приказы
├── lib/
│   ├── ai.ts                  # AI функции (OpenAI)
│   ├── auth.tsx               # Аутентификация
│   ├── i18n.ts                # Переводы (RU/KZ/EN)
│   ├── supabase.ts            # Supabase клиент
│   └── mektep-data.ts         # Mock данные
├── components/
│   ├── VoiceFAB.tsx           # Голосовой FAB кнопка
│   ├── AppShell.tsx           # Основной layout
│   └── ui/                    # Shadcn UI компоненты
└── types/
    └── index.ts               # TypeScript типы
```

## 🔐 Безопасность

- Row Level Security (RLS) на всех таблицах
- API ключи хранятся в `.env.local`
- Telegram webhook верифицирует источник (TODO)
- Суперюзер управление через Supabase

## 🚨 Известные ограничения (MVP)

- Голос только через Web Speech API (не все браузеры)
- OpenAI нужен действительный API ключ (платно)
- Нет real-time уведомлений (TODO: Socket.io/Supabase realtime)
- Нет аудиозаписей (только текст в MVP)

## 🔄 Дальнейшее развитие

### Phase 2
- [ ] Real-time уведомления через Supabase Realtime
- [ ] Интеграция WhatsApp API
- [ ] Audio recording и транскрипция
- [ ] Email уведомления

### Phase 3
- [ ] Веб-интерфейс для учителей
- [ ] Админ панель для системного администратора
- [ ] Analytics и reporting
- [ ] Интеграция с Google Classroom

### Phase 4
- [ ] Mobile app (React Native)
- [ ] Offline синхронизация
- [ ] Расширенная RAG с полнотекстовым поиском
- [ ] Интеграция с 1С ERP

## 📞 Контакты & Поддержка

- **Команда**: AIS Hack 3.0 - EdTech & AI Track
- **Школа**: Ақбөбек мектебі
- **Email**: support@mektepai.kz

## 📄 Лицензия

MIT License - используйте свободно для образовательных целей

---

**Статус**: MVP в разработке для AIS Hack 3.0  
**Обновлено**: 18 апреля 2024
