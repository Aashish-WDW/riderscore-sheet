import * as React from "react";
import { useMemo, useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { Link, useParams } from "react-router-dom";

type Movement = {
  no: string;
  letters: string;
  test: string;
  coefficient: number;
  directive: string;
};

type TestConfig = {
  label: string;
  appendix: string;
  abbr: string;
  subtitle: string;
  movements: Movement[];
};

const YOUNG_RIDER_MOVEMENTS: Movement[] = [
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

const CHILDREN_I_MOVEMENTS: Movement[] = [
  { no: "1", letters: "A\nX", test: "Enter in working trot\nHalt – immobility – salute\nProceed in working trot", coefficient: 1, directive: "The entry, the straightness, the activity, the halt, the transitions." },
  { no: "2", letters: "C\nM X K\nK", test: "Track to the right\nMedium trot\nWorking trot", coefficient: 1, directive: "The bend at C, the regularity and the lengthening of the steps and frame." },
  { no: "3", letters: "M / K", test: "Transitions at M and K", coefficient: 1, directive: "The clear definition and fluency of the transitions." },
  { no: "4", letters: "A\nD\nL", test: "Down centre line\nLeg yielding to the right, return to the track between R and M", coefficient: 1, directive: "The flow and balance, the straightness, the parallelism to the track, the activity." },
  { no: "5", letters: "C", test: "Circle to the left 20 m diameter, while crossing the centre line give and retake the reins for a few steps", coefficient: 2, directive: "The rhythm and the maintenance of the same attitude and balance while giving hands; reins should be clearly loose." },
  { no: "6", letters: "H X F\nF A", test: "Medium trot\nWorking trot", coefficient: 1, directive: "The regularity and the lengthening of the steps and frame." },
  { no: "7", letters: "H / F", test: "Transitions at H and F", coefficient: 1, directive: "The clear definition and fluency of the transition." },
  { no: "8", letters: "A", test: "Down centre line\nLeg yielding to the left, return to the track between S and H", coefficient: 1, directive: "The flow and balance, the straightness, the parallelism to the track, the activity." },
  { no: "9", letters: "C", test: "Rising trot and circle to the right 20 m diameter\nOn the open side of the circle (crossing the centre line) slowly lengthen the reins, then slowly shorten on a long rein, forwards/downwards\nOn the closed side of the circle take up the reins", coefficient: 2, directive: "The stretching of the neck and nose forwards and downwards, the steadiness of the contact, the regularity and balance of the trot." },
  { no: "10", letters: "C", test: "Medium walk", coefficient: 1, directive: "The regularity, relaxation and the groundcover." },
  { no: "11", letters: "M V", test: "Medium walk, lengthen the reins and allow the horse to stretch on a long rein", coefficient: 2, directive: "The rhythm and activity of the steps, the lengthening of the frame. The fluency of the shortening of the reins and maintenance of the activity and the quality of the walk. The transitions." },
  { no: "12", letters: "V K\nF\nK", test: "Medium walk and recollect the reins\nProceed in working canter left\nWorking canter", coefficient: 1, directive: "The straightness and the balance." },
  { no: "13", letters: "F M\nM H", test: "Medium canter\nWorking canter", coefficient: 1, directive: "The lengthening of the frame and groundcover of the strides." },
  { no: "14", letters: "F / M", test: "The transitions at F and M", coefficient: 1, directive: "The clear definition and fluency of the transitions." },
  { no: "15", letters: "H B\nP V\nV S", test: "Change rein\nHalf circle in counter canter\nCounter canter", coefficient: 2, directive: "Quality of the canter, self carriage, balance and keeping the quarters in line with the forelegs." },
  { no: "16", letters: "S", test: "Medium walk", coefficient: 1, directive: "The straightness, the balance, the transitions, and the quality of the walk." },
  { no: "17", letters: "H", test: "Working canter", coefficient: 1, directive: "The transition, straightness, quality of the canter." },
  { no: "18", letters: "M F\nF K", test: "Medium canter\nWorking canter", coefficient: 1, directive: "The lengthening of the frame and strides." },
  { no: "19", letters: "M / F", test: "Transitions at M and F", coefficient: 1, directive: "The clear definition and the fluency of the transition." },
  { no: "20", letters: "K B\nR S\nS V", test: "Change rein in working canter\nHalf-circle in counter canter\nCounter canter", coefficient: 2, directive: "Quality of the canter, self carriage, balance and keeping the quarters in line with the forelegs." },
  { no: "21", letters: "V", test: "Working trot", coefficient: 1, directive: "The transition and the trot between V and A." },
  { no: "22", letters: "A", test: "Down centre line\nHalt – immobility – salute", coefficient: 1, directive: "The quality of the trot, straightness, the transitions, the halt." },
];

const JUNIOR_MOVEMENTS: Movement[] = [
  { no: "1", letters: "A\nX", test: "Enter in working trot\nHalt – immobility – salute", coefficient: 1, directive: "Correctness of trot and transitions. Precision of centre line and halt. Preparation of halt. Immobility, straightness. Contact and poll." },
  { no: "2", letters: "X\nC", test: "Proceed in working trot\nWorking trot", coefficient: 1, directive: "Promptness of depart, quality of trot. Straightness. Contact and poll." },
  { no: "3", letters: "C\nM V", test: "Track to the right\nMedium trot\nWorking trot", coefficient: 1, directive: "Regularity, balance, engagement, groundcover. Lengthening of frame. Straightness." },
  { no: "4", letters: "V K", test: "Transitions at M and V\nWorking trot", coefficient: 1, directive: "Fluency and balance of both transitions. Regularity." },
  { no: "5", letters: "K D\nE S", test: "Half volte (10 m)\nLeg-yielding\nWorking trot", coefficient: 2, directive: "Regularity, balance, energy. Correct bend in volte. Correct flexion, positioning and bend in leg-yielding." },
  { no: "6", letters: "S R\nP B E", test: "Half circle (20 m), give and retake the reins for 3–4 steps\nWorking trot", coefficient: 2, directive: "Regularity, balance, energy. Maintenance of self-carriage. Accuracy of the circle line." },
  { no: "7", letters: "E D\nR B", test: "Half volte (10 m)\nLeg-yielding\nWorking trot", coefficient: 2, directive: "Regularity, balance, energy. Correct bend in volte. Correct flexion, positioning and bend in leg-yielding." },
  { no: "8", letters: "R\nS", test: "Medium walk\nHalf circle (20 m)", coefficient: 1, directive: "Regularity, suppleness of back, activity, relaxation. Accuracy of the circle line." },
  { no: "9", letters: "S (E)\nM E S (I)", test: "Turn on the haunches\nProceed in medium walk", coefficient: 2, directive: "Regularity, activity, energy. Size, flexion, bend. Forward tendency, maintenance of four-beat." },
  { no: "10", letters: "S H", test: "Medium walk", coefficient: 1, directive: "Regularity, suppleness of back, activity, groundcover, relaxation. Straightness." },
  { no: "11", letters: "H\nC M", test: "Proceed in working canter\nWorking canter", coefficient: 1, directive: "Fluency and balance of transition. Quality of canter." },
  { no: "12", letters: "M B\nF", test: "Medium canter\nCollected canter", coefficient: 1, directive: "Lengthening of strides and frame, balance, uphill tendency, straightness." },
  { no: "13", letters: "F A K", test: "Transitions at M and F\nCollected canter", coefficient: 1, directive: "Fluency and balance of both transitions. Quality of canter." },
  { no: "14", letters: "K X H", test: "One loop of 10 m\nCollected canter", coefficient: 1, directive: "Quality of (counter) canter. Balance, self-carriage. Bending of the loop." },
  { no: "15", letters: "R X V / X\nX K A F", test: "Short diagonal\nLeg-yielding\nCollected canter", coefficient: 2, directive: "Promptness, fluency and straightness of 3–5 clear walk steps. Quality of canter." },
  { no: "16", letters: "F X M", test: "One loop of 10 m\nCollected canter", coefficient: 1, directive: "Quality of (counter) canter. Balance, self-carriage. Bending of the loop." },
  { no: "17", letters: "H S\nE K X S", test: "Collected canter\nSimple change of leg\nCollected canter", coefficient: 2, directive: "Promptness, fluency and change of transitions. Straightness, 3–5 clear walk steps. Quality of canter." },
  { no: "18", letters: "P F\nA", test: "Working trot\nWorking trot", coefficient: 1, directive: "Fluency and balance of transition. Regularity of trot." },
  { no: "19", letters: "A\nX", test: "Down the centre line\nHalt – immobility – salute", coefficient: 1, directive: "Quality of trot, straightness, balance into halt. Contact and poll." },
];

const CHILDREN_II_MOVEMENTS: Movement[] = [
  { no: "1", letters: "A\nX", test: "Enter in working trot\nHalt – immobility – salute\nProceed in working trot", coefficient: 1, directive: "The quality of the trot. The entry, the straightness, the halt and the transitions." },
  { no: "2", letters: "C\nE K", test: "Track to the left\nCircle to the left 12 m diameter\nWorking trot", coefficient: 1, directive: "The regularity and the balance. The bend and the quality of the circle." },
  { no: "3", letters: "F X H", test: "Change rein. Before X medium trot, X to 10 steps after X working trot", coefficient: 1, directive: "The transitions, the fluency and the quality of the trot." },
  { no: "4", letters: "H C M\nB", test: "Circle to the right 12 m diameter\nWorking trot", coefficient: 1, directive: "The regularity and the balance. The bend and the quality of the circle." },
  { no: "5", letters: "A", test: "Halt 4 seconds – immobility\nProceed in medium walk", coefficient: 1, directive: "The transition, the halt." },
  { no: "6", letters: "K B\nB R", test: "Change rein in medium walk, lengthen the reins and allow the horse to stretch on a long rein\nShorten the reins", coefficient: 1, directive: "The rhythm and activity of the steps, the lengthening of the frame. The fluency of the shortening of the reins and the maintenance of the activity and the quality of the walk." },
  { no: "7", letters: "R M C", test: "Working trot", coefficient: 1, directive: "The transitions. The quality of the trot." },
  { no: "8", letters: "C", test: "Proceed in working canter left", coefficient: 1, directive: "The transitions and the balance." },
  { no: "9", letters: "E", test: "Circle to the left 15 m diameter", coefficient: 1, directive: "The bend, the regularity of the circle and the quality of the canter." },
  { no: "10", letters: "E K A\nF B", test: "Working canter", coefficient: 1, directive: "The quality of the canter." },
  { no: "11", letters: "B", test: "Working trot", coefficient: 1, directive: "The transition. The quality of the trot." },
  { no: "12", letters: "C A", test: "Serpentine 4 loops", coefficient: 2, directive: "The bend, the correctness of the loops and the straightness of the lines between the loops." },
  { no: "13", letters: "A", test: "Proceed in working canter right", coefficient: 1, directive: "The transition and the quality of the canter." },
  { no: "14", letters: "E", test: "Circle to the right 15 m diameter", coefficient: 1, directive: "The bend, the regularity of the circle and the quality of the canter." },
  { no: "15", letters: "E H C\nM B", test: "Working canter", coefficient: 1, directive: "The quality of the canter." },
  { no: "16", letters: "B", test: "Working trot", coefficient: 1, directive: "The transition. The quality of the trot." },
  { no: "17", letters: "A", test: "Down centre line", coefficient: 1, directive: "The bend at A and the straightness from A–I." },
  { no: "18", letters: "I", test: "Halt – immobility – salute", coefficient: 1, directive: "The halt and the transition." },
];

const TEST_CONFIGS: Record<string, TestConfig> = {
  "young-rider": {
    label: "Young Rider",
    appendix: "Appendix A",
    abbr: "YR",
    subtitle: "Time 6′30″ · Minimum age of horse: 6 years",
    movements: YOUNG_RIDER_MOVEMENTS,
  },
  "junior": {
    label: "Junior",
    appendix: "Appendix C",
    abbr: "JR",
    subtitle: "Time 3′55″ · Minimum age of horse: 6 years",
    movements: JUNIOR_MOVEMENTS,
  },
  "children-i": {
    label: "Children I",
    appendix: "Appendix D",
    abbr: "C1",
    subtitle: "Time 5 min · Min age of horse: 8 years (children) / 5 years (adults). All trot work sitting unless indicated.",
    movements: CHILDREN_I_MOVEMENTS,
  },
  "children-ii": {
    label: "Children II",
    appendix: "Appendix E",
    abbr: "C2",
    subtitle: "Time 4 min · Min age of horse: 6 years (children) / 5 years (adults). All trot work sitting unless indicated.",
    movements: CHILDREN_II_MOVEMENTS,
  },
};

const COLLECTIVE_COEF = 2;
const COURSE_ERRORS = [
  { label: "No error", value: 0 },
  { label: "1st error · −0.5%", value: 0.5 },
  { label: "2nd error · −1%", value: 1 },
  { label: "3rd error · Elimination", value: -1 },
];

const Index = () => {
  const { testId = "young-rider" } = useParams<{ testId: string }>();
  const config = TEST_CONFIGS[testId] ?? TEST_CONFIGS["young-rider"];
  const info = config;
  const MOVEMENTS = config.movements;
  const TOTAL_MAX = MOVEMENTS.reduce((sum, m) => sum + 10 * m.coefficient, 0);
  const GRAND_TOTAL_MAX = TOTAL_MAX + 10 * COLLECTIVE_COEF;
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
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to="/"
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
          <div className="flex items-end justify-between mb-4 gap-4">
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">FEI · Dressage Test</div>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-tight">
                {info.label} <span className="italic text-highlight">scoring</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {config.subtitle}
              </p>
            </div>
            <div className="hidden lg:block text-right shrink-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Movements</div>
              <div className="font-display text-3xl tabular-nums">
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

        {/* Collective */}
        <section className="mb-8 print:mb-4">
          <div className="mb-3">
            <SectionTitle index="02" title="Collective Mark" subtitle="Rider position, seat & effect of aids" />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
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
