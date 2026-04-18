import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSchoolData } from "@/lib/use-school-data";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const { t } = useTranslation();
  const { tasks, employees, refresh } = useSchoolData();
  const cols: { id: "pending" | "in_progress" | "done"; label: string; tone: string }[] = [
    { id: "pending", label: t("tasks.todo"), tone: "bg-muted-foreground" },
    { id: "in_progress", label: t("tasks.doing"), tone: "bg-warning" },
    { id: "done", label: t("tasks.done"), tone: "bg-success" },
  ];
  const moveTask = async (id: string, status: string) => {
    await supabase.from("tasks").update({ status }).eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold">{t("tasks.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("tasks.subtitle")}</p>
        </div>
        <button className="text-xs font-semibold bg-primary text-primary-foreground rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> {t("tasks.add")}
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
              {tasks.filter((t) => t.status === col.id).map((task) => {
                const emp = employees.find((e) => e.id === task.assigned_to);
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-card border border-border p-3 shadow-sm"
                  >
                    {task.source === "voice" && (
                      <div className="text-[10px] uppercase tracking-wider text-success font-bold mb-1">🎙 Voice</div>
                    )}
                    <div className="text-sm font-medium text-foreground">{task.title}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded-full text-[10px] font-bold text-primary-foreground flex items-center justify-center bg-gradient-primary">
                          {emp?.full_name?.[0]?.toUpperCase() || "?"}
                        </span>
                        <span className="text-xs text-muted-foreground">{emp?.full_name || "Unassigned"}</span>
                      </div>
                      <div className="flex gap-1">
                        {col.id !== "pending" && (
                          <button onClick={() => moveTask(task.id, col.id === "done" ? "in_progress" : "pending")} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-border">←</button>
                        )}
                        {col.id !== "done" && (
                          <button onClick={() => moveTask(task.id, col.id === "pending" ? "in_progress" : "done")} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary hover:bg-border">→</button>
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
