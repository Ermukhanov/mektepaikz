import { create } from "zustand";

export type Employee = {
  id: string;
  name: string;
  role: string;
  subject?: string;
  avatarColor: string;
};

export const employees: Employee[] = [
  { id: "aigerim", name: "Aigerim", role: "Зам. директора", subject: "Math", avatarColor: "oklch(0.72 0.15 200)" },
  { id: "nazken", name: "Nazken", role: "Учитель нач. классов", avatarColor: "oklch(0.72 0.15 30)" },
  { id: "askar", name: "Askar", role: "Учитель", subject: "Math", avatarColor: "oklch(0.72 0.15 280)" },
  { id: "daniyar", name: "Daniyar", role: "Завхоз", avatarColor: "oklch(0.72 0.15 140)" },
];

export type ClassRow = {
  id: string;
  name: string;
  total: number;
  present: number;
  absent: number;
  sick: number;
  status: "ok" | "pending";
};

export type FeedMessage = {
  id: string;
  author: string;
  text: string;
  parsedClass?: string;
  ts: string;
};

export type Task = {
  id: string;
  title: string;
  assignee: string;
  status: "todo" | "doing" | "done";
  source?: "voice" | "manual";
  due?: string;
};

type Store = {
  classes: ClassRow[];
  feed: FeedMessage[];
  tasks: Task[];
  sickTeacherId: string | null;
  addFeed: (m: FeedMessage) => void;
  applyFeedToClass: (classId: string, present: number, sick: number, total: number) => void;
  addTask: (t: Task) => void;
  moveTask: (id: string, status: Task["status"]) => void;
  setSick: (id: string | null) => void;
};

export const useMektep = create<Store>((set) => ({
  classes: [
    { id: "1A", name: "1 «А»", total: 25, present: 23, absent: 2, sick: 2, status: "ok" },
    { id: "1B", name: "1 «Б»", total: 25, present: 25, absent: 0, sick: 0, status: "ok" },
    { id: "2A", name: "2 «А»", total: 27, present: 24, absent: 3, sick: 1, status: "ok" },
    { id: "2B", name: "2 «Б»", total: 26, present: 0, absent: 0, sick: 0, status: "pending" },
  ],
  feed: [
    { id: "f1", author: "Гульнара (1А)", text: "1А - 23 балалар, 2 ауру", parsedClass: "1A", ts: "08:42" },
    { id: "f2", author: "Айжан (1Б)", text: "1Б - 25, барлығы келді", parsedClass: "1B", ts: "08:44" },
    { id: "f3", author: "Сауле (2А)", text: "2а 24 человека трое болеют жоқ", parsedClass: "2A", ts: "08:47" },
  ],
  tasks: [
    { id: "t1", title: "Подготовить отчёт по питанию", assignee: "daniyar", status: "todo" },
    { id: "t2", title: "Проверить журналы 5-х классов", assignee: "nazken", status: "doing" },
    { id: "t3", title: "Закрыть приказ №76", assignee: "aigerim", status: "done" },
  ],
  sickTeacherId: null,
  addFeed: (m) => set((s) => ({ feed: [m, ...s.feed] })),
  applyFeedToClass: (classId, present, sick, total) =>
    set((s) => ({
      classes: s.classes.map((c) =>
        c.id === classId ? { ...c, present, sick, absent: total - present, status: "ok" } : c
      ),
    })),
  addTask: (t) => set((s) => ({ tasks: [t, ...s.tasks] })),
  moveTask: (id, status) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),
  setSick: (id) => set({ sickTeacherId: id }),
}));

// Naive AI parser for messy chat text → structured attendance
export function parseAttendance(text: string): { classId?: string; present?: number; sick?: number } {
  const lower = text.toLowerCase().replace(/[«»"']/g, "");
  const classMatch = lower.match(/([12])\s*[ауаб]/);
  let classId: string | undefined;
  if (classMatch) {
    const grade = classMatch[1];
    if (/а|a/.test(classMatch[0])) classId = `${grade}A`;
    else if (/б|b/.test(classMatch[0])) classId = `${grade}B`;
  }
  const numbers = [...lower.matchAll(/\d+/g)].map((m) => parseInt(m[0]));
  const present = numbers.find((n) => n >= 10 && n <= 40);
  const sickWord = /(ауру|болеют|болеет|сырқат|жоқ)/.test(lower);
  const sickNum = numbers.find((n) => n < 10);
  return { classId, present, sick: sickWord ? sickNum ?? 1 : 0 };
}

export function parseVoiceTask(text: string): { title: string; assignee: string } | null {
  const lower = text.toLowerCase();
  const found = employees.find((e) => lower.includes(e.name.toLowerCase()));
  if (!found) return null;
  const title = text.replace(new RegExp(found.name, "i"), "").replace(/^[,\s]+/, "").trim();
  return { title: title.charAt(0).toUpperCase() + title.slice(1), assignee: found.id };
}
