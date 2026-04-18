import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Sparkles, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { parseVoiceTask, employees } from "@/lib/mektep-data";

// Web Speech API types (not in default lib.dom)
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }>;
};
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SRConstructor = new () => SpeechRecognitionInstance;

function getSR(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

const langMap: Record<string, string> = { kk: "kk-KZ", ru: "ru-RU", en: "en-US" };

export function VoiceFAB() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  // Tasks are persisted via Supabase in next iteration; for now show feedback only.
  const addTask = (_t: { id: string; title: string; assignee: string; status: string; source: string }) => { void _t; };

  useEffect(() => {
    setSupported(!!getSR());
  }, []);

  const startListening = () => {
    const SR = getSR();
    if (!SR) return;
    try {
      const rec = new SR();
      rec.lang = langMap[i18n.language?.slice(0, 2) || "ru"] || "ru-RU";
      rec.continuous = false;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let finalText = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          finalText += r[0].transcript;
        }
        setText(finalText);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const stopListening = () => {
    recRef.current?.stop();
    setListening(false);
  };

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

  const closeAll = () => {
    stopListening();
    setOpen(false);
    setFeedback(null);
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
            onClick={closeAll}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-elegant overflow-hidden"
            >
              <div className="bg-gradient-hero p-6 text-primary-foreground relative">
                <button onClick={closeAll} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
                  <Sparkles className="h-3.5 w-3.5" /> {t("voice.title")}
                </div>
                <div className="flex items-end gap-1 h-16 mt-4">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-success rounded-full origin-bottom"
                      style={{
                        animation: listening ? `waveform ${0.6 + (i % 3) * 0.2}s ease-in-out ${i * 0.05}s infinite` : "none",
                        height: listening ? "100%" : "20%",
                        opacity: listening ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs opacity-80 mt-3">
                  {listening ? t("voice.listening") : supported ? t("voice.type") : t("voice.not_supported")}
                </p>
              </div>
              <div className="p-5">
                <div className="flex gap-2">
                  {supported && (
                    <button
                      onClick={listening ? stopListening : startListening}
                      className={`px-3 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors ${
                        listening
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-success text-success-foreground hover:opacity-90"
                      }`}
                      title={listening ? "Stop" : "Record"}
                    >
                      {listening ? <Square className="h-3.5 w-3.5 fill-current" /> : <Mic className="h-3.5 w-3.5" />}
                    </button>
                  )}
                  <input
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder='e.g. "Aigerim, prepare the hall for Friday"'
                    className="flex-1 px-3 py-2.5 rounded-lg bg-secondary text-sm border border-border focus:outline-none focus:border-ring"
                  />
                  <button onClick={submit} className="px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-1.5 hover:opacity-90">
                    <Send className="h-3.5 w-3.5" /> {t("voice.assign")}
                  </button>
                </div>
                {feedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-success font-medium">
                    {feedback}
                  </motion.div>
                )}
                <div className="mt-4 text-[11px] text-muted-foreground">
                  {t("voice.try")}:{" "}
                  <button onClick={() => setText("Daniyar, organize bus for excursion tomorrow")} className="underline hover:text-foreground">
                    "Daniyar, organize bus…"
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
