import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-hero"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="animate-ai-pulse flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-primary shadow-glow">
            <Brain className="h-14 w-14 text-primary-foreground" strokeWidth={1.8} />
          </div>
        </div>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-4xl font-bold text-primary-foreground tracking-tight">
            MEKTEP <span className="text-success">AI</span>
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/70">Aqbobek School · AI Thinking…</p>
        </motion.div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="h-1.5 w-1.5 rounded-full bg-success"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
