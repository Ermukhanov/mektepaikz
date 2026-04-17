import OpenAI from 'openai';
import { AIAnalysisResult, Incident, Task, Attendance } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only for MVP - use backend in production
});

/**
 * Parse chat messages to extract attendance data
 * Example: "1А - 25 детей, 2 болеют" -> { classId: '1A', present: 25, sick: 2 }
 */
export async function parseAttendanceFromChat(
  messages: string[]
): Promise<Attendance[]> {
  const prompt = `Parse the following teacher messages to extract attendance data. 
Each message should contain: class name and number of present/sick/absent students.
Return as JSON array with keys: classId, presentCount, sickCount, absentCount.

Messages:
${messages.join('\n')}

Return valid JSON array only, no markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    // Clean up markdown if present
    const jsonStr = content.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse attendance:', error);
    return [];
  }
}

/**
 * Extract incidents from chat messages
 * Example: "В кабинете 12 сломалась парта" -> Incident
 */
export async function extractIncidentsFromChat(message: string): Promise<Incident | null> {
  const prompt = `Analyze this message for incident reports. If it describes a problem/incident, extract:
- title (brief)
- description
- location
- severity (low/medium/high/critical)

Message: "${message}"

Return JSON object or null if no incident detected.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content || content.toLowerCase() === 'null') return null;
    
    const jsonStr = content.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.title) return null;

    return {
      id: crypto.randomUUID(),
      schoolId: '',
      title: parsed.title,
      description: parsed.description || message,
      location: parsed.location,
      severity: parsed.severity || 'medium',
      status: 'open',
      reportedBy: '',
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to extract incident:', error);
    return null;
  }
}

/**
 * Convert voice/text command to structured tasks
 * Example: "Айгерим, подготовь актовый зал. Назкен, закажи воду и бейджи"
 * -> [Task, Task]
 */
export async function voiceToTasks(
  voiceText: string,
  employees: Array<{ id: string; name: string }>
): Promise<Task[]> {
  const employeeList = employees.map((e) => e.name).join(', ');

  const prompt = `Parse this voice command to extract individual tasks and assign them to employees.

Command: "${voiceText}"

Available employees: ${employeeList}

For each task, return JSON array with:
- title (task name)
- description (details)
- assignedTo (employee name)
- priority (low/medium/high/urgent)
- dueDate (estimate)

Return valid JSON array only, no markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    const jsonStr = content.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    return Array.isArray(parsed)
      ? parsed.map((task: any) => ({
          id: crypto.randomUUID(),
          schoolId: '',
          title: task.title || '',
          description: task.description || '',
          assignedTo: task.assignedTo || '',
          createdBy: '',
          status: 'pending' as const,
          priority: task.priority || 'medium',
          dueDate: task.dueDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }))
      : [];
  } catch (error) {
    console.error('Failed to parse voice command:', error);
    return [];
  }
}

/**
 * Simplify complex legal orders to bullet points
 * For RAG compliance checking
 */
export async function simplifyLegalText(complexText: string, language: 'ru' | 'kz' | 'en'): Promise<string[]> {
  const langMap = {
    ru: 'Russian',
    kz: 'Kazakh',
    en: 'English',
  };

  const prompt = `Simplify this complex legal/administrative text into 5-7 clear bullet points for educators in ${langMap[language]}.

Original text:
"${complexText}"

Return as JSON array of strings (bullet points), no markdown.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) return [];
    
    const jsonStr = content.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to simplify legal text:', error);
    return [];
  }
}

/**
 * Find best substitute for a teacher
 * Checks availability and qualifications
 */
export async function findBestSubstitute(
  teacherName: string,
  subject: string,
  availableTeachers: Array<{
    id: string;
    name: string;
    qualifications: string[];
  }>
): Promise<{ id: string; name: string } | null> {
  const prompt = `Find the best substitute teacher for:
- Original teacher: ${teacherName}
- Subject: ${subject}
- Available: ${availableTeachers.map((t) => `${t.name} (${t.qualifications.join(', ')})`).join('; ')}

Return JSON with teacherId and name, or null if no match.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content || content.toLowerCase() === 'null') return null;
    
    const jsonStr = content.replace(/```json\n?|```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    return parsed.id && parsed.name ? { id: parsed.id, name: parsed.name } : null;
  } catch (error) {
    console.error('Failed to find substitute:', error);
    return null;
  }
}

/**
 * Check schedule compliance with regulations
 * For RAG-based compliance
 */
export async function checkScheduleCompliance(
  schedule: string,
  regulations: string[]
): Promise<{ compliant: boolean; issues: string[] }> {
  const prompt = `Check if this schedule complies with the following regulations:

Schedule:
${schedule}

Regulations:
${regulations.join('\n')}

Return JSON with: { compliant: boolean, issues: string[] }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  });

  try {
    const content = response.choices[0].message.content;
    if (!content) return { compliant: true, issues: [] };
    
    const jsonStr = content.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to check compliance:', error);
    return { compliant: true, issues: [] };
  }
}
