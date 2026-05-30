"use client";

import * as React from "react";
import { useMemo, useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type Rider, DUMMY_RIDERS } from "@/lib/dummy-data";
import { useAuth } from "@/contexts/AuthContext";
import { TEST_CONFIGS, COURSE_ERRORS, type Movement, type CollectiveCriteria } from "@/lib/tests";

export default function ScoringPage() {
  const params = useParams();
  const { user } = useAuth();
  const testId = (params?.testId as string) ?? "young-rider";
  const config = TEST_CONFIGS[testId] ?? TEST_CONFIGS["young-rider"];
  const info = config;
  const MOVEMENTS = config.movements;
  const TOTAL_MAX = MOVEMENTS.reduce((sum, m) => sum + 10 * m.coefficient, 0);
  const COLLECTIVES: CollectiveCriteria[] = config.collectives ?? [
    { no: "1", label: "Rider's position and seat; correctness and effect of the aids", coefficient: 2 },
  ];
  const collectivesMax = COLLECTIVES.reduce((sum, c) => sum + 10 * c.coefficient, 0);
  const GRAND_TOTAL_MAX = config.hasCollective !== false ? TOTAL_MAX + collectivesMax : TOTAL_MAX;
  const OTHER_ERROR_PENALTY = config.otherErrorPenalty ?? 2;
  const STORAGE_KEY = `scoring-draft-v1:${testId}`;
  const EFFECTIVE_COURSE_ERRORS = config.courseErrors ?? COURSE_ERRORS;

  const ARTISTIC_MOVEMENTS = config.artisticMovements ?? [];
  const ARTISTIC_MAX = ARTISTIC_MOVEMENTS.reduce((sum, m) => sum + 10 * m.coefficient, 0);
  const isFreestyle = ARTISTIC_MOVEMENTS.length > 0;

  const [meta, setMeta] = useState({
    event: "",
    date: "",
    judge: "",
    position: "",
    competitorNo: "",
    name: "",
    nf: "",
    horse: "",
    hno: "",
  });

  const [scores, setScores] = useState<Record<string, string>>({});
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [coefficients, setCoefficients] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [collectiveScores, setCollectiveScores] = useState<Record<string, string>>({});
  const [collectiveCorrections, setCollectiveCorrections] = useState<Record<string, string>>({});
  const [collectiveRemarksMap, setCollectiveRemarksMap] = useState<Record<string, string>>({});
  const [artisticScores, setArtisticScores] = useState<Record<string, string>>({});
  const [artisticCorrections, setArtisticCorrections] = useState<Record<string, string>>({});
  const [courseError, setCourseError] = useState<number>(0);
  const [otherErrors, setOtherErrors] = useState<number>(0);
  const [organisers, setOrganisers] = useState<string>("");
  const [technicalScore, setTechnicalScore] = useState<string>("");

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveRiderId, setSaveRiderId] = useState("_meta");
  const [saveStatus, setSaveStatus] = useState<"submitted" | "draft">("submitted");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [allRidersList, setAllRidersList] = useState<Rider[]>([]);

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

  const artisticFinalMarks = useMemo(() => {
    const map: Record<string, number> = {};
    ARTISTIC_MOVEMENTS.forEach((m) => {
      const eff = getEffective(artisticScores[m.no] || "", artisticCorrections[m.no] || "");
      map[m.no] = eff * m.coefficient;
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artisticScores, artisticCorrections]);

  const artisticTotal = useMemo(
    () => Object.values(artisticFinalMarks).reduce((a, b) => a + b, 0),
    [artisticFinalMarks]
  );

  const filledCount = useMemo(() => {
    const techFilled = MOVEMENTS.filter((m) => (scores[m.no] || corrections[m.no] || "").toString().trim() !== "").length;
    const artFilled = ARTISTIC_MOVEMENTS.filter((m) => (artisticScores[m.no] || artisticCorrections[m.no] || "").toString().trim() !== "").length;
    return techFilled + artFilled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores, corrections, artisticScores, artisticCorrections]);

  const movementsTotal = useMemo(
    () => Object.values(finalMarks).reduce((a, b) => a + b, 0),
    [finalMarks]
  );

  const collectiveFinal = useMemo(() => {
    return COLLECTIVES.reduce((sum, c) => {
      const corr = parseFloat(collectiveCorrections[c.no] ?? "");
      const score = parseFloat(collectiveScores[c.no] ?? "");
      const base = !isNaN(corr) ? corr : isNaN(score) ? 0 : score;
      return sum + base * c.coefficient;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectiveScores, collectiveCorrections]);

  const grandTotal = movementsTotal + collectiveFinal;
  const eliminated = courseError === -1;

  const qualityPct = useMemo(() => {
    if (eliminated) return 0;
    return (grandTotal / GRAND_TOTAL_MAX) * 100;
  }, [grandTotal, GRAND_TOTAL_MAX, eliminated]);

  const percentage = useMemo(() => {
    if (eliminated) return 0;
    let base: number;
    if (isFreestyle) {
      const techPct = TOTAL_MAX > 0 ? (movementsTotal / TOTAL_MAX) * 100 : 0;
      const artPct  = ARTISTIC_MAX > 0 ? (artisticTotal / ARTISTIC_MAX) * 100 : 0;
      base = (techPct + artPct) / 2;
    } else {
      const techNum = parseFloat(technicalScore);
      base = config.technicalCombined && !isNaN(techNum)
        ? (techNum + qualityPct) / 2
        : qualityPct;
    }
    return Math.max(0, base - courseError - otherErrors * OTHER_ERROR_PENALTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qualityPct, courseError, otherErrors, eliminated, technicalScore, config.technicalCombined, isFreestyle, movementsTotal, artisticTotal, TOTAL_MAX, ARTISTIC_MAX]);

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
    setCollectiveScores({});
    setCollectiveCorrections({});
    setCollectiveRemarksMap({});
    setArtisticScores({});
    setArtisticCorrections({});
    setCourseError(0);
    setOtherErrors(0);
    setTechnicalScore("");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setHasDraft(false);
    setSavedAt(null);
  };

  const totalMovementCount = MOVEMENTS.length + ARTISTIC_MOVEMENTS.length;
  const progressPct = totalMovementCount > 0 ? (filledCount / totalMovementCount) * 100 : 0;

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
    setAllRidersList(DUMMY_RIDERS);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const payload = {
      meta, scores, corrections, coefficients, remarks,
      collectiveScores, collectiveCorrections, collectiveRemarksMap,
      artisticScores, artisticCorrections,
      courseError, otherErrors, organisers, technicalScore,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta, scores, corrections, coefficients, remarks, collectiveScores, collectiveCorrections, collectiveRemarksMap, artisticScores, artisticCorrections, courseError, otherErrors, organisers, technicalScore]);

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
      if (d.collectiveScores !== undefined) {
        setCollectiveScores(d.collectiveScores ?? {});
        setCollectiveCorrections(d.collectiveCorrections ?? {});
        setCollectiveRemarksMap(d.collectiveRemarksMap ?? {});
      } else if (d.collective !== undefined) {
        setCollectiveScores({ "1": d.collective });
        setCollectiveCorrections({ "1": d.collectiveCorrection ?? "" });
        setCollectiveRemarksMap({ "1": d.collectiveRemarks ?? "" });
      }
      setCourseError(d.courseError ?? 0);
      setOtherErrors(d.otherErrors ?? 0);
      setOrganisers(d.organisers ?? "");
      setTechnicalScore(d.technicalScore ?? "");
      setArtisticScores(d.artisticScores ?? {});
      setArtisticCorrections(d.artisticCorrections ?? {});
    } catch {}
  };

  /* ---------- keyboard nav for score inputs ---------- */
  const handleGridKey = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    const row = parseInt(target.dataset.row || "0", 10);
    const col = parseInt(target.dataset.col || "0", 10);
    const move = (r: number, c: number) => {
      const sel = document.querySelector<HTMLInputElement>(`input[data-grid="1"][data-row="${r}"][data-col="${c}"]`);
      if (sel) { e.preventDefault(); sel.focus(); sel.select(); }
    };
    if (e.key === "ArrowDown" || e.key === "Enter") move(row + 1, col);
    else if (e.key === "ArrowUp") move(row - 1, col);
    else if (e.key === "ArrowRight" && (target.selectionStart ?? 0) >= target.value.length) move(row, col + 1);
    else if (e.key === "ArrowLeft" && (target.selectionStart ?? 0) === 0) move(row, col - 1);
    else if ((e.key === "n" || e.key === "N") && (e.metaKey || e.ctrlKey)) {
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

  const openSaveModal = () => {
    setSaveRiderId("_meta");
    setSaveStatus("submitted");
    setShowSaveModal(true);
  };

  const handleSaveScore = () => {
    const riderId = saveRiderId !== "_meta" ? saveRiderId : null;
    const session = {
      id: `session-${Date.now()}`,
      riderId,
      testId,
      judgeId: user?.id ?? null,
      scores,
      corrections,
      collectiveScores,
      percentage: eliminated ? 0 : parseFloat(percentage.toFixed(3)),
      status: saveStatus,
      savedAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem("saved-sessions") ?? "[]");
      localStorage.setItem("saved-sessions", JSON.stringify([...existing, session]));
    } catch {}
    setShowSaveModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md print:hidden">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to tests"
              title="Back to tests"
            >
              ←
            </Link>
            <div className="h-8 w-8 shrink-0 rounded-md bg-primary text-primary-foreground grid place-items-center font-display font-semibold text-sm">
              {info.abbr}
            </div>
            <div className="min-w-0">
              <div className="font-display text-base sm:text-lg leading-tight truncate">{info.label}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground tracking-wide uppercase truncate">
                {info.appendix} · Scoring
              </div>
            </div>
          </div>

          {/* Mobile: compact percentage */}
          <div className="md:hidden font-display text-lg tabular-nums shrink-0">
            {eliminated ? (
              <span className="text-destructive text-sm">Elim.</span>
            ) : (
              <>
                <span className="text-highlight">{percentage.toFixed(1)}</span>
                <span className="text-muted-foreground text-xs">%</span>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={savedLabel}>
              <span className={`h-1.5 w-1.5 rounded-full ${savedAt ? "bg-highlight" : "bg-muted-foreground/40"}`} />
              <span className="tabular-nums hidden lg:inline">{savedLabel}</span>
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
              onClick={openSaveModal}
              className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                savedSuccess
                  ? "border-highlight bg-highlight/10 text-highlight"
                  : "border-highlight bg-highlight text-background hover:opacity-90"
              }`}
            >
              {savedSuccess ? "Saved ✓" : "Save Score"}
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

      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-6 sm:py-8 print:px-4 print:py-2">
        {/* Hero / Meta card */}
        <section className="mb-6 sm:mb-8 print:mb-4">
          <div className="flex items-start justify-between mb-4 gap-4">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">FEI · Dressage Test</div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.05]">
                {info.label} <span className="italic text-highlight">scoring</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-prose">
                {config.subtitle}
              </p>
            </div>
            <div className="hidden lg:block text-right shrink-0 pt-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Movements</div>
              <div className="font-display text-3xl tabular-nums mt-1 leading-none">
                {filledCount}<span className="text-muted-foreground">/{MOVEMENTS.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-soft">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="Event" value={meta.event} onChange={(v) => setMeta({ ...meta, event: v })} />
              <Field label="Date" value={meta.date} onChange={(v) => setMeta({ ...meta, date: v })} />
              <Field label="Judge" value={meta.judge} onChange={(v) => setMeta({ ...meta, judge: v })} />
              <Field label="Competitor No." value={meta.competitorNo} onChange={(v) => setMeta({ ...meta, competitorNo: v })} />
              <Field label="Rider" value={meta.name} onChange={(v) => setMeta({ ...meta, name: v })} />
              <Field label={config.nfLabel ?? "NF"} value={meta.nf} onChange={(v) => setMeta({ ...meta, nf: v })} />
              {config.showHno && (
                <Field label="H.No" value={meta.hno} onChange={(v) => setMeta({ ...meta, hno: v })} />
              )}
              <Field label="Horse" value={meta.horse} onChange={(v) => setMeta({ ...meta, horse: v })} />
              <Field label="Position" value={meta.position} onChange={(v) => setMeta({ ...meta, position: v })} />
            </div>
          </div>
        </section>

        {/* Movements */}
        <section className="mb-6 sm:mb-8 print:mb-4">
          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
            <SectionTitle index="01" title="Movements" subtitle="Score 0–10 · ↑↓ rows · → field · Enter next" />
            <button
              onClick={jumpToNextEmpty}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors print:hidden"
            >
              Jump to next empty ↵
            </button>
          </div>

          {/* Desktop / large-tablet table */}
          <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden shadow-soft">
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
                            bordered
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
                            bordered
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
                            className="w-full bg-transparent border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:bg-background focus:ring-1 focus:ring-ring transition-all"
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
                    <td colSpan={3}></td>
                    <td className="px-3 py-3 text-center font-display text-lg tabular-nums text-highlight whitespace-nowrap">
                      {movementsTotal.toFixed(1)}
                      <span className="text-xs text-muted-foreground ml-1">/ {TOTAL_MAX}</span>
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / tablet card list */}
          <div className="lg:hidden space-y-3">
            {MOVEMENTS.map((m, i) => {
              const final = finalMarks[m.no];
              const hasValue = final > 0;
              return (
                <div
                  key={m.no}
                  className="bg-card border border-border rounded-xl shadow-soft p-4 focus-within:border-highlight/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-grid place-items-center h-8 w-8 shrink-0 rounded-full border border-border font-display text-xs tabular-nums">
                        {m.no}
                      </span>
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground whitespace-pre-line">
                          {m.letters || "—"}
                        </div>
                        <div className="text-sm leading-snug whitespace-pre-line mt-0.5">{m.test}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final</div>
                      <div className={`font-display tabular-nums text-lg ${hasValue ? "text-highlight" : "text-muted-foreground/40"}`}>
                        {hasValue ? final.toFixed(1) : "—"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mark</span>
                      <NumInput
                        value={scores[m.no] || ""}
                        onChange={(v) => handleScore(m.no, v)}
                        placeholder="—"
                        accent
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Corr.</span>
                      <NumInput
                        value={corrections[m.no] || ""}
                        onChange={(v) => handleCorrection(m.no, v)}
                        placeholder="—"
                        bordered
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Coeff.</span>
                      <NumInput
                        value={coefficients[m.no] ?? ""}
                        onChange={(v) => {
                          if (v !== "" && (parseFloat(v) < 1 || parseFloat(v) > 10)) return;
                          setCoefficients((c) => ({ ...c, [m.no]: v }));
                        }}
                        placeholder={String(m.coefficient)}
                        bordered
                        min={1}
                        step={1}
                      />
                    </label>
                  </div>

                  <details className="group">
                    <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-muted-foreground list-none flex items-center gap-1 select-none">
                      <span className="group-open:rotate-90 transition-transform">›</span>
                      Directive & remarks
                    </summary>
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-muted-foreground leading-snug">{m.directive}</p>
                      <input
                        className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring transition-all"
                        placeholder="Remarks"
                        value={remarks[m.no] || ""}
                        onChange={(e) => setRemarks((r) => ({ ...r, [m.no]: e.target.value }))}
                      />
                    </div>
                  </details>
                </div>
              );
            })}
            <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="font-display text-sm uppercase tracking-wider">Subtotal</span>
              <div className="text-right">
                <span className="font-display text-lg tabular-nums text-highlight">{movementsTotal.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground tabular-nums ml-1">/ {TOTAL_MAX}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Artistic Marks – Freestyle Only */}
        {isFreestyle && (
          <section className="mb-6 sm:mb-8 print:mb-4">
            <div className="mb-3">
              <SectionTitle index="02" title="Artistic Marks" subtitle="Music, choreography & harmony · Score 0–10" />
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <thead>
                    <tr className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground shadow-soft">
                      <Th className="w-12 text-center">No.</Th>
                      <Th className="w-auto">Criterion</Th>
                      <Th className="w-20 text-center">Mark</Th>
                      <Th className="w-20 text-center">Correction</Th>
                      <Th className="w-16 text-center">Coeff.</Th>
                      <Th className="w-20 text-center">Final</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {ARTISTIC_MOVEMENTS.map((m, i) => {
                      const final = artisticFinalMarks[m.no];
                      const hasValue = final > 0;
                      return (
                        <tr key={m.no} className={`border-t border-border ${i % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-accent/40`}>
                          <td className="px-3 py-3 text-center">
                            <span className="inline-grid place-items-center h-7 w-7 rounded-full border border-border font-display text-xs tabular-nums">{m.no}</span>
                          </td>
                          <td className="px-3 py-3 leading-snug">{m.test}</td>
                          <td className="px-1 py-2">
                            <NumInput
                              value={artisticScores[m.no] || ""}
                              onChange={(v) => { if (v !== "" && (parseFloat(v) < 0 || parseFloat(v) > 10)) return; setArtisticScores((s) => ({ ...s, [m.no]: v })); }}
                              placeholder="—"
                              accent
                            />
                          </td>
                          <td className="px-1 py-2">
                            <NumInput
                              value={artisticCorrections[m.no] || ""}
                              onChange={(v) => { if (v !== "" && (parseFloat(v) < 0 || parseFloat(v) > 10)) return; setArtisticCorrections((s) => ({ ...s, [m.no]: v })); }}
                              placeholder="—"
                              bordered
                            />
                          </td>
                          <td className="px-3 py-3 text-center text-muted-foreground text-xs">×{m.coefficient}</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`font-display tabular-nums text-base ${hasValue ? "text-highlight" : "text-muted-foreground/40"}`}>
                              {hasValue ? final.toFixed(1) : "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-foreground/20 bg-muted/40">
                      <td colSpan={2} className="px-3 py-3 font-display text-sm uppercase tracking-wider">Artistic Subtotal</td>
                      <td colSpan={3}></td>
                      <td className="px-3 py-3 text-center font-display text-lg tabular-nums text-highlight whitespace-nowrap">
                        {artisticTotal.toFixed(1)}
                        <span className="text-xs text-muted-foreground ml-1">/ {ARTISTIC_MAX}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {ARTISTIC_MOVEMENTS.map((m) => {
                const final = artisticFinalMarks[m.no];
                const hasValue = final > 0;
                return (
                  <div key={m.no} className="bg-card border border-border rounded-xl shadow-soft p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="inline-grid place-items-center h-8 w-8 shrink-0 rounded-full border border-border font-display text-xs">{m.no}</span>
                        <div className="text-sm leading-snug">{m.test}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Final</div>
                        <div className={`font-display tabular-nums text-lg ${hasValue ? "text-highlight" : "text-muted-foreground/40"}`}>
                          {hasValue ? final.toFixed(1) : "—"}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mark</span>
                        <NumInput value={artisticScores[m.no] || ""} onChange={(v) => { if (v !== "" && (parseFloat(v) < 0 || parseFloat(v) > 10)) return; setArtisticScores((s) => ({ ...s, [m.no]: v })); }} placeholder="—" accent />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Corr.</span>
                        <NumInput value={artisticCorrections[m.no] || ""} onChange={(v) => { if (v !== "" && (parseFloat(v) < 0 || parseFloat(v) > 10)) return; setArtisticCorrections((s) => ({ ...s, [m.no]: v })); }} placeholder="—" bordered />
                      </label>
                    </div>
                  </div>
                );
              })}
              <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="font-display text-sm uppercase tracking-wider">Artistic Subtotal</span>
                <div className="text-right">
                  <span className="font-display text-lg tabular-nums text-highlight">{artisticTotal.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground tabular-nums ml-1">/ {ARTISTIC_MAX}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Collective */}
        {config.hasCollective !== false && (
          <section className="mb-8 print:mb-4">
            <div className="mb-3">
              <SectionTitle
                index="02"
                title="Collective Mark"
                subtitle={config.collectives ? "Score each criterion 0–10" : "Rider position, seat & effect of aids"}
              />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <tbody>
                    {COLLECTIVES.map((c) => {
                      const rawScore = collectiveScores[c.no] ?? "";
                      const rawCorr = collectiveCorrections[c.no] ?? "";
                      const corrVal = parseFloat(rawCorr);
                      const scoreVal = parseFloat(rawScore);
                      const base = !isNaN(corrVal) ? corrVal : isNaN(scoreVal) ? 0 : scoreVal;
                      const rowFinal = base * c.coefficient;
                      const hasVal = base > 0;
                      return (
                        <tr key={c.no} className="border-t border-border first:border-t-0">
                          <td className="px-3 py-4 w-12 text-center">
                            <span className="inline-grid place-items-center h-7 w-7 rounded-full border border-border font-display text-xs">{c.no}</span>
                          </td>
                          <td className="px-3 py-4">{c.label}</td>
                          <td className="px-1 py-2 w-24">
                            <NumInput
                              value={rawScore}
                              onChange={(v) => setCollectiveScores((s) => ({ ...s, [c.no]: v }))}
                              placeholder="Mark"
                              accent
                            />
                          </td>
                          <td className="px-1 py-2 w-24">
                            <NumInput
                              value={rawCorr}
                              onChange={(v) => setCollectiveCorrections((s) => ({ ...s, [c.no]: v }))}
                              placeholder="Corr."
                              bordered
                            />
                          </td>
                          <td className="px-3 py-4 w-16 text-center text-muted-foreground text-xs">×{c.coefficient}</td>
                          <td className="px-3 py-4 w-24 text-center font-display text-lg text-highlight tabular-nums">
                            {hasVal ? rowFinal.toFixed(1) : "—"}
                          </td>
                          <td className="px-1 py-2 w-44">
                            <input
                              className="w-full bg-transparent border border-border rounded-md px-2 py-1.5 text-xs outline-none focus:bg-background focus:ring-1 focus:ring-ring transition-all"
                              placeholder="Remarks"
                              value={collectiveRemarksMap[c.no] ?? ""}
                              onChange={(e) => setCollectiveRemarksMap((r) => ({ ...r, [c.no]: e.target.value }))}
                            />
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-foreground/20 bg-muted/40">
                      <td colSpan={2} className="px-3 py-3 font-display text-sm uppercase tracking-wider">Total</td>
                      <td colSpan={3}></td>
                      <td className="px-3 py-3 text-center font-display text-lg text-highlight tabular-nums whitespace-nowrap">
                        {grandTotal.toFixed(1)}
                        <span className="text-xs text-muted-foreground ml-1">/ {GRAND_TOTAL_MAX}</span>
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Penalties + Score */}
        <section className="mb-8 print:mb-4">
          <div className="mb-3">
            <SectionTitle index="03" title="Penalties & Final Score" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4 sm:p-6 shadow-soft">
              <h3 className="font-display text-lg mb-4">Deductions</h3>
              <ul className="text-xs text-muted-foreground space-y-1 mb-5 leading-relaxed">
                <li>• 1st course error = −0.5 percentage point</li>
                <li>• 2nd course error = −1 percentage point</li>
                <li>• 3rd course error = Elimination</li>
                <li>• {config.otherErrorPenalty !== undefined ? `Technical faults = −${config.otherErrorPenalty}% each` : "Other errors = −2 points each"}</li>
              </ul>

              <div className="space-y-4">
                {config.technicalCombined && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      Technical Score (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={100}
                        step={0.001}
                        value={technicalScore}
                        onChange={(e) => setTechnicalScore(e.target.value)}
                        placeholder="Enter technical %"
                        className="w-48 text-center tabular-nums rounded-md py-1.5 px-3 text-sm outline-none transition-all bg-transparent border border-border focus:border-highlight focus:bg-background focus:ring-2 focus:ring-highlight/20"
                      />
                      <span className="text-xs text-muted-foreground">
                        Quality: <span className="tabular-nums text-foreground">{qualityPct.toFixed(3)}%</span>
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Course error
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {EFFECTIVE_COURSE_ERRORS.map((c) => (
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
                    {config.otherErrorPenalty !== undefined ? "Technical faults" : "Other errors"}
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
                    <span className="text-xs text-muted-foreground">× −{OTHER_ERROR_PENALTY} pts = −{(otherErrors * OTHER_ERROR_PENALTY).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score card */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden bg-primary text-primary-foreground rounded-xl p-5 sm:p-6 shadow-card h-full flex flex-col justify-between">
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-highlight/20 blur-2xl" />
                <div className="relative">
                  <div className="text-[10px] uppercase tracking-[0.25em] opacity-70">Total Score</div>
                  <div className="font-display text-5xl sm:text-6xl mt-3 tabular-nums leading-none whitespace-nowrap">
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
                  {isFreestyle ? (
                    <>
                      <div>
                        <div className="opacity-70">Technical %</div>
                        <div className="font-display text-base tabular-nums opacity-100 mt-0.5">
                          {TOTAL_MAX > 0 ? `${((movementsTotal / TOTAL_MAX) * 100).toFixed(3)}%` : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="opacity-70">Artistic %</div>
                        <div className="font-display text-base tabular-nums opacity-100 mt-0.5">
                          {ARTISTIC_MAX > 0 ? `${((artisticTotal / ARTISTIC_MAX) * 100).toFixed(3)}%` : "—"}
                        </div>
                      </div>
                    </>
                  ) : config.technicalCombined ? (
                    <>
                      <div>
                        <div className="opacity-70">Quality %</div>
                        <div className="font-display text-base tabular-nums opacity-100 mt-0.5">
                          {qualityPct.toFixed(3)}%
                        </div>
                      </div>
                      <div>
                        <div className="opacity-70">Technical %</div>
                        <div className="font-display text-base tabular-nums opacity-100 mt-0.5">
                          {technicalScore ? `${parseFloat(technicalScore).toFixed(3)}%` : "—"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="opacity-70">Raw total</div>
                        <div className="font-display text-base tabular-nums opacity-100 mt-0.5">
                          {grandTotal.toFixed(1)} <span className="opacity-50">/ {GRAND_TOTAL_MAX}</span>
                        </div>
                      </div>
                      <div>
                        <div className="opacity-70">Deductions</div>
                        <div className="font-display text-base tabular-nums opacity-100 mt-0.5">
                          −{(courseError === -1 ? 0 : courseError + otherErrors * OTHER_ERROR_PENALTY).toFixed(1)}%
                        </div>
                      </div>
                    </>
                  )}
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

      {/* Mobile sticky action bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur-md print:hidden">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground" title={savedLabel}>
            <span className={`h-1.5 w-1.5 rounded-full ${savedAt ? "bg-highlight" : "bg-muted-foreground/40"}`} />
            <span className="tabular-nums">{savedAt ? "Saved" : "—"}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {hasDraft && (
              <button
                onClick={loadDraft}
                className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
              >
                Load
              </button>
            )}
            <button
              onClick={reset}
              className="text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
            >
              Reset
            </button>
            <button
              onClick={openSaveModal}
              className="text-xs px-2.5 py-1.5 rounded-md bg-highlight text-background hover:opacity-90 transition-opacity"
            >
              {savedSuccess ? "Saved ✓" : "Save"}
            </button>
            <button
              onClick={exportPdf}
              className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <footer className="border-t border-border py-6 pb-20 md:pb-6 text-center text-xs text-muted-foreground print:hidden">
        {info.label} · {info.appendix} · Interactive Scoring Sheet
      </footer>

      {/* ── SAVE SCORE MODAL ─────────────────────────────── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h2 className="font-display text-lg">Save Score Sheet</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{info.label} · {info.appendix}</p>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Score summary */}
              <div className="bg-muted/50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</div>
                  <div className="font-display text-2xl tabular-nums text-highlight mt-0.5">
                    {eliminated ? "Eliminated" : `${percentage.toFixed(3)}%`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Raw total</div>
                  <div className="font-display text-base tabular-nums mt-0.5">
                    {grandTotal.toFixed(1)} <span className="text-muted-foreground text-xs">/ {GRAND_TOTAL_MAX}</span>
                  </div>
                </div>
              </div>

              {/* Rider picker */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  Rider
                </label>
                <select
                  value={saveRiderId}
                  onChange={(e) => setSaveRiderId(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="_meta">
                    {meta.name ? `${meta.name}${meta.competitorNo ? ` (#${meta.competitorNo})` : ""}` : "— From sheet info —"}
                  </option>
                  {allRidersList.length > 0 && (
                    <optgroup label="Registered riders">
                      {allRidersList.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} (#{r.competitorNo}) · {r.horse}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>

                {/* Rider info preview */}
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(() => {
                    const r = saveRiderId === "_meta"
                      ? null
                      : allRidersList.find((x) => x.id === saveRiderId);
                    const name  = r ? r.name  : meta.name  || "—";
                    const no    = r ? r.competitorNo : meta.competitorNo || "—";
                    const horse = r ? r.horse : meta.horse || "—";
                    return (
                      <>
                        <div className="bg-background border border-border rounded-lg px-3 py-2">
                          <div className="text-[10px] text-muted-foreground">Rider</div>
                          <div className="text-xs font-medium truncate mt-0.5">{name}</div>
                        </div>
                        <div className="bg-background border border-border rounded-lg px-3 py-2">
                          <div className="text-[10px] text-muted-foreground">No.</div>
                          <div className="text-xs font-medium mt-0.5">{no}</div>
                        </div>
                        <div className="bg-background border border-border rounded-lg px-3 py-2">
                          <div className="text-[10px] text-muted-foreground">Horse</div>
                          <div className="text-xs font-medium truncate mt-0.5">{horse}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(["submitted", "draft"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSaveStatus(s)}
                      className={`flex-1 text-sm py-2 rounded-lg border transition-colors capitalize ${
                        saveStatus === s
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScore}
                className="text-sm px-5 py-2 rounded-lg bg-highlight text-background hover:opacity-90 transition-opacity font-medium"
              >
                Save Score →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
    <span className="font-mono text-xs text-muted-foreground tabular-nums">{index}</span>
    <h2 className="font-display text-xl sm:text-2xl tracking-tight leading-none">{title}</h2>
    {subtitle && (
      <span className="text-xs text-muted-foreground hidden md:block">{subtitle}</span>
    )}
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
  bordered?: boolean;
  min?: number;
  step?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "min" | "step" | "placeholder">;

const NumInput = ({
  value,
  onChange,
  placeholder,
  accent = false,
  bordered = false,
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
        : bordered
        ? "border-border focus:border-ring focus:bg-background"
        : "border-transparent hover:border-border focus:border-ring focus:bg-background"
    } ${className ?? ""}`}
    {...rest}
  />
);
