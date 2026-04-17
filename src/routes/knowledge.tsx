import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Sparkles, FileText } from "lucide-react";

export const Route = createFileRoute("/knowledge")({
  component: KnowledgePage,
});

const orders = [
  {
    id: "76",
    title: "Приказ №76 — Об организации питания",
    body: "В соответствии с пунктом 3.4 Постановления Правительства РК, организация горячего питания обучающихся 1-4 классов осуществляется за счёт средств местного бюджета. Ответственность за качество и своевременность поставки продукции возлагается на завхоза. Контроль качества осуществляется ежедневно с фиксацией в журнале установленной формы…",
    simple: [
      "1-4 классы получают бесплатное горячее питание.",
      "Завхоз отвечает за поставку и качество.",
      "Каждый день вести журнал контроля.",
      "Финансирование — местный бюджет.",
      "Отчёт сдаётся в конце месяца.",
    ],
  },
  {
    id: "110",
    title: "Приказ №110 — О внеклассной работе",
    body: "Внеклассная деятельность организуется не менее 5 часов в неделю с обязательным охватом не менее 70% обучающихся. Кружки утверждаются на педсовете…",
    simple: [
      "Минимум 5 часов кружков в неделю.",
      "Охват ≥70% учеников обязательно.",
      "Кружки утверждает педсовет.",
      "Ведётся отдельный журнал посещаемости.",
      "Отчёт классного руководителя — раз в четверть.",
    ],
  },
  {
    id: "130",
    title: "Приказ №130 — О дисциплинарной ответственности",
    body: "При нарушении дисциплины обучающимся применяются меры педагогического воздействия с обязательным уведомлением родителей в течение 24 часов…",
    simple: [
      "Уведомить родителей в течение 24 часов.",
      "Сначала — беседа, потом письменное замечание.",
      "Оформить акт в 3 экземплярах.",
      "Привлечь школьного психолога.",
      "Хранить документы 3 года.",
    ],
  },
];

function KnowledgePage() {
  const [open, setOpen] = useState<string | null>(null);
  const [simplify, setSimplify] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = orders.filter((o) => o.title.toLowerCase().includes(q.toLowerCase()) || o.body.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-bold">RAG Knowledge Base · Приказы</h1>
        <p className="text-sm text-muted-foreground mt-1">Ask AI about school laws — get a teacher-friendly summary.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask AI about school laws… (e.g. 'питание')"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:border-ring"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {filtered.map((o) => (
          <motion.div
            key={o.id}
            layout
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">№{o.id}</span>
            </div>
            <h3 className="font-semibold mt-3 text-foreground">{o.title}</h3>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{o.body}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setOpen(open === o.id ? null : o.id)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary hover:bg-border">
                Read full
              </button>
              <button
                onClick={() => setSimplify(o.id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground flex items-center gap-1.5"
              >
                <Sparkles className="h-3 w-3" /> Simplify
              </button>
            </div>

            {open === o.id && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-foreground bg-secondary/50 rounded-lg p-3">
                {o.body}
              </motion.div>
            )}

            {simplify === o.id && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-lg bg-success/10 border border-success/20 p-3">
                <div className="text-[10px] uppercase tracking-wider text-success font-bold mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI for teachers
                </div>
                <ul className="space-y-1.5">
                  {o.simple.map((s, i) => (
                    <li key={i} className="text-xs text-foreground flex gap-2">
                      <span className="text-success font-bold">{i + 1}.</span> {s}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
