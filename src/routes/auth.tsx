import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { useState, type FormEvent } from "react";
import { Brain, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("mektep.session");
      if (raw) throw redirect({ to: "/dashboard" });
    } catch (e) {
      // re-throw redirect
      if (e && typeof e === "object" && "to" in e) throw e;
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { t } = useTranslation();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("director");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await signup(name || email.split("@")[0], email, password, role);
      navigate({ to: "/dashboard" });
    } catch {
      setError(t("auth.wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-3">
            <Brain className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-primary-foreground">
            {mode === "login" ? t("auth.title_login") : t("auth.title_signup")}
          </h1>
        </div>

        <div className="rounded-3xl bg-card border border-border shadow-elegant p-6">
          {/* Tabs */}
          <div className="flex bg-secondary rounded-lg p-1 mb-5">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {t(`auth.${m}`)}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Field icon={User}>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("auth.name")}
                  className="w-full bg-transparent outline-none text-sm"
                />
              </Field>
            )}
            <Field icon={Mail}>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.email")}
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>
            <Field icon={Lock}>
              <input
                required
                type="password"
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.password")}
                className="w-full bg-transparent outline-none text-sm"
              />
            </Field>

            {mode === "signup" && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  {t("auth.role")}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["director", "teacher", "staff"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`text-xs font-semibold py-2 rounded-lg border transition-all ${
                        role === r
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {t(`auth.${r}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs font-medium text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-primary text-primary-foreground font-semibold py-3 shadow-elegant hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t(mode === "login" ? "auth.submit_login" : "auth.submit_signup")}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            {mode === "login" ? t("auth.no_account") : t("auth.have_account")}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="text-primary font-semibold hover:underline"
            >
              {t(mode === "login" ? "auth.signup" : "auth.login")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 focus-within:border-primary transition-colors">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      {children}
    </label>
  );
}
