import * as React from "react";
import { useMemo, useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";

const TEST_INFO: Record<string, { label: string; appendix: string; abbr: string }> = {
  "young-rider": { label: "Young Rider", appendix: "Appendix A", abbr: "YR" },
  "junior": { label: "Junior", appendix: "Appendix C", abbr: "JR" },
  "children-i": { label: "Children I", appendix: "Appendix D", abbr: "C1" },
  "children-ii": { label: "Children II", appendix: "Appendix E", abbr: "C2" },
};

type Movement = {
  no: string;
  letters: string;
  test: string;
  coefficient: number;
  directive: string;
};

const MOVEMENTS: Movement[] = [
  { no: "1", letters: "A\nX", test: "Enter in collected canter\nHalf-immobility – salute\nProceed in collected trot", coefficient: 1, directive: "The entry. The halt and the transitions from the canter to the halt and from the halt to the trot." },
  { no: "2", letters: "C\nR", test: "Track right\nVolte right 8 m", coefficient: 1, directive: "The collection. The bend. The regularity and the balance." },
  { no: "3", letters: "R P", test: "Shoulder-in right", coefficient: 1, directive: "The angle and bend of the horse. The collection. The regularity." },
  { no: "4", letters: "P L\nL R", test: "Half-volte right 10 m\nHalf-pass right", coefficient: 1, directive: "The correctness and regularity. The carriage and bend. The balance. The collection." },
  { no: "5", letters: "M\nG\nH", test: "Turn left\nHalf-immobility 5 seconds\nProceed in collected trot\nTurn left", coefficient: 1, directive: "The halt, the immobility and transitions." },
  { no: "6", letters: "S", test: "Volte left 8 m", coefficient: 1, directive: "The collection. The bend. The regularity and the balance." },
  { no: "7", letters: "S V", test: "Shoulder-in left", coefficient: 1, directive: "The angle and bend of the horse. The collection. The regularity." },
  { no: "8", letters: "V L\nL S\nS H C M", test: "Half-volte left 10 m\nHalf-pass left\nCollected trot", coefficient: 1, directive: "The correctness and regularity. The carriage and bend. The balance. The collection." },
  { no: "9", letters: "M X K\nK", test: "Medium trot\nCollected trot", coefficient: 1, directive: "The lengthening and regularity of the steps. The balance. The transitions." },
  { no: "10", letters: "A", test: "Halt – rein back 5 steps\nImmediately proceed in collected trot", coefficient: 1, directive: "The halt. The rein back. The transitions." },
  { no: "11", letters: "F X H\nH", test: "Extended trot\nCollected trot", coefficient: 1, directive: "The lengthening of the frame. The extension and regularity of the steps. The transitions." },
  { no: "12", letters: "C\nBefore M\nM\nM C H", test: "Medium walk\nShorten the steps\nHalf pirouette right\nMedium walk", coefficient: 1, directive: "The shortening of the steps. The regularity of the half pirouette." },
  { no: "13", letters: "Before H\nH", test: "Shorten the steps\nHalf pirouette left", coefficient: 1, directive: "The regularity of the half pirouette." },
  { no: "14", letters: "", test: "Medium walk (C M C H)", coefficient: 1, directive: "The lengthening and regularity of the steps." },
  { no: "15", letters: "H C M\nM V", test: "Change rein in extended walk", coefficient: 1, directive: "The lengthening of the frame and of the step. The regularity." },
  { no: "16", letters: "V\nK\nK A F", test: "Medium walk\nProceed in collected canter left\nCollected canter", coefficient: 1, directive: "The transition. The collection. The balance." },
  { no: "17", letters: "F M\nM", test: "Medium canter\nCollected canter", coefficient: 1, directive: "The lengthening. The transitions." },
  { no: "18", letters: "S I\nI\nI R", test: "Half-volte left 10 m\nSimple change of leg\nHalf-volte right 10 m", coefficient: 1, directive: "The transitions from canter to walk and from walk to canter." },
  { no: "19", letters: "R X V\nV A", test: "Change rein in collected canter\nCounter canter", coefficient: 1, directive: "The balance. The counter canter." },
  { no: "20", letters: "A", test: "Flying change of leg", coefficient: 1, directive: "The flying change of leg." },
  { no: "21", letters: "P X S\nS C", test: "Change rein in collected trot\nCounter canter", coefficient: 1, directive: "The balance. The counter canter." },
  { no: "22", letters: "C", test: "Flying change of leg", coefficient: 1, directive: "The flying change of leg." },
  { no: "23", letters: "M F\nF A K V", test: "Medium canter\nCollected canter", coefficient: 1, directive: "The lengthening. The transition." },
  { no: "24", letters: "V L\nL\nL P", test: "Half-volte right 10 m\nSimple change of leg\nHalf-volte left 10 m", coefficient: 1, directive: "The transition from canter to walk and from walk to canter." },
  { no: "25", letters: "P M C", test: "Collected canter", coefficient: 1, directive: "The collection. The straightness." },
  { no: "26", letters: "C\nH X F\nF", test: "Collected trot\nExtended trot\nCollected trot", coefficient: 1, directive: "The lengthening of the frame and regularity of the steps. The balance. The transitions." },
  { no: "27", letters: "A\nX", test: "Down the centre line\nHalt – immobility – salute", coefficient: 1, directive: "The straightness, the transitions and the halt." },
];

const COLLECTIVE_COEF = 2;
const TOTAL_MAX = 270;
const GRAND_TOTAL_MAX = 290;

const COURSE_ERRORS = [
  { label: "No error", value: 0 },
  { label: "1st error · −0.5%", value: 0.5 },
  { label: "2nd error · −1%", value: 1 },
  { label: "3rd error · Elimination", value: -1 },
];

const Index = () => {
  const { testId = "young-rider" } = useParams<{ testId: string }>();
  const info = TEST_INFO[testId] ?? TEST_INFO["young-rider"];
  const STORAGE_KEY = `scoring-draft-v1:${testId}`;
  const [meta, setMeta] = useState({
    event: "",
    date: "",
    judge: "",
    position: "",
    competitorNo: "",
    name: "",
    horse: "",
  });

  const [scores, setScores] = useState<Record<string, string>>({});
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [coefficients, setCoefficients] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [collective, setCollective] = useState<string>("");
  const [collectiveCorrection, setCollectiveCorrection] = useState<string>("");
  const [collectiveRemarks, setCollectiveRemarks] = useState<string>("");
  const [courseError, setCourseError] = useState<number>(0);
  const [otherErrors, setOtherErrors] = useState<number>(0);
  const [organisers, setOrganisers] = useState<string>("");

  const getEffective = (raw: string, correction: string) => {
    const c = parseFloat(correction);
    if (!isNaN(c)) return c;
    const r = parseFloat(raw);
    return isNaN(r) ? 0 : r;
  };

  const getCoef = (m: Movement) => {
    const c = parseFloat(coefficients[m.no] ?? "");
    return isNaN(c) ? m.coefficient : c;
  };

  const finalMarks = useMemo(() => {
    const map: Record<string, number> = {};
    MOVEMENTS.forEach((m) => {
      map[m.no] = getEffective(scores[m.no] || "", corrections[m.no] || "") * getCoef(m);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores, corrections, coefficients]);

  const filledCount = useMemo(
    () => MOVEMENTS.filter((m) => (scores[m.no] || corrections[m.no] || "").toString().trim() !== "").length,
    [scores, corrections]
  );

  const movementsTotal = useMemo(
    () => Object.values(finalMarks).reduce((a, b) => a + b, 0),
    [finalMarks]
  );

  const collectiveFinal = useMemo(() => {
    const c = parseFloat(collectiveCorrection);
    const base = !isNaN(c) ? c : parseFloat(collective);
    return (isNaN(base) ? 0 : base) * COLLECTIVE_COEF;
  }, [collective, collectiveCorrection]);

  const grandTotal = movementsTotal + collectiveFinal;
  const eliminated = courseError === -1;

  const percentage = useMemo(() => {
    if (eliminated) return 0;
    const pct = (grandTotal / GRAND_TOTAL_MAX) * 100;
    return Math.max(0, pct - courseError - otherErrors * 2);
  }, [grandTotal, courseError, otherErrors, eliminated]);

  const handleScore = (no: string, val: string) => {
    if (val !== "" && (parseFloat(val) < 0 || parseFloat(val) > 10)) return;
    setScores((s) => ({ ...s, [no]: val }));
  };
  const handleCorrection = (no: string, val: string) => {
    if (val !== "" && (parseFloat(val) < 0 || parseFloat(val) > 10)) return;
    setCorrections((s) => ({ ...s, [no]: val }));
  };

  const reset = () => {
    if (!confirm("Reset all scores and entries?")) return;
    setScores({});
    setCorrections({});
    setCoefficients({});
    setRemarks({});
    setCollective("");
    setCollectiveCorrection("");
    setCollectiveRemarks("");
    setCourseError(0);
    setOtherErrors(0);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setHasDraft(false);
    setSavedAt(null);
  };

  const progressPct = (filledCount / MOVEMENTS.length) * 100;

  /* ---------- autosave ---------- */
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHasDraft(true);
    } catch {}
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const payload = {
      meta, scores, corrections, coefficients, remarks,
      collective, collectiveCorrection, collectiveRemarks,
      courseError, otherErrors, organisers,
      ts: Date.now(),
    };
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setSavedAt(Date.now());
        setHasDraft(true);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [meta, scores, corrections, coefficients, remarks, collective, collectiveCorrection, collectiveRemarks, courseError, otherErrors, organisers]);

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      setMeta(d.meta ?? meta);
      setScores(d.scores ?? {});
      setCorrections(d.corrections ?? {});
      setCoefficients(d.coefficients ?? {});
      setRemarks(d.remarks ?? {});
      setCollective(d.collective ?? "");
      setCollectiveCorrection(d.collectiveCorrection ?? "");
      setCollectiveRemarks(d.collectiveRemarks ?? "");
      setCourseError(d.courseError ?? 0);
      setOtherErrors(d.otherErrors ?? 0);
      setOrganisers(d.organisers ?? "");
    } catch {}
  };

  /* ---------- keyboard nav for score inputs ---------- */
  const handleGridKey = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const row = parseInt(target.dataset.row || "0", 10);
    const col = parseInt(target.dataset.col || "0", 10); // 0 = mark, 1 = correction
    const move = (r: number, c: number) => {
      const sel = document.querySelector<HTMLInputElement>(`input[data-grid="1"][data-row="${r}"][data-col="${c}"]`);
      if (sel) { e.preventDefault(); sel.focus(); sel.select(); }
    };
    if (e.key === "ArrowDown" || e.key === "Enter") move(row + 1, col);
    else if (e.key === "ArrowUp") move(row - 1, col);
    else if (e.key === "ArrowRight" && (target.selectionStart ?? 0) >= target.value.length) move(row, col + 1);
    else if (e.key === "ArrowLeft" && (target.selectionStart ?? 0) === 0) move(row, col - 1);
    else if ((e.key === "n" || e.key === "N") && (e.metaKey || e.ctrlKey)) {
      // Cmd/Ctrl+N → next empty mark
      const next = MOVEMENTS.findIndex((m, i) => i > row && !(scores[m.no] || corrections[m.no]));
      if (next >= 0) move(next, 0);
    }
  }, [scores, corrections]);

  const jumpToNextEmpty = () => {
    const idx = MOVEMENTS.findIndex((m) => !(scores[m.no] || corrections[m.no]));
    if (idx >= 0) {
      const sel = document.querySelector<HTMLInputElement>(`input[data-grid="1"][data-row="${idx}"][data-col="0"]`);
      sel?.focus(); sel?.select();
    }
  };

  /* ---------- export / print ---------- */
  const exportPdf = () => {
    const safe = (s: string) => s.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "untitled";
    const fname = `${testId}_${safe(meta.event || "event")}_${safe(meta.date || "date")}`;
    const prev = document.title;
    document.title = fname;
    window.print();
    setTimeout(() => { document.title = prev; }, 1000);
  };

  const savedLabel = savedAt
    ? `Saved · ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Not saved yet";


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-[1200px] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mr-1"
              aria-label="Back to tests"
              title="Back to tests"
            >
              ←
            </Link>
            <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-display font-semibold">
              {info.abbr}
            </div>
            <div>
              <div className="font-display text-lg leading-tight">{info.label}</div>
              <div className="text-xs text-muted-foreground tracking-wide uppercase">{info.appendix} · Scoring</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={savedLabel}>
              <span className={`h-1.5 w-1.5 rounded-full ${savedAt ? "bg-highlight" : "bg-muted-foreground/40"}`} />
              <span className="tabular-nums">{savedLabel}</span>
            </div>
            <div className="text-right ml-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current</div>
              <div className="font-display text-2xl tabular-nums">
                {eliminated ? (
                  <span className="text-destructive text-base">Eliminated</span>
                ) : (
                  <>
                    <span className="text-highlight">{percentage.toFixed(3)}</span>
                    <span className="text-muted-foreground text-base">%</span>
                  </>
                )}
              </div>
            </div>
            {hasDraft && (
              <button
                onClick={loadDraft}
                className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                title="Load last saved draft"
              >
                Load draft
              </button>
            )}
            <button
              onClick={reset}
              className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
            >
              Reset
            </button>
            <button
              onClick={exportPdf}
              className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Export PDF
            </button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-highlight transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-8 print:px-4 print:py-2">
        {/* Hero / Meta card */}
        <section className="mb-8 print:mb-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">FEI · Dressage Test</div>
              <h1 className="font-display text-4xl md:text-5xl tracking-tight">
                {info.label} <span className="italic text-highlight">scoring</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Time 6′30″ · Minimum age of horse: 6 years
              </p>
            </div>
            <div className="hidden lg:block text-right">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Movements</div>
              <div className="font-display text-3xl tabular-nums">
                {filledCount}<span className="text-muted-foreground">/{MOVEMENTS.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="Event" value={meta.event} onChange={(v) => setMeta({ ...meta, event: v })} />
              <Field label="Date" value={meta.date} onChange={(v) => setMeta({ ...meta, date: v })} />
              <Field label="Judge" value={meta.judge} onChange={(v) => setMeta({ ...meta, judge: v })} />
              <Field label="Competitor No." value={meta.competitorNo} onChange={(v) => setMeta({ ...meta, competitorNo: v })} />
              <Field label="Rider" value={meta.name} onChange={(v) => setMeta({ ...meta, name: v })} />
              <Field label="Horse" value={meta.horse} onChange={(v) => setMeta({ ...meta, horse: v })} />
              <Field label="Position" value={meta.position} onChange={(v) => setMeta({ ...meta, position: v })} />
            </div>
          </div>
        </section>

        {/* Movements */}
        <section className="mb-8 print:mb-4">
          <div className="flex items-end justify-between mb-3 px-1">
            <SectionTitle index="01" title="Movements" subtitle="Score 0–10 · ↑↓ move rows · → jump field · Enter next" />
            <button
              onClick={jumpToNextEmpty}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors print:hidden"
            >
              Jump to next empty ↵
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto max-h-[70vh] print:max-h-none print:overflow-visible">
              <table className="w-full text-sm table-fixed">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground shadow-soft">
                    <Th className="w-12 text-center">No.</Th>
                    <Th className="w-20 text-center">Letters</Th>
                    <Th className="w-auto">Test</Th>
                    <Th className="w-20 text-center">Mark</Th>
                    <Th className="w-20 text-center">Correction</Th>
                    <Th className="w-16 text-center">Coeff.</Th>
                    <Th className="w-20 text-center">Final</Th>
                    <Th className="w-[26%]">Directive Ideas</Th>
                    <Th className="w-44">Remarks</Th>
                  </tr>
                </thead>
                <tbody>
                  {MOVEMENTS.map((m, i) => {
                    const final = finalMarks[m.no];
                    const hasValue = final > 0;
                    return (
                      <tr
                        key={m.no}
                        className={`border-t border-border transition-colors ${
                          i % 2 === 0 ? "bg-background" : "bg-muted/20"
                        } hover:bg-accent/40 focus-within:bg-accent/60`}
                      >
                        <td className="px-3 py-3 text-center">
                          <span className="inline-grid place-items-center h-7 w-7 rounded-full border border-border font-display text-xs tabular-nums">
                            {m.no}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-xs whitespace-pre-line text-muted-foreground">
                          {m.letters}
                        </td>
                        <td className="px-3 py-3 whitespace-pre-line leading-snug">{m.test}</td>
                        <td className="px-1 py-2">
                          <NumInput
                            value={scores[m.no] || ""}
                            onChange={(v) => handleScore(m.no, v)}
                            placeholder="—"
                            accent
                            data-grid="1"
                            data-row={i}
                            data-col={0}
                            onKeyDown={handleGridKey}
                          />
                        </td>
                        <td className="px-1 py-2">
                          <NumInput
                            value={corrections[m.no] || ""}
                            onChange={(v) => handleCorrection(m.no, v)}
                            placeholder="—"
                            data-grid="1"
                            data-row={i}
                            data-col={1}
                            onKeyDown={handleGridKey}
                          />
                        </td>
                        <td className="px-1 py-2">
                          <NumInput
                            value={coefficients[m.no] ?? ""}
                            onChange={(v) => {
                              if (v !== "" && (parseFloat(v) < 1 || parseFloat(v) > 10)) return;
                              setCoefficients((c) => ({ ...c, [m.no]: v }));
                            }}
                            placeholder="—"
                            min={1}
                            step={1}
                          />
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`font-display tabular-nums text-base ${
                              hasValue ? "text-highlight" : "text-muted-foreground/40"
                            }`}
                          >
                            {hasValue ? final.toFixed(1) : "—"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs leading-snug text-muted-foreground">
                          {m.directive}
                        </td>
                        <td className="px-1 py-2">
                          <input
                            className="w-full bg-transparent rounded-md px-2 py-1.5 text-xs outline-none focus:bg-background focus:ring-1 focus:ring-ring transition-all"
                            value={remarks[m.no] || ""}
                            onChange={(e) => setRemarks((r) => ({ ...r, [m.no]: e.target.value }))}
                          />
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-foreground/20 bg-muted/40">
                    <td colSpan={3} className="px-3 py-3 font-display text-sm uppercase tracking-wider">
                      Subtotal
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-muted-foreground tabular-nums">/ {TOTAL_MAX}</td>
                    <td colSpan={2}></td>
                    <td className="px-3 py-3 text-center font-display text-lg tabular-nums text-highlight">
                      {movementsTotal.toFixed(1)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Collective */}
        <section className="mb-8 print:mb-4">
          <SectionTitle index="02" title="Collective Mark" subtitle="Rider position, seat & effect of aids" />

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="px-3 py-4 w-12 text-center">
                    <span className="inline-grid place-items-center h-7 w-7 rounded-full border border-border font-display text-xs">1</span>
                  </td>
                  <td className="px-3 py-4">
                    Rider's position and seat; correctness and effect of the aids
                  </td>
                  <td className="px-1 py-2 w-24">
                    <NumInput value={collective} onChange={setCollective} placeholder="Mark" accent />
                  </td>
                  <td className="px-1 py-2 w-24">
                    <NumInput value={collectiveCorrection} onChange={setCollectiveCorrection} placeholder="Corr." />
                  </td>
                  <td className="px-3 py-4 w-16 text-center text-muted-foreground text-xs">×{COLLECTIVE_COEF}</td>
                  <td className="px-3 py-4 w-24 text-center font-display text-lg text-highlight tabular-nums">
                    {collectiveFinal ? collectiveFinal.toFixed(1) : "—"}
                  </td>
                  <td className="px-1 py-2 w-44">
                    <input
                      className="w-full bg-transparent rounded-md px-2 py-1.5 text-xs outline-none focus:bg-background focus:ring-1 focus:ring-ring transition-all"
                      placeholder="Remarks"
                      value={collectiveRemarks}
                      onChange={(e) => setCollectiveRemarks(e.target.value)}
                    />
                  </td>
                </tr>
                <tr className="border-t-2 border-foreground/20 bg-muted/40">
                  <td colSpan={2} className="px-3 py-3 font-display text-sm uppercase tracking-wider">Total</td>
                  <td colSpan={2} className="px-3 py-3 text-center text-xs text-muted-foreground tabular-nums">/ {GRAND_TOTAL_MAX}</td>
                  <td></td>
                  <td className="px-3 py-3 text-center font-display text-lg text-highlight tabular-nums">
                    {grandTotal.toFixed(1)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Penalties + Score */}
        <section className="mb-8 print:mb-4">
          <SectionTitle index="03" title="Penalties & Final Score" />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6 shadow-soft">
              <h3 className="font-display text-lg mb-4">Deductions</h3>
              <ul className="text-xs text-muted-foreground space-y-1 mb-5 leading-relaxed">
                <li>• 1st course error = −0.5 percentage point</li>
                <li>• 2nd course error = −1 percentage point</li>
                <li>• 3rd course error = Elimination</li>
                <li>• Other errors = −2 points each</li>
              </ul>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Course error
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {COURSE_ERRORS.map((c) => (
                      <button
                        key={c.label}
                        onClick={() => setCourseError(c.value)}
                        className={`text-xs px-3 py-2 rounded-md border transition-all ${
                          courseError === c.value
                            ? c.value === -1
                              ? "bg-destructive text-destructive-foreground border-destructive"
                              : "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-foreground/30 bg-background"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Other errors
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOtherErrors(Math.max(0, otherErrors - 1))}
                      className="h-9 w-9 rounded-md border border-border hover:bg-muted transition-colors"
                      aria-label="Decrease"
                    >
                      −
                    </button>
                    <div className="font-display text-2xl tabular-nums w-12 text-center">{otherErrors}</div>
                    <button
                      onClick={() => setOtherErrors(otherErrors + 1)}
                      className="h-9 w-9 rounded-md border border-border hover:bg-muted transition-colors"
                      aria-label="Increase"
                    >
                      +
                    </button>
                    <span className="text-xs text-muted-foreground">× −2 pts = −{(otherErrors * 2).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score card */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-xl p-6 shadow-card h-full flex flex-col justify-between">
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-highlight/20 blur-2xl" />
                <div className="relative">
                  <div className="text-[10px] uppercase tracking-[0.25em] opacity-70">Total Score</div>
                  <div className="font-display text-6xl mt-3 tabular-nums leading-none">
                    {eliminated ? (
                      <span className="text-destructive-foreground">—</span>
                    ) : (
                      <>
                        {percentage.toFixed(3)}
                        <span className="text-2xl opacity-60 align-top ml-1">%</span>
                      </>
                    )}
                  </div>
                  {eliminated && (
                    <div className="mt-3 inline-block px-2 py-1 bg-destructive text-destructive-foreground text-xs uppercase tracking-wider rounded">
                      Eliminated
                    </div>
                  )}
                </div>
                <div className="relative mt-6 pt-4 border-t border-primary-foreground/20 text-xs opacity-70 grid grid-cols-2 gap-2">
                  <div>
                    <div className="opacity-70">Raw total</div>
                    <div className="font-display text-base tabular-nums opacity-100 mt-0.5">
                      {grandTotal.toFixed(1)} <span className="opacity-50">/ {GRAND_TOTAL_MAX}</span>
                    </div>
                  </div>
                  <div>
                    <div className="opacity-70">Deductions</div>
                    <div className="font-display text-base tabular-nums opacity-100 mt-0.5">
                      −{(courseError === -1 ? 0 : courseError + otherErrors * 2).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer / signatures */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Organisers</div>
            <textarea
              rows={3}
              placeholder="Exact address…"
              className="w-full bg-transparent outline-none resize-none text-sm focus:ring-1 focus:ring-ring rounded-md p-2 -m-2"
              value={organisers}
              onChange={(e) => setOrganisers(e.target.value)}
            />
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Signature of Judge</div>
            <div className="border-b border-dashed border-border h-16" />
            <div className="text-xs text-muted-foreground mt-2 italic">
              {meta.judge ? meta.judge : "—"}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground print:hidden">
        FEI Young Rider · Appendix A · Interactive Scoring Sheet
      </footer>
    </div>
  );
};

/* ---------- small components ---------- */

const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">
      {label}
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-border focus:border-highlight outline-none py-1.5 text-sm transition-colors"
    />
  </label>
);

const SectionTitle = ({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-end justify-between mb-3 px-1">
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs text-muted-foreground tabular-nums">{index}</span>
      <h2 className="font-display text-xl tracking-tight">{title}</h2>
    </div>
    {subtitle && <span className="text-xs text-muted-foreground hidden md:block">{subtitle}</span>}
  </div>
);

const Th = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <th className={`px-3 py-3 text-left font-medium ${className}`}>{children}</th>
);

type NumInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  accent?: boolean;
  min?: number;
  step?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "min" | "step" | "placeholder">;

const NumInput = ({
  value,
  onChange,
  placeholder,
  accent = false,
  min = 0,
  step = 0.5,
  className,
  ...rest
}: NumInputProps) => (
  <input
    type="number"
    inputMode="decimal"
    min={min}
    max={10}
    step={step}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full text-center tabular-nums rounded-md py-1.5 text-sm outline-none transition-all bg-transparent border ${
      accent
        ? "border-border focus:border-highlight focus:bg-background focus:ring-2 focus:ring-highlight/20"
        : "border-transparent hover:border-border focus:border-ring focus:bg-background"
    } ${className ?? ""}`}
    {...rest}
  />
);

export default Index;
