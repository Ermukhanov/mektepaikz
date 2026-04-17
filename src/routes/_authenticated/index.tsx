import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useMektep, parseAttendance, employees } from "@/lib/mektep-data";
import { MessageSquare, Users2, TrendingUp, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: Overview,
});

function Overview() {
  const { classes, feed, addFeed, applyFeedToClass } = useMektep();

  // Simulate incoming WhatsApp/TG message after mount
  useEffect(() => {
    const t = setTimeout(() => {
      const msg = {
        id: `f${Date.now()}`,
        author: "Жанар (2Б)",
        text: "2б 26 балалар келді, ауру жоқ",
        ts: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      };
      const parsed = parseAttendance(msg.text);
      addFeed({ ...msg, parsedClass: parsed.classId });
      if (parsed.classId && parsed.present !== undefined) {
        const cls = classes.find((c) => c.id === parsed.classId);
        if (cls) applyFeedToClass(parsed.classId, parsed.present, parsed.sick ?? 0, cls.total);
      }
    }, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-foreground">Director Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Live AI parsing of WhatsApp/Telegram chats → structured data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Table */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">Attendance · Live</h2>
            </div>
            <span className="text-xs text-success font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> AI parsing
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-2.5 font-semibold">Class</th>
                <th className="text-right px-3 py-2.5 font-semibold">Total</th>
                <th className="text-right px-3 py-2.5 font-semibold">Present</th>
                <th className="text-right px-3 py-2.5 font-semibold">Sick</th>
                <th className="text-right px-5 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <motion.tr
                  key={c.id}
                  layout
                  className="border-t border-border hover:bg-secondary/30"
                >
                  <td className="px-5 py-3 font-semibold text-foreground">{c.name}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground">{c.total}</td>
                  <td className="px-3 py-3 text-right font-semibold text-foreground">{c.present || "—"}</td>
                  <td className="px-3 py-3 text-right text-warning">{c.sick || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {c.status === "ok" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                        ✓ Parsed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        Waiting…
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Live Feed */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Live Chat Feed</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">WhatsApp · Telegram</span>
          </div>
          <div className="p-3 space-y-2 max-h-[420px] overflow-auto">
            {feed.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-secondary/60 p-3"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span className="font-semibold text-foreground">{m.author}</span>
                  <span>{m.ts}</span>
                </div>
                <div className="text-sm text-foreground">{m.text}</div>
                {m.parsedClass && (
                  <div className="mt-2 text-[11px] text-success font-medium flex items-center gap-1">
                    <Activity className="h-3 w-3" /> AI → mapped to {m.parsedClass}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-gradient-hero text-primary-foreground p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
            <TrendingUp className="h-4 w-4" /> AI Insight of the day
          </div>
          <p className="mt-3 text-lg font-semibold leading-snug">
            Attendance in 1 «А» dropped by 8% this week — likely flu wave. Consider notifying parents.
          </p>
          <button className="mt-4 text-xs font-semibold bg-success text-success-foreground rounded-lg px-3 py-1.5">
            Draft notification
          </button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground">Team on duty</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {employees.map((e) => (
              <div key={e.id} className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-3 py-1">
                <span className="h-6 w-6 rounded-full text-[11px] font-bold text-primary-foreground flex items-center justify-center" style={{ background: e.avatarColor }}>
                  {e.name[0]}
                </span>
                <span className="text-xs font-medium text-foreground">{e.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
