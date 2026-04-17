import { json } from '@tanstack/react-start';
import { createAPIFileRoute } from '@tanstack/react-start/api';
import { parseAttendanceFromChat, extractIncidentsFromChat } from '@/lib/ai';

// Types for Telegram Bot API
interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text?: string;
  voice?: {
    file_id: string;
    file_unique_id: string;
    duration: number;
    mime_type: string;
    file_size: number;
  };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

/**
 * Telegram webhook endpoint to receive messages
 * POST /api/telegram/webhook
 */
export const POST = async (req: Request): Promise<Response> => {
  try {
    const body: TelegramUpdate = await req.json();

    if (!body.message) {
      return json({ ok: true });
    }

    const message = body.message;
    const text = message.text || '';
    const userName = message.from.first_name;
    const chatId = message.chat.id;

    console.log(`[Telegram] Message from ${userName}: ${text}`);

    // Parse attendance data
    if (text.includes('детей') || text.includes('ауру') || text.includes('балалар')) {
      const attendanceData = await parseAttendanceFromChat([text]);
      console.log('Parsed attendance:', attendanceData);

      if (attendanceData.length > 0) {
        // Store in database
        // TODO: Send to Supabase
        await notifyAttendanceParsed(chatId, attendanceData[0]);
      }
    }

    // Extract incidents
    if (text.includes('сломалась') || text.includes('проблема') || text.includes('сломан')) {
      const incident = await extractIncidentsFromChat(text);
      if (incident) {
        console.log('Detected incident:', incident);
        // TODO: Store and notify director
        await notifyIncident(chatId, incident);
      }
    }

    return json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return json({ ok: false, error: String(error) }, { status: 500 });
  }
};

/**
 * Send notification back to Telegram chat
 */
async function notifyAttendanceParsed(chatId: number, attendance: any) {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  
  const message = `✅ Спасибо! Я получил данные посещаемости:\n\n` +
    `📍 Класс: ${attendance.classId || attendance.class_id}\n` +
    `👥 Присутствуют: ${attendance.presentCount || attendance.present_count}\n` +
    `🤒 Болеют: ${attendance.sickCount || attendance.sick_count}\n` +
    `❌ Отсутствуют: ${attendance.absentCount || attendance.absent_count}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

/**
 * Notify director about incident via Telegram
 */
async function notifyIncident(chatId: number, incident: any) {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

  const severityEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    critical: '🟣',
  };

  const message = `${severityEmoji[incident.severity] || '⚠️'} <b>ОҚИҒА:</b>\n\n` +
    `<b>${incident.title}</b>\n` +
    `${incident.description}\n\n` +
    `📍 Орны: ${incident.location || 'Анықталмаған'}\n` +
    `🔴 Ауырлығы: ${incident.severity}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      console.error('Failed to notify incident:', await response.text());
    }
  } catch (error) {
    console.error('Error notifying incident:', error);
  }
}

export const Route = createAPIFileRoute('/api/telegram/webhook')(
  {
    POST,
  },
);
