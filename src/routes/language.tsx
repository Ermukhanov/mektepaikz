import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { Brain, Check } from "lucide-react";

export const Route = createFileRoute("/language")({
  component: LanguagePage,
});

const langs = [
  { code: "kk", label: "Қазақша", flag: "🇰🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

function LanguagePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const select = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("mektep.lang", code);
  };

  const cont = () => navigate({ to: "/onboarding" });

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-card/95 backdrop-blur border border-border shadow-elegant p-8"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow mb-4">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-foreground">
            {t("lang.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("lang.subtitle")}</p>
        </div>

        <div className="space-y-2 mb-6">
          {langs.map((l) => {
            const active = i18n.language?.startsWith(l.code);
            return (
              <button
                key={l.code}
                onClick={() => select(l.code)}
                className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <span className="text-2xl">{l.flag}</span>
                <span className="flex-1 font-semibold text-foreground">{l.label}</span>
                {active && <Check className="h-5 w-5 text-primary" />}
              </button>
            );
          })}
        </div>

        <button
          onClick={cont}
          className="w-full rounded-xl bg-gradient-primary text-primary-foreground font-semibold py-3 shadow-elegant hover:opacity-95 transition-opacity"
        >
          {t("lang.continue")}
        </button>
      </motion.div>
    </div>
  );
}
