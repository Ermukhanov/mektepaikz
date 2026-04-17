import { Link, useLocation } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import {
  LayoutDashboard,
  CalendarDays,
  KanbanSquare,
  AlertTriangle,
  BookOpenText,
  Users,
  Brain,
  Search,
  Bell,
  Utensils,
  CheckCircle2,
  ClipboardList,
  LogOut,
  Globe,
} from "lucide-react";
import { SplashScreen } from "./SplashScreen";
import { VoiceFAB } from "./VoiceFAB";
import { useMektep } from "@/lib/mektep-data";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const [splash, setSplash] = useState(true);
  const location = useLocation();
  const tasks = useMektep((s) => s.tasks);
  const classes = useMektep((s) => s.classes);
  const { user, logout } = useAuth();

  const nav = [
    { to: "/", label: t("nav.overview"), icon: LayoutDashboard },
    { to: "/schedule", label: t("nav.schedule"), icon: CalendarDays },
    { to: "/tasks", label: t("nav.tasks"), icon: KanbanSquare },
    { to: "/incidents", label: t("nav.incidents"), icon: AlertTriangle },
    { to: "/knowledge", label: t("nav.knowledge"), icon: BookOpenText },
    { to: "/employees", label: t("nav.employees"), icon: Users },
  ];

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const totalPresent = classes.reduce((a, c) => a + c.present, 0);
  const totalKids = classes.reduce((a, c) => a + c.total, 0);
  const attendance = totalKids ? Math.round((totalPresent / totalKids) * 100) : 0;
  const portions = totalPresent;
  const activeTasks = tasks.filter((t) => t.status !== "done").length;

  const cycleLang = () => {
    const order = ["kk", "ru", "en"];
    const i = order.indexOf(i18n.language?.slice(0, 2) || "en");
    const next = order[(i + 1) % order.length];
    i18n.changeLanguage(next);
    localStorage.setItem("mektep.lang", next);
  };

  return (
    <>
      <AnimatePresence>{splash && <SplashScreen />}</AnimatePresence>

      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
          <div className="px-5 py-5 border-b border-border flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-base font-bold text-foreground leading-none">
                MEKTEP <span className="text-success">AI</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Aqbobek School</div>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {nav.map((n) => {
              const active = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-elegant"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3 border-t border-border space-y-2">
            <div className="rounded-lg bg-gradient-primary p-3 text-primary-foreground">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> AI Online
              </div>
              <div className="text-[11px] opacity-80 mt-1">Listening to 12 chats</div>
            </div>
            {user && (
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground truncate">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{t(`auth.${user.role}`)}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md hover:bg-card text-muted-foreground hover:text-destructive"
                  title={t("auth.logout")}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-30">
            <div className="px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Ask AI anything…"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground border border-transparent focus:outline-none focus:border-ring"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cycleLang}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-secondary text-muted-foreground text-xs font-semibold uppercase"
                  title="Change language"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {i18n.language?.slice(0, 2)}
                </button>
                <button className="relative p-2 rounded-lg hover:bg-secondary text-muted-foreground">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || "D"}
                </div>
              </div>
            </div>
            {/* Stats bar */}
            <div className="px-6 pb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard icon={Utensils} label="Canteen Summary" value={`${portions} portions`} hint="Auto-calculated · today" tone="primary" />
              <StatCard icon={CheckCircle2} label="Attendance Rate" value={`${attendance}%`} hint="Live from teachers' chat" tone="success" />
              <StatCard icon={ClipboardList} label="Active Tasks" value={`${activeTasks}`} hint="Pending instructions" tone="warning" />
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>

        <VoiceFAB />
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tone: "primary" | "success" | "warning";
}) {
  const toneMap = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3"
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{label}</div>
        <div className="text-lg font-bold text-foreground leading-tight">{value}</div>
        <div className="text-[11px] text-muted-foreground truncate">{hint}</div>
      </div>
    </motion.div>
  );
}
