import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMektep, employees } from "@/lib/mektep-data";
import { Stethoscope, Sparkles } from "lucide-react";

export const Route = createFileRoute("/schedule")({
  component: SchedulePage,
});

const periods = ["08:30", "09:25", "10:20", "11:15", "12:10"];
const days = ["Пн", "Вт", "Ср", "Чт", "Пт"];

// Build a sample lesson grid where Askar teaches Math in some slots
const lessons: Record<string, { teacherId: string; subj: string }> = {
  "0-0": { teacherId: "askar", subj: "Math 5А" },
  "1-2": { teacherId: "askar", subj: "Math 6Б" },
  "2-1": { teacherId: "nazken", subj: "Чтение 1А" },
  "3-3": { teacherId: "askar", subj: "Math 7А" },
  "4-0": { teacherId: "nazken", subj: "Письмо 2Б" },
  "0-2": { teacherId: "aigerim", subj: "Math 8А" },
  "2-3": { teacherId: "aigerim", subj: "Math 9А" },
};

function SchedulePage() {
  const { sickTeacherId, setSick } = useMektep();

  const isSlotSick = (i: number, j: number) => {
    const k = `${i}-${j}`;
    return sickTeacherId && lessons[k]?.teacherId === sickTeacherId;
  };

  const isSubstitute = (i: number, j: number) => {
    const k = `${i}-${j}`;
    if (!sickTeacherId || !lessons[k]) return false;
    // Aigerim suggested as free for slots she doesn't teach
    return lessons[k].teacherId !== sickTeacherId && false; // we highlight Aigerim free slots separately below
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold">Smart Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">AI suggests substitutes the moment a teacher reports sick.</p>
        </div>
        <div className="flex gap-2">
          <select
            value={sickTeacherId ?? ""}
            onChange={(e) => setSick(e.target.value || null)}
            className="text-sm px-3 py-2 rounded-lg bg-secondary border border-border"
          >
            <option value="">Select teacher…</option>
            {employees.filter((e) => e.subject).map((e) => (
              <option key={e.id} value={e.id}>{e.name} ({e.subject})</option>
            ))}
          </select>
          <button
            disabled={!sickTeacherId}
            onClick={() => setSick(sickTeacherId)}
            className="text-sm font-semibold bg-destructive text-destructive-foreground rounded-lg px-3 py-2 flex items-center gap-1.5 disabled:opacity-40"
          >
            <Stethoscope className="h-3.5 w-3.5" /> Report Sick
          </button>
        </div>
      </div>

      {sickTeacherId && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-gradient-hero text-primary-foreground p-4 flex items-center gap-3"
        >
          <Sparkles className="h-5 w-5 text-success" />
          <div className="text-sm">
            <span className="font-semibold">{employees.find((e) => e.id === sickTeacherId)?.name}</span> отсутствует. AI предлагает замену:{" "}
            <span className="font-semibold text-success">Aigerim</span> (свободна и преподаёт {employees.find((e) => e.id === sickTeacherId)?.subject}).
          </div>
        </motion.div>
      )}

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(${days.length}, 1fr)` }}>
          <div className="bg-secondary/50 p-3 text-xs font-semibold text-muted-foreground">Time</div>
          {days.map((d) => (
            <div key={d} className="bg-secondary/50 p-3 text-xs font-semibold text-muted-foreground border-l border-border">{d}</div>
          ))}
          {periods.map((p, i) => (
            <div key={`row-${i}`} className="contents">
              <div className="p-3 text-xs text-muted-foreground border-t border-border bg-secondary/20">{p}</div>
              {days.map((_, j) => {
                const k = `${i}-${j}`;
                const lesson = lessons[k];
                const sick = isSlotSick(i, j);
                const free = sickTeacherId && !lesson;
                return (
                  <div key={`c-${k}`} className={`p-2 border-t border-l border-border min-h-[64px] transition-colors ${sick ? "bg-destructive/10" : free ? "bg-success/10" : ""}`}>
                    {lesson && (
                      <div className={`rounded-lg p-2 text-xs ${sick ? "bg-destructive text-destructive-foreground" : "bg-secondary text-foreground"}`}>
                        <div className="font-semibold">{lesson.subj}</div>
                        <div className="opacity-70 mt-0.5">{employees.find((e) => e.id === lesson.teacherId)?.name}</div>
                      </div>
                    )}
                    {free && (
                      <div className="text-[10px] text-success font-bold uppercase tracking-wider">Aigerim free</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
