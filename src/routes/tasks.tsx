import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMektep, employees } from "@/lib/mektep-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

const cols: { id: "todo" | "doing" | "done"; label: string; tone: string }[] = [
  { id: "todo", label: "To Do", tone: "bg-muted-foreground" },
  { id: "doing", label: "In Progress", tone: "bg-warning" },
  { id: "done", label: "Done", tone: "bg-success" },
];

function TasksPage() {
  const { tasks, moveTask } = useMektep();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold">Task Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Voice-dictated tasks land here automatically.</p>
        </div>
        <button className="text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cols.map((col) => (
          <div key={col.id} className="rounded-2xl bg-secondary/40 p-3 min-h-[400px]">
            <div className="flex items-center gap-2 px-2 py-2">
              <span className={`h-2 w-2 rounded-full ${col.tone}`} />
              <h3 className="font-semibold text-sm">{col.label}</h3>
              <span className="ml-auto text-xs text-muted-foreground">{tasks.filter((t) => t.status === col.id).length}</span>
            </div>
            <div className="space-y-2 mt-1">
              {tasks.filter((t) => t.status === col.id).map((t) => {
                const emp = employees.find((e) => e.id === t.assignee);
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-card border border-border p-3 shadow-sm"
                  >
                    {t.source === "voice" && (
                      <div className="text-[10px] uppercase tracking-wider text-success font-bold mb-1">🎙 Voice</div>
                    )}
                    <div className="text-sm font-medium text-foreground">{t.title}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center" style={{ background: emp?.avatarColor }}>
                          {emp?.name[0]}
                        </span>
                        <span className="text-xs text-muted-foreground">{emp?.name}</span>
                      </div>
                      <div className="flex gap-1">
                        {col.id !== "todo" && (
                          <button onClick={() => moveTask(t.id, col.id === "done" ? "doing" : "todo")} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-border">←</button>
                        )}
                        {col.id !== "done" && (
                          <button onClick={() => moveTask(t.id, col.id === "todo" ? "doing" : "done")} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-border">→</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
