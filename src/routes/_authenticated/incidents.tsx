import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/incidents")({
  component: IncidentsPage,
});

const incidents = [
  { id: 1, time: "Сегодня · 09:12", title: "Повышенная заболеваемость в 1А", level: "warn", body: "AI зафиксировал 5 сообщений об 'ауру' за 2 дня.", resolved: false },
  { id: 2, time: "Вчера · 14:30", title: "Конфликт между учениками 6Б", level: "high", body: "Сообщение от родителя в группе. Передано психологу.", resolved: true },
  { id: 3, time: "12.04 · 10:05", title: "Поломка проектора в каб. 204", level: "low", body: "Завхоз Daniyar уведомлён.", resolved: true },
];

function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold">Incident Log</h1>
        <p className="text-sm text-muted-foreground mt-1">AI flags anomalies from chats and reports.</p>
      </div>
      <div className="space-y-3">
        {incidents.map((i) => (
          <div key={i.id} className={`rounded-2xl border bg-card p-5 flex gap-4 ${i.level === "high" ? "border-destructive/40" : i.level === "warn" ? "border-warning/40" : "border-border"}`}>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${i.level === "high" ? "bg-destructive/10 text-destructive" : i.level === "warn" ? "bg-warning/10 text-warning" : "bg-secondary text-muted-foreground"}`}>
              {i.resolved ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{i.title}</h3>
                <span className="text-xs text-muted-foreground">{i.time}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{i.body}</p>
              {i.resolved && <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-success font-bold">Resolved</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
