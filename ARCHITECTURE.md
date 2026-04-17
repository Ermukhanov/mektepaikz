# 🏗️ MEKTEP AI - Архитектура системы

## 📊 Общая архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                        MEKTEP AI                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │   Web Frontend   │         │  Telegram Bot    │              │
│  │  (React/TanStack│         │  Integration     │              │
│  │   Start)        │         │                  │              │
│  └────────┬─────────┘         └────────┬─────────┘              │
│           │                           │                         │
│           └──────────┬────────────────┘                         │
│                      │                                          │
│        ┌─────────────▼────────────────┐                        │
│        │   Backend API Routes        │                        │
│        │  (TanStack Start + Hono)    │                        │
│        ├──────────────────────────────┤                        │
│        │ • /api/telegram/webhook     │                        │
│        │ • /api/tasks/*              │                        │
│        │ • /api/schedule/*           │                        │
│        │ • /api/incidents/*          │                        │
│        └──────────┬───────────────────┘                        │
│                   │                                            │
│  ┌────────────────┼───────────────────┐                       │
│  │                │                   │                       │
│  ▼                ▼                   ▼                       │
│ ┌──────┐   ┌─────────────┐   ┌──────────────┐               │
│ │ AI   │   │  Supabase   │   │   OpenAI     │               │
│ │Libs  │   │  \(PostgreSQL)  │  API         │               │
│ │ • NLP│   │             │   │              │               │
│ │ • RAG│   │ • users     │   │ • GPT-3.5    │               │
│ │ • Voice  │ • schedule  │   │ • GPT-4      │               │
│ └──────┘   │ • tasks     │   │              │               │
│            │ • incidents │   └──────────────┘               │
│            │ • attendance│                                  │
│            └─────────────┘                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Основные компоненты

### 1. **Frontend**

#### Страницы (Route Tree)
```
/
├── /language (языковой выбор)
├── /auth (вход/регистрация)
├── /onboarding (онбординг)
└── /_authenticated (защищенные маршруты)
    ├── / (dashboard)
    ├── /schedule (расписание)
    ├── /tasks (задачи)
    ├── /incidents (инциденты)
    ├── /employees (сотрудники)
    └── /knowledge (приказы & RAG)
```

#### Ключевые компоненты
- **VoiceFAB.tsx**: Плавающая кнопка микрофона для голосовых команд
- **AppShell.tsx**: Главный layout с навигацией
- **UI Components**: Shadcn/ui collection (Dialog, Card, Button, и т.д.)

### 2. **Backend (API Routes)**

```typescript
// src/routes/api/

// Telegram webhook
POST /api/telegram/webhook {
  message: {
    from: { ... },
    text: "1А - 25 детей, 2 болеют"
  }
}
// Response: { ok: true, parsed: {...} }
```

### 3. **Базы данных (Supabase/PostgreSQL)**

#### Таблицы
```
schools (школы)
├─ id: UUID
├─ school_id: VARCHAR (уникальный ID школы)
├─ name, city, address, phone, email
└─ students_count, teachers_count

users (пользователи)
├─ id: UUID
├─ school_id: FK → schools
├─ email, full_name, role (director|teacher|admin)
├─ language, qualifications[]
└─ position, avatar_url, phone

classes (классы)
├─ id: UUID
├─ school_id: FK → schools
├─ name (1А, 2Б и т.д.), grade_level, student_count
└─ room

attendance (посещаемость)
├─ id: UUID
├─ class_id: FK → classes
├─ date, present_count, sick_count, absent_count
└─ reported_by: FK → users

schedule (расписание)
├─ id: UUID
├─ class_id, teacher_id: FK
├─ lesson_number, day_of_week, subject
├─ room, duration, date
└─ is_substitution, substituted_teacher_id

incidents (инциденты)
├─ id: UUID
├─ title, description, location
├─ severity (low|medium|high|critical)
├─ status (open|in_progress|resolved|closed)
├─ reported_by, assigned_to: FK → users
└─ created_at, resolved_at

tasks (задачи)
├─ id: UUID
├─ title, description
├─ assigned_to, created_by: FK → users
├─ status (pending|in_progress|completed|cancelled)
├─ priority (low|medium|high|urgent)
├─ due_date, completed_at
└─ voice_recording_url, tags[]

chat_messages (сообщения)
├─ id: UUID
├─ school_id, chat_id, sender_id: FK
├─ message, message_type (text|voice|image)
├─ voice_url
└─ parsed_data: JSONB

knowledge_base (приказы)
├─ id: UUID
├─ title, document_type (приказ|инструкция)
├─ content, embedding: VECTOR(1536)
└─ created_at, updated_at
```

### 4. **AI Services (OpenAI Integration)**

#### Функции в `src/lib/ai.ts`

```typescript
// Parsing chat messages
parseAttendanceFromChat(messages): Attendance[]
// Input: ["1А - 25 детей, 2 болеют"]
// Output: [{ classId: "1A", present: 25, sick: 2 }]

// Incident detection
extractIncidentsFromChat(message): Incident | null
// Input: "В кабинете 12 сломалась парта"
// Output: { title: "Поломка парты", severity: "high", location: "Кабинет 12" }

// Voice commands → tasks
voiceToTasks(voiceText, employees): Task[]
// Input: "Айгерим, подготовь зал. Назкен, закажи воду"
// Output: [{ title: "Подготовить зал", assignedTo: "aigerim" }, ...]

// Simplify regulations
simplifyLegalText(complexText, language): string[]
// Input: "Согласно приказу МЗ РК №76 ..."
// Output: ["✓ Пункт 1", "✓ Пункт 2", ...]

// Find substitute teacher
findBestSubstitute(teacher, subject, available): Teacher | null
// Input: ("Аскар Math", "3-5 свободные учителя")
// Output: { id: "x", name: "Жанар" }

// Check schedule compliance
checkScheduleCompliance(schedule, regulations): { compliant, issues }
```

### 5. **Telegram Bot Integration**

```
Telegram User
    ↓
User sends message
    ↓
Telegram API
    ↓
Our Webhook (/api/telegram/webhook)
    ↓
AI Processing
    ├─ parseAttendance()
    ├─ extractIncidents()
    └─ Store in Supabase
    ↓
Send notification back
    ↓
User receives confirmation
```

## 🔄 Процесс обработки сообщения

```
1. Учитель пишет в Telegram чат
   "1А - 25 детей, 2 болеют"
   
2. Telegram отправляет на наш webhook
   POST /api/telegram/webhook
   
3. Backend обрабатывает:
   a. Extract классный ID и числа
   b. Parse через OpenAI NLP
   c. Create attendance record в БД
   d. Проверить на инциденты
   
4. Отправить подтверждение учителю
   "✅ Спасибо! Записано..."
   
5. Уведомить директора при необходимости
   "⚠️ Много болящих в 1А"
```

## 🎤 Voice-to-Task Flow

```
1. Директор нажимает микрофон (VoiceFAB)
   
2. Web Speech API записывает
   "Айгерим, подготовь актовый зал"
   
3. Frontend отправляет текст в AI
   
4. OpenAI парсит и создает задачи:
   {
     title: "Подготовить актовый зал",
     assignedTo: "aigerim",
     priority: "high"
   }
   
5. Задача сохраняется в БД
   
6. Отправляется уведомление Айгерим
   "Новая задача для вас: Подготовить актовый зал"
   
7. Задача появляется на дашборде директора
```

## 🔐 Безопасность

```
Layer 1: Аутентификация
├─ School ID + Email/Password
├─ LocalStorage session (TODO: JWT)
└─ Supabase Auth (TODO)

Layer 2: API безопасность
├─ Environment variables for secrets
├─ CORS headers
├─ Rate limiting (TODO: Cloudflare)
└─ Telegram webhook verification (TODO)

Layer 3: Database
├─ Row Level Security (RLS)
├─ SQL injection prevention (prepared statements)
├─ Encrypted passwords
└─ Column-level access control

Layer 4: Infrastructure
├─ HTTPS only
├─ API keys in secrets (not in code)
├─ Database backups (Supabase handles)
└─ CloudFlare DDoS protection
```

## 📈 Масштабируемость

### Текущие ограничения
- Синхронные API вызовы к OpenAI
- Нет кэширования результатов
- Нет очередей задач

### Для масштабирования
```
1. Добавить Redis для кэша
2. Реализовать очередь (BullMQ/Celery)
3. Использовать CDN (Cloudflare)
4. Горизонтальное масштабирование API
5. Database replicas для чтения (Supabase)
6. WebSocket для real-time (Supabase Realtime)
```

## 🚀 Deployment

```
Local Dev
├─ npm run dev
└─ http://localhost:5173

Production (Cloudflare Pages)
├─ npm run build
├─ wrangler deploy
└─ https://mektepaikz.pages.dev
```

## 📦 Зависимости

**Core:**
- React 18
- TanStack Router
- TanStack Start

**UI:**
- Tailwind CSS
- Radix UI
- Framer Motion
- Lucide Icons

**Backend:**
- Supabase
- OpenAI SDK
- Telegram Bot API

**i18n:**
- i18next
- react-i18next

**Utilities:**
- Zod (validation)
- date-fns (dates)
- clsx (classnames)

## 🎯 Следующие шаги

1. **Real-time обновления**
   - Supabase Realtime для live notifications
   - WebSocket для чата

2. **WhatsApp интеграция**
   - Twilio или official WhatsApp API
   - Парсинг сообщений аналогично Telegram

3. **Продвинутые AI функции**
   - Sentiment analysis
   - Predictive analytics
   - Natural language understanding

4. **Mobile приложение**
   - React Native или Flutter
   - Offline support
   - Push notifications

5. **Analytics & Reporting**
   - Dashboard для администраторов
   - Экспорт данных (CSV/PDF)
   - Графики и диаграммы история

---

**Архитектура обновлена**: 18 апреля 2024  
**Версия**: MVP 1.0
