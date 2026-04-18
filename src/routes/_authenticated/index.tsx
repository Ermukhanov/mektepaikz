import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSchoolData } from "@/lib/use-school-data";
import { MessageSquare, Users2, TrendingUp, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: Overview,
});

function Overview() {
  const { t } = useTranslation();
  const { classes, feed, employees } = useSchoolData();

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-foreground">
          {t("overview.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("overview.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-primary" />
              <h2 className="font-semibold text-foreground">{t("overview.attendance_live")}</h2>
            </div>
            <span className="text-xs text-success font-medium flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> {t("overview.ai_parsing")}
            </span>
          </div>
          {classes.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No classes yet. Add classes from the Schedule page.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-2.5 font-semibold">{t("overview.class")}</th>
                  <th className="text-right px-3 py-2.5 font-semibold">{t("overview.total")}</th>
                  <th className="text-right px-3 py-2.5 font-semibold">{t("overview.present")}</th>
                  <th className="text-right px-3 py-2.5 font-semibold">{t("overview.sick")}</th>
                  <th className="text-right px-5 py-2.5 font-semibold">{t("overview.status")}</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <motion.tr key={c.id} layout className="border-t border-border hover:bg-secondary/30">
                    <td className="px-5 py-3 font-semibold text-foreground">{c.name}</td>
                    <td className="px-3 py-3 text-right text-muted-foreground">{c.total_students}</td>
                    <td className="px-3 py-3 text-right font-semibold text-foreground">{c.present || "—"}</td>
                    <td className="px-3 py-3 text-right text-warning">{c.sick || "—"}</td>
                    <td className="px-5 py-3 text-right">
                      {c.status === "ok" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                          ✓ {t("overview.parsed")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {t("overview.waiting")}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">{t("overview.live_feed")}</h2>
            <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Telegram · WhatsApp</span>
          </div>
          <div className="p-3 space-y-2 max-h-[420px] overflow-auto">
            {feed.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Waiting for messages from Telegram/WhatsApp…
              </div>
            ) : (
              feed.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-xl bg-secondary/60 p-3"
                >
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">{m.sender_name || "Unknown"}</span>
                    <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="text-sm text-foreground">{m.text}</div>
                  {m.parsed_intent && (
                    <div className="mt-2 text-[11px] text-success font-medium flex items-center gap-1">
                      <Activity className="h-3 w-3" /> AI → {m.parsed_intent}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-gradient-hero text-primary-foreground p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
            <TrendingUp className="h-4 w-4" /> {t("overview.insight_title")}
          </div>
          <p className="mt-3 text-lg font-semibold leading-snug">
            {classes.length > 0
              ? `Total present today: ${classes.reduce((a, c) => a + c.present, 0)} students across ${classes.length} classes.`
              : "Add your first class to see AI insights."}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground">{t("overview.team")}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {employees.length === 0 ? (
              <span className="text-xs text-muted-foreground">No team members yet.</span>
            ) : (
              employees.map((e) => (
                <div key={e.id} className="flex items-center gap-2 bg-secondary rounded-full pl-1 pr-3 py-1">
                  <span className="h-6 w-6 rounded-full text-[11px] font-bold text-primary-foreground flex items-center justify-center bg-gradient-primary">
                    {e.full_name[0]?.toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-foreground">{e.full_name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
