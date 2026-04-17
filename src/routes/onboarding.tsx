import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { useState } from "react";
import { CalendarDays, Mic, BookOpenText, ArrowRight } from "lucide-react";
import { setOnboarded } from "@/lib/auth";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const slides = [
    { icon: CalendarDays, title: t("onboarding.s1_title"), desc: t("onboarding.s1_desc"), tone: "from-primary to-primary-glow" },
    { icon: Mic, title: t("onboarding.s2_title"), desc: t("onboarding.s2_desc"), tone: "from-success to-primary" },
    { icon: BookOpenText, title: t("onboarding.s3_title"), desc: t("onboarding.s3_desc"), tone: "from-warning to-primary" },
  ];

  const finish = () => {
    setOnboarded();
    navigate({ to: "/auth" });
  };
  const next = () => (step < 2 ? setStep(step + 1) : finish());

  const s = slides[step];

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <button
            onClick={finish}
            className="text-sm text-primary-foreground/80 hover:text-primary-foreground"
          >
            {t("onboarding.skip")}
          </button>
        </div>

        <div className="rounded-3xl bg-card/95 backdrop-blur border border-border shadow-elegant overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="p-8 text-center"
            >
              <div className={`mx-auto h-24 w-24 rounded-3xl bg-gradient-to-br ${s.tone} flex items-center justify-center shadow-glow mb-6`}>
                <s.icon className="h-12 w-12 text-primary-foreground" strokeWidth={1.6} />
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold text-foreground mb-3">
                {s.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="px-8 pb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? "w-8 bg-primary" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-full rounded-xl bg-gradient-primary text-primary-foreground font-semibold py-3 shadow-elegant hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              {step < 2 ? t("onboarding.next") : t("onboarding.start")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
