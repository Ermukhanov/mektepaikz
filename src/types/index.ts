// User & School Types
export type UserRole = 'director' | 'teacher' | 'admin' | 'parent';

export interface School {
  id: string;
  name: string;
  schoolId: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  students_count: number;
  teachers_count: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  schoolId: string;
  language: 'ru' | 'kz' | 'en';
  avatar_url?: string;
  phone?: string;
  position?: string;
  qualifications?: string[];
  created_at: string;
  updated_at: string;
}

// Attendance Types
export interface Attendance {
  id: string;
  schoolId: string;
  classId: string;
  date: string;
  presentCount: number;
  absentCount: number;
  sickCount: number;
  reportedBy: string;
  created_at: string;
}

// Incident Types
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Incident {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  location?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

// Schedule Types
export interface ScheduleEntry {
  id: string;
  schoolId: string;
  classId: string;
  teacherId: string;
  lessonNumber: number;
  dayOfWeek: number; // 0-6 (Mon-Sun)
  subject: string;
  room: string;
  duration: number; // in minutes
  date: string;
  isSubstitution: boolean;
  substitutedTeacherId?: string;
  substitutionReason?: string;
}

// Task Types
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedAt?: string;
  voiceRecordingUrl?: string;
  tags?: string[];
  createdAt: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  schoolId: string;
  chatId: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'voice' | 'image';
  voiceUrl?: string;
  parsedData?: Record<string, any>;
  createdAt: string;
}

// AI Analysis Types
export interface AIAnalysisResult {
  type: 'attendance' | 'incident' | 'task' | 'general';
  confidence: number;
  data: Record<string, any>;
  rawMessage: string;
}

// Class Types
export interface Class {
  id: string;
  schoolId: string;
  name: string;
  gradeLevel: number;
  classTeacherId: string;
  studentCount: number;
  room: string;
}

// Teacher Qualification

export interface TeacherQualification {
  id: string;
  teacherId: string;
  subject: string;
  level: string;
  certificationDate: string;
}
