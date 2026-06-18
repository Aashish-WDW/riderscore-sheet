"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { SJ_CONFIGS } from "@/lib/showjumping";

type SJRow = {
  id: string;
  riderNo: string;
  name: string;
  horse: string;
  obstacles: string[];
  jumpingTime: string;
  timeFaults: string;
};

const newRow = (obstacleCount: number): SJRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  riderNo: "",
  name: "",
  horse: "",
  obstacles: Array.from({ length: obstacleCount }, () => ""),
  jumpingTime: "",
  timeFaults: "",
});

const obstacleFaults = (row: SJRow) =>
  row.obstacles.reduce((sum, v) => {
    const n = parseFloat(v);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

const totalFaults = (row: SJRow) => {
  const tf = parseFloat(row.timeFaults);
  return obstacleFaults(row) + (isNaN(tf) ? 0 : tf);
};

export default function ShowjumpingScoringPage() {
  const params = useParams();
  const courseId = (params?.courseId as string) ?? "jumping-phase";
  const config = SJ_CONFIGS[courseId] ?? SJ_CONFIGS["jumping-phase"];
  const STORAGE_KEY = `scoring-draft-sj-v1:${courseId}`;

  const [meta, setMeta] = useState({
    ponyClub: "",
    date: "",
    classs: "",
    courseDesigner: "",
    judge: "",
    length: "",
    timeAllowed: "",
    timeLimit: "",
  });
  const [rows, setRows] = useState<SJRow[]>([newRow(config.obstacles)]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.meta) setMeta(d.meta);
        if (Array.isArray(d.rows) && d.rows.length) setRows(d.rows);
      }
    } catch {}
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ meta, rows, ts: Date.now() }));
        setSavedAt(Date.now());
      } catch {}
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, rows]);

  const updateRow = (id: string, patch: Partial<SJRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const updateObstacle = (id: string, idx: number, val: string) =>
    setRows((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, obstacles: r.obstacles.map((o, i) => (i === idx ? val : o)) } : r
      )
    );

  const addRow = () => setRows((rs) => [...rs, newRow(config.obstacles)]);
  const removeRow = (id: string) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  const reset = () => {
    if (!confirm("Reset all rows and entries?")) return;
    setMeta({ ponyClub: "", date: "", classs: "", courseDesigner: "", judge: "", length: "", timeAllowed: "", timeLimit: "" });
    setRows([newRow(config.obstacles)]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setSavedAt(null);
  };

  const exportPdf = () => {
    const safe = (s: string) => s.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "untitled";
    const fname = `${courseId}_${safe(meta.classs || "class")}_${safe(meta.date || "date")}`;
    const prev = document.title;
    document.title = fname;
    window.print();
    setTimeout(() => { document.title = prev; }, 1000);
  };

  const saveSheet = () => {
    const session = {
      id: `sj-session-${Date.now()}`,
      courseId,
      meta,
      rows: rows.map((r) => ({ ...r, jumpingFaults: obstacleFaults(r), totalFaults: totalFaults(r) })),
      savedAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("saved-sj-sheets") ?? "[]");
      localStorage.setItem("saved-sj-sheets", JSON.stringify([...existing, session]));
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const savedLabel = savedAt
    ? `Saved · ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Not saved yet";

  const obstacleNos = useMemo(() => Array.from({ length: config.obstacles }, (_, i) => i + 1), [config.obstacles]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors" aria-label="Back" title="Back">←</Link>
            <div className="h-8 w-8 shrink-0 rounded-md bg-primary text-primary-foreground grid place-items-center font-display font-semibold text-sm">SJ</div>
            <div className="min-w-0">
              <div className="font-display text-base sm:text-lg leading-tight truncate">{config.label}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground tracking-wide uppercase truncate">{config.appendix} · Scoring</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={savedLabel}>
              <span className={`h-1.5 w-1.5 rounded-full ${savedAt ? "bg-highlight" : "bg-muted-foreground/40"}`} />
              <span className="tabular-nums hidden lg:inline">{savedLabel}</span>
            </div>
            <button onClick={reset} className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors">Reset</button>
            <button
              onClick={saveSheet}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${savedSuccess ? "border-highlight bg-highlight/10 text-highlight" : "border-highlight bg-highlight text-background hover:opacity-90"}`}
            >
              {savedSuccess ? "Saved ✓" : "Save Sheet"}
            </button>
            <button onClick={exportPdf} className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Export PDF</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-8 print:px-4 print:py-2">
        <section className="mb-6 sm:mb-8 print:mb-4">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Pony Club · Eventing</div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.05]">
            {config.label} <span className="italic text-highlight">score sheet</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-prose">{config.subtitle}</p>
        </section>

        <section className="mb-6 sm:mb-8 print:mb-4 bg-card border border-border rounded-xl p-4 sm:p-6 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <Field label="Pony Club" value={meta.ponyClub} onChange={(v) => setMeta({ ...meta, ponyClub: v })} />
            <Field label="Date" value={meta.date} onChange={(v) => setMeta({ ...meta, date: v })} />
            <Field label="Class" value={meta.classs} onChange={(v) => setMeta({ ...meta, classs: v })} />
            <Field label="Course Designer" value={meta.courseDesigner} onChange={(v) => setMeta({ ...meta, courseDesigner: v })} />
            <Field label="Judge" value={meta.judge} onChange={(v) => setMeta({ ...meta, judge: v })} />
            <Field label="Length" value={meta.length} onChange={(v) => setMeta({ ...meta, length: v })} />
            <Field label="Time Allowed" value={meta.timeAllowed} onChange={(v) => setMeta({ ...meta, timeAllowed: v })} />
            <Field label="Time Limit" value={meta.timeLimit} onChange={(v) => setMeta({ ...meta, timeLimit: v })} />
          </div>
        </section>

        <section className="mb-8 print:mb-4">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="font-display text-xl sm:text-2xl tracking-tight">Rounds</h2>
            <button onClick={addRow} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors print:hidden">
              <Plus className="h-3.5 w-3.5" /> Add Rider
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
                    <Th rowSpan={2} className="w-16 text-center align-bottom">Rider No.</Th>
                    <Th rowSpan={2} className="w-40 align-bottom">Name</Th>
                    <Th rowSpan={2} className="w-40 align-bottom">Horse</Th>
                    <Th colSpan={obstacleNos.length} className="text-center">Showjumping Obstacle Numbers</Th>
                    <Th rowSpan={2} className="w-20 text-center align-bottom">Jumping<br />Faults</Th>
                    <Th rowSpan={2} className="w-20 text-center align-bottom">Jumping<br />Time</Th>
                    <Th rowSpan={2} className="w-20 text-center align-bottom">Time<br />Faults</Th>
                    <Th rowSpan={2} className="w-20 text-center align-bottom">Total<br />Faults</Th>
                    <Th rowSpan={2} className="w-10 print:hidden"></Th>
                  </tr>
                  <tr className="bg-muted text-[10px] text-muted-foreground">
                    {obstacleNos.map((n) => (
                      <th key={n} className="px-1 py-1.5 text-center font-medium border-l border-border w-10">{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const jf = obstacleFaults(row);
                    const tot = totalFaults(row);
                    return (
                      <tr key={row.id} className={`border-t border-border ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                        <td className="px-1 py-1.5">
                          <Cell value={row.riderNo} onChange={(v) => updateRow(row.id, { riderNo: v })} center />
                        </td>
                        <td className="px-1 py-1.5">
                          <Cell value={row.name} onChange={(v) => updateRow(row.id, { name: v })} />
                        </td>
                        <td className="px-1 py-1.5">
                          <Cell value={row.horse} onChange={(v) => updateRow(row.id, { horse: v })} />
                        </td>
                        {row.obstacles.map((o, idx) => (
                          <td key={idx} className="px-0.5 py-1.5 border-l border-border">
                            <Cell value={o} onChange={(v) => updateObstacle(row.id, idx, v)} center narrow boxed={false} />
                          </td>
                        ))}
                        <td className="px-1 py-1.5">
                          <div className="rounded-md border border-border py-1 text-center font-display tabular-nums text-highlight">{jf > 0 ? jf : "—"}</div>
                        </td>
                        <td className="px-1 py-1.5">
                          <Cell value={row.jumpingTime} onChange={(v) => updateRow(row.id, { jumpingTime: v })} center placeholder="mm:ss" />
                        </td>
                        <td className="px-1 py-1.5">
                          <Cell value={row.timeFaults} onChange={(v) => updateRow(row.id, { timeFaults: v })} center />
                        </td>
                        <td className="px-1 py-1.5">
                          <div className="rounded-md border border-border py-1 text-center font-display tabular-nums text-highlight">{tot > 0 ? tot : "—"}</div>
                        </td>
                        <td className="px-1 py-1.5 text-center print:hidden">
                          <button onClick={() => removeRow(row.id)} className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" aria-label="Remove row">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Course Designer</div>
            <div className="text-sm">{meta.courseDesigner || "—"}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Signature of Judge</div>
            <div className="border-b border-dashed border-border h-16" />
            <div className="text-xs text-muted-foreground mt-2 italic">{meta.judge || "—"}</div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground print:hidden">
        {config.label} · {config.appendix} · Interactive Scoring Sheet
      </footer>
    </div>
  );
}

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-border focus:border-highlight outline-none py-1.5 text-sm transition-colors"
    />
  </label>
);

const Th = ({
  children,
  className = "",
  colSpan,
  rowSpan,
}: { children?: React.ReactNode; className?: string; colSpan?: number; rowSpan?: number }) => (
  <th colSpan={colSpan} rowSpan={rowSpan} className={`px-3 py-2 text-left font-medium ${className}`}>{children}</th>
);

const Cell = ({
  value,
  onChange,
  center,
  narrow,
  placeholder,
  boxed = true,
}: { value: string; onChange: (v: string) => void; center?: boolean; narrow?: boolean; placeholder?: string; boxed?: boolean }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`bg-transparent outline-none text-sm py-1 rounded-md transition-all focus:border-ring focus:bg-background ${
      boxed ? "border border-border" : "border border-transparent hover:border-border"
    } ${center ? "text-center" : "px-1.5"} ${narrow ? "w-10" : "w-full"}`}
  />
);
