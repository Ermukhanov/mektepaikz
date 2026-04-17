# API Examples & Testing

Примеры использования API и тестирования функционала MEKTEP AI.

## 🔌 REST API Examples

### 1. Telegram Webhook

```bash
# Получить информацию о webhook
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

**Пример входящего сообщения (Telegram отправляет POST на ваш webhook):**

```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "first_name": "Жанар",
      "username": "janara_teacher"
    },
    "chat": {
      "id": -987654321,
      "type": "group"
    },
    "date": 1713445890,
    "text": "1А - 24 балалар, 1 ауру"
  }
}
```

**Ответ сервера:**

```json
{
  "ok": true,
  "message": "Спасибо! Я получил данные посещаемости..."
}
```

### 2. Создание задачи (для Voice-to-Task)

```bash
curl -X POST http://localhost:5173/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Подготовить актовый зал",
    "description": "К хакатону на следующей неделе",
    "assignedTo": "aigerim",
    "priority": "high",
    "dueDate": "2024-04-25T18:00:00Z"
  }'
```

## 🎙️ Voice Testing

### Web Speech API (в браузере)

```javascript
// Откройте DevTools console и выполните:

const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
recognition.lang = 'ru-RU';

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log('Распознано:', transcript);
};

recognition.start();
// Скажите: "Айгерим, подготовь актовый зал"
```

## 🤖 Telegram Bot Testing

### Локальное тестирование с Mock Bot

```javascript
// src/lib/telegram-mock.ts
export class MockTelegramBot {
  private messages: string[] = [];

  async simulateMessage(text: string, sender: string = 'test_user') {
    const message = {
      update_id: Date.now(),
      message: {
        message_id: this.messages.length + 1,
        from: {
          id: 123456,
          first_name: sender,
        },
        chat: {
          id: -987654321,
          type: 'group',
        },
        date: Math.floor(Date.now() / 1000),
        text: text,
      },
    };

    this.messages.push(text);
    return message;
  }

  getMessages() {
    return this.messages;
  }
}
```

### Тестовые сценарии

#### Сценарий 1: Посещаемость

```
Учитель: "1А - 25 детей, 2 болеют"
AI analyzes → { classId: '1A', present: 25, sick: 2 }
Stores in DB → attendance table
Bot replies: "✅ Спасибо! Записано: 1А - 25 присутствуют, 2 болеют"
```

#### Сценарий 2: Инцидент

```
Учитель: "В кабинете 12 сломалась парта!"
AI detects → Incident { title: "Поломка парты", severity: "high", location: "Кабинет 12" }
Creates task → For завхоз (Daniyar)
Bot replies: "🚨 ИНЦИДЕНТ: Поломка парты в кабинете 12"
```

#### Сценарий 3: Замена учителя

```
Директор: "Аскар заболел, его сегодня не будет"
AI processes → Finds available substitute with Math qualification
Updates schedule → Jones replaces Askar
Sends notification to Jones: "У вас замена в 3В классе на 2-м уроке"
```

#### Сценарий 4: Голосовая команда

```
Директор: "Айгерим, подготовь актовый зал. Назкен, закажи воду и бейджи"
AI parses → [
  { title: "Подготовить актовый зал", assignedTo: "aigerim", priority: "high" },
  { title: "Заказать воду и бейджи", assignedTo: "nazken", priority: "high" }
]
Tasks created in DB
Notifications sent to Aigerim & Nazken
```

## 🧪 Unit Tests

```javascript
// tests/ai.test.ts
import { describe, it, expect } from 'vitest';
import {
  parseAttendanceFromChat,
  extractIncidentsFromChat,
  voiceToTasks,
} from '@/lib/ai';

describe('AI Functions', () => {
  describe('parseAttendanceFromChat', () => {
    it('should parse Russian attendance message', async () => {
      const messages = ['1А - 25 детей, 2 болеют'];
      const result = await parseAttendanceFromChat(messages);
      
      expect(result).toHaveLength(1);
      expect(result[0].classId).toBe('1A');
      expect(result[0].presentCount).toBe(25);
      expect(result[0].sickCount).toBe(2);
    });

    it('should parse Kazakh attendance message', async () => {
      const messages = ['1А - 24 балалар, 1 ауру'];
      const result = await parseAttendanceFromChat(messages);
      
      expect(result).toHaveLength(1);
      expect(result[0].classId).toBe('1A');
      expect(result[0].presentCount).toBe(24);
    });
  });

  describe('extractIncidentsFromChat', () => {
    it('should detect incident from message', async () => {
      const message = 'В кабинете 12 сломалась парта';
      const incident = await extractIncidentsFromChat(message);
      
      expect(incident).not.toBeNull();
      expect(incident?.title).toContain('Поломка');
      expect(incident?.severity).toBe('high');
    });
  });

  describe('voiceToTasks', () => {
    it('should convert voice command to tasks', async () => {
      const employees = [
        { id: '1', name: 'Айгерим' },
        { id: '2', name: 'Назкен' },
      ];
      
      const tasks = await voiceToTasks(
        'Айгерим, подготовь зал. Назкен, закажи воду',
        employees
      );
      
      expect(tasks).toHaveLength(2);
      expect(tasks[0].assignedTo).toBe('Айгерим');
      expect(tasks[1].assignedTo).toBe('Назкен');
    });
  });
});
```

## 📊 Performance Testing

```bash
# Load testing с Apache Bench
ab -n 1000 -c 10 http://localhost:5173/

# Или с wrk
wrk -t12 -c400 -d30s http://localhost:5173/
```

## 🔍 Debugging

### Enable verbose logging

```javascript
// src/lib/ai.ts
const DEBUG = true;

export async function parseAttendanceFromChat(messages: string[]) {
  if (DEBUG) console.log('[AI] Parsing messages:', messages);
  
  const response = await openai.chat.completions.create({
    // ...
  });
  
  if (DEBUG) console.log('[AI] Response:', response);
  
  return parsed;
}
```

### Chrome DevTools

```javascript
// Console tab
localStorage.getItem('mektep.lang')
localStorage.getItem('mektep.session')

// Network tab → filter by /api/
// Applications tab → IndexedDB (если используется)
```

### Supabase Real-time Logs

```sql
-- View real-time query logs
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;
```

## 📝 Manual Testing Checklist

### Authentication
- [ ] Sign up with school ID
- [ ] Login with email/password
- [ ] Language selection works
- [ ] Onboarding shows
- [ ] Logout works
- [ ] Session persists after reload

### Dashboard
- [ ] Shows correct statistics
- [ ] All modules accessible
- [ ] Recent activity displays
- [ ] Quick actions work

### Voice-to-Task
- [ ] Microphone button appears
- [ ] Speech recognition works
- [ ] Tasks are assigned correctly
- [ ] Notifications sent

### Schedule
- [ ] Week view loads
- [ ] "Болезнь учителя" button works
- [ ] Substitute is found
- [ ] Schedule updates
- [ ] Notification sent to substitute

### Incidents
- [ ] New incidents appear
- [ ] Status can be changed
- [ ] Severity color indicators work
- [ ] Assigned to field works

### Tasks
- [ ] Can create new tasks
- [ ] Status drag-and-drop works
- [ ] Due dates visible
- [ ] Priority indicators show

## 🐛 Common Issues & Solutions

### Issue: Voice recognition not working
**Solution**: 
```javascript
// Check browser support
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
if (!SpeechRecognition) {
  alert('Your browser does not support Speech Recognition');
}
```

### Issue: OpenAI API timeout
**Solution**: Add retry logic
```typescript
const MAX_RETRIES = 3;
for (let i = 0; i < MAX_RETRIES; i++) {
  try {
    return await openai.chat.completions.create({...});
  } catch (error) {
    if (i === MAX_RETRIES - 1) throw error;
    await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
  }
}
```

### Issue: Telegram webhook not receiving messages
**Solution**:
```bash
# Check webhook status
curl https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo | jq

# The response should show your URL and "last_error_date": null
```

---

**Testing Documentation**: April 18, 2024
