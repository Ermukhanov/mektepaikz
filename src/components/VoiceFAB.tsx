import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Sparkles, Send } from "lucide-react";
import { useState } from "react";
import { useMektep, parseVoiceTask, employees } from "@/lib/mektep-data";

export function VoiceFAB() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const addTask = useMektep((s) => s.addTask);

  const submit = () => {
    if (!text.trim()) return;
    const parsed = parseVoiceTask(text);
    if (!parsed) {
      setFeedback("⚠ AI couldn't detect an assignee. Try: 'Aigerim, prepare the hall…'");
      return;
    }
    const emp = employees.find((e) => e.id === parsed.assignee);
    addTask({
      id: `t${Date.now()}`,
      title: parsed.title || "New task",
      assignee: parsed.assignee,
      status: "todo",
      source: "voice",
    });
    setFeedback(`✓ Task assigned to ${emp?.name}`);
    setText("");
    setTimeout(() => {
      setOpen(false);
      setFeedback(null);
    }, 1400);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-16 w-16 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center text-primary-foreground"
      >
        <Mic className="h-6 w-6" />
        <span className="absolute inset-0 rounded-full animate-ai-pulse pointer-events-none" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-elegant overflow-hidden"
            >
              <div className="bg-gradient-hero p-6 text-primary-foreground relative">
                <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                  <Sparkles className="h-3.5 w-3.5" /> Voice-to-Task AI
                </div>
                <div className="flex items-end gap-1 h-16 mt-4">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-success rounded-full animate-waveform origin-bottom"
                      style={{ animationDelay: `${i * 0.05}s`, animationDuration: `${0.6 + (i % 3) * 0.2}s`, height: "100%" }}
                    />
                  ))}
                </div>
                <p className="text-xs opacity-80 mt-3">Listening… speak or type your instruction</p>
              </div>
              <div className="p-5">
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder='e.g. "Aigerim, prepare the hall for Friday"'
                    className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:border-ring"
                  />
                  <button onClick={submit} className="px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-1.5 hover:opacity-90">
                    <Send className="h-3.5 w-3.5" /> Assign
                  </button>
                </div>
                {feedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-success font-medium">
                    {feedback}
                  </motion.div>
                )}
                <div className="mt-4 text-[11px] text-muted-foreground">
                  Try: <button onClick={() => setText("Daniyar, organize bus for excursion tomorrow")} className="underline hover:text-foreground">"Daniyar, organize bus…"</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
