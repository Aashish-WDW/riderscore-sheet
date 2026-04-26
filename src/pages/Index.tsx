import { useMemo, useState } from "react";

type Movement = {
  no: string;
  letters: string;
  test: string;
  coefficient: number;
  directive: string;
};

const MOVEMENTS: Movement[] = [
  { no: "1", letters: "A\nX", test: "Enter in working trot\nHalt, salute. Proceed in working trot", coefficient: 1, directive: "Straightness; quality of trot; balance of transitions; immobility; willing halt." },
  { no: "2", letters: "C\nMXK", test: "Track to the left\nChange rein in medium trot", coefficient: 1, directive: "Regularity, elasticity of steps; engagement; uphill tendency; straightness." },
  { no: "3", letters: "K\nA", test: "Working trot\nWorking canter left", coefficient: 1, directive: "Quality of trot and canter; balance and fluency of transition." },
  { no: "4", letters: "AFB", test: "Medium canter", coefficient: 1, directive: "Regularity; impulsion; balance; clear lengthening of frame and stride." },
  { no: "5", letters: "B", test: "Working canter", coefficient: 1, directive: "Smoothness and balance of transition; engagement of hindquarters." },
  { no: "6", letters: "BM\nMC", test: "Half-circle 20m\nWorking trot", coefficient: 1, directive: "Shape and size of half-circle; bend; balance of transition." },
  { no: "7", letters: "C\nHXF", test: "Medium walk\nChange rein in extended walk", coefficient: 2, directive: "Regularity and quality of walk; clear over-track; relaxation; freedom of shoulder." },
  { no: "8", letters: "F\nA", test: "Medium walk\nCollected trot", coefficient: 1, directive: "Quality of walk; smooth, balanced and prompt transition." },
  { no: "9", letters: "AK\nKE", test: "Shoulder-in left\nCircle left 10m", coefficient: 2, directive: "Correct angle and bend; engagement; regularity; size and balance of circle." },
  { no: "10", letters: "EH\nHC", test: "Shoulder-in left\nCollected trot", coefficient: 2, directive: "Consistent angle and bend; cadence; smooth transition to collected trot." },
  { no: "11", letters: "CM\nMB", test: "Shoulder-in right\nCircle right 10m", coefficient: 2, directive: "Correct angle and bend; engagement; regularity; size and balance of circle." },
  { no: "12", letters: "BF\nFA", test: "Shoulder-in right\nCollected trot", coefficient: 2, directive: "Consistent angle and bend; cadence; smooth transition to collected trot." },
  { no: "13", letters: "A\nDX", test: "Down centre line\nHalf-pass to the left", coefficient: 2, directive: "Straightness on centre line; correct bend; crossing of legs; fluency." },
  { no: "14", letters: "XG\nC", test: "Half-pass to the right\nTrack right", coefficient: 2, directive: "Bend and angle; engagement; regularity; quality of turn." },
  { no: "15", letters: "MXK", test: "Extended trot", coefficient: 2, directive: "Lengthening of frame and stride; impulsion; balance; clear transitions." },
  { no: "16", letters: "KAF", test: "Collected trot", coefficient: 1, directive: "Cadence; collection; balance; uphill tendency." },
  { no: "17", letters: "FXH", test: "Change rein, flying change at X", coefficient: 2, directive: "Straightness; balance; clean, expressive flying change at the marker." },
  { no: "18", letters: "C", test: "Collected canter", coefficient: 1, directive: "Quality of canter; collection; balance; preparation for next movement." },
];

const COLLECTIVE_MAX = 10;
const COLLECTIVE_COEF = 2;
const TOTAL_MAX = 270;
const GRAND_TOTAL_MAX = 290;

const COURSE_ERRORS = [
  { label: "No error", value: 0 },
  { label: "1st error - 0.5%", value: 0.5 },
  { label: "2nd error - 1%", value: 1 },
  { label: "3rd error - Elimination", value: -1 },
];

const Index = () => {
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
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [collective, setCollective] = useState<string>("");
  const [collectiveCorrection, setCollectiveCorrection] = useState<string>("");
  const [collectiveRemarks, setCollectiveRemarks] = useState<string>("");
  const [courseError, setCourseError] = useState<number>(0);
  const [otherErrors, setOtherErrors] = useState<number>(0);
  const [organisers, setOrganisers] = useState<string>("");

  const getEffective = (no: string, raw: string, correction: string) => {
    const c = parseFloat(correction);
    if (!isNaN(c)) return c;
    const r = parseFloat(raw);
    return isNaN(r) ? 0 : r;
  };

  const finalMarks = useMemo(() => {
    const map: Record<string, number> = {};
    MOVEMENTS.forEach((m) => {
      map[m.no] = getEffective(m.no, scores[m.no] || "", corrections[m.no] || "") * m.coefficient;
    });
    return map;
  }, [scores, corrections]);

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

  const updateScore = (no: string, val: string) => {
    if (val !== "" && (parseFloat(val) < 0 || parseFloat(val) > 10)) return;
    setScores((s) => ({ ...s, [no]: val }));
  };

  const updateCorrection = (no: string, val: string) => {
    if (val !== "" && (parseFloat(val) < 0 || parseFloat(val) > 10)) return;
    setCorrections((s) => ({ ...s, [no]: val }));
  };

  return (
    <div className="min-h-screen bg-muted py-6 px-4 print:p-0 print:bg-background">
      <div className="mx-auto max-w-[960px] bg-background shadow-lg p-6 print:shadow-none">
        {/* Header */}
        <div className="relative text-center mb-3">
          <h1 className="text-base font-bold underline inline-block">YOUNG RIDER</h1>
          <span className="absolute right-0 top-0 font-bold underline">Appendix 'A'</span>
        </div>

        {/* Meta info */}
        <div className="space-y-1.5 text-sm mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="font-medium">Event:</label>
            <input
              className="flex-1 min-w-[180px] border-b border-dotted border-foreground bg-transparent px-1 outline-none focus:border-primary"
              value={meta.event}
              onChange={(e) => setMeta({ ...meta, event: e.target.value })}
            />
            <label className="font-medium">Date:</label>
            <input
              className="w-32 border-b border-dotted border-foreground bg-transparent px-1 outline-none focus:border-primary"
              value={meta.date}
              onChange={(e) => setMeta({ ...meta, date: e.target.value })}
            />
            <label className="font-medium">Judge:</label>
            <input
              className="flex-1 min-w-[140px] border-b border-dotted border-foreground bg-transparent px-1 outline-none focus:border-primary"
              value={meta.judge}
              onChange={(e) => setMeta({ ...meta, judge: e.target.value })}
            />
            <label className="font-medium">Position</label>
            <input
              className="w-10 h-7 border border-foreground text-center bg-transparent outline-none focus:border-primary"
              value={meta.position}
              onChange={(e) => setMeta({ ...meta, position: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="font-medium">Competitor No:</label>
            <input
              className="w-24 border-b border-dotted border-foreground bg-transparent px-1 outline-none focus:border-primary"
              value={meta.competitorNo}
              onChange={(e) => setMeta({ ...meta, competitorNo: e.target.value })}
            />
            <label className="font-medium">Name:</label>
            <input
              className="flex-1 min-w-[180px] border-b border-dotted border-foreground bg-transparent px-1 outline-none focus:border-primary"
              value={meta.name}
              onChange={(e) => setMeta({ ...meta, name: e.target.value })}
            />
            <label className="font-medium">Horse:</label>
            <input
              className="flex-1 min-w-[180px] border-b border-dotted border-foreground bg-transparent px-1 outline-none focus:border-primary"
              value={meta.horse}
              onChange={(e) => setMeta({ ...meta, horse: e.target.value })}
            />
          </div>

          <div className="flex justify-between text-xs pt-1">
            <span>Time: 6'30" (for information only)</span>
            <span>Minimum age of horse: 6 Years</span>
          </div>
        </div>

        {/* Movements table */}
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-secondary">
              <th className="border border-foreground p-1 w-10">No.</th>
              <th className="border border-foreground p-1 w-14">Letters</th>
              <th className="border border-foreground p-1">Test</th>
              <th className="border border-foreground p-1 w-14">Marks</th>
              <th className="border border-foreground p-1 w-16">Mark</th>
              <th className="border border-foreground p-1 w-16">Correction</th>
              <th className="border border-foreground p-1 w-14">Coeff.</th>
              <th className="border border-foreground p-1 w-16">Final</th>
              <th className="border border-foreground p-1 w-32">Directive Ideas</th>
              <th className="border border-foreground p-1 w-28">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {MOVEMENTS.map((m) => (
              <tr key={m.no}>
                <td className="border border-foreground p-1 text-center">{m.no}</td>
                <td className="border border-foreground p-1 text-center whitespace-pre-line">{m.letters}</td>
                <td className="border border-foreground p-1 whitespace-pre-line">{m.test}</td>
                <td className="border border-foreground p-1 text-center">10</td>
                <td className="border border-foreground p-0">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-full h-full text-center bg-transparent outline-none p-1 focus:bg-accent"
                    value={scores[m.no] || ""}
                    onChange={(e) => updateScore(m.no, e.target.value)}
                  />
                </td>
                <td className="border border-foreground p-0">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-full h-full text-center bg-transparent outline-none p-1 focus:bg-accent"
                    value={corrections[m.no] || ""}
                    onChange={(e) => updateCorrection(m.no, e.target.value)}
                  />
                </td>
                <td className="border border-foreground p-1 text-center"></td>
                <td className="border border-foreground p-1 text-center font-semibold">
                  {finalMarks[m.no] ? finalMarks[m.no].toFixed(1) : ""}
                </td>
                <td className="border border-foreground p-1 text-[11px] leading-snug">{m.directive}</td>
                <td className="border border-foreground p-0">
                  <input
                    className="w-full h-full bg-transparent outline-none p-1 focus:bg-accent"
                    value={remarks[m.no] || ""}
                    onChange={(e) => setRemarks((r) => ({ ...r, [m.no]: e.target.value }))}
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-secondary font-bold">
              <td className="border border-foreground p-1 text-center" colSpan={3}>Total</td>
              <td className="border border-foreground p-1 text-center">{TOTAL_MAX}</td>
              <td className="border border-foreground p-1"></td>
              <td className="border border-foreground p-1"></td>
              <td className="border border-foreground p-1"></td>
              <td className="border border-foreground p-1 text-center">{movementsTotal.toFixed(1)}</td>
              <td className="border border-foreground p-1"></td>
              <td className="border border-foreground p-1"></td>
            </tr>
          </tbody>
        </table>

        {/* Collective Mark */}
        <div className="font-bold underline mt-4 mb-1.5 text-sm">Collective Mark</div>
        <table className="w-full border-collapse text-xs">
          <tbody>
            <tr>
              <td className="border border-foreground p-1 w-10 text-center">1.</td>
              <td className="border border-foreground p-1 w-14"></td>
              <td className="border border-foreground p-1">
                Riders position and seat; correctness and effect of the aids
              </td>
              <td className="border border-foreground p-1 w-14 text-center">10</td>
              <td className="border border-foreground p-0 w-16">
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  className="w-full h-full text-center bg-transparent outline-none p-1 focus:bg-accent"
                  value={collective}
                  onChange={(e) => setCollective(e.target.value)}
                />
              </td>
              <td className="border border-foreground p-0 w-16">
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  className="w-full h-full text-center bg-transparent outline-none p-1 focus:bg-accent"
                  value={collectiveCorrection}
                  onChange={(e) => setCollectiveCorrection(e.target.value)}
                />
              </td>
              <td className="border border-foreground p-1 w-14 text-center">{COLLECTIVE_COEF}</td>
              <td className="border border-foreground p-1 w-16 text-center font-semibold">
                {collectiveFinal ? collectiveFinal.toFixed(1) : ""}
              </td>
              <td className="border border-foreground p-1 w-32"></td>
              <td className="border border-foreground p-0 w-28">
                <input
                  className="w-full h-full bg-transparent outline-none p-1 focus:bg-accent"
                  value={collectiveRemarks}
                  onChange={(e) => setCollectiveRemarks(e.target.value)}
                />
              </td>
            </tr>
            <tr className="bg-secondary font-bold">
              <td className="border border-foreground p-1 text-center" colSpan={3}>Total</td>
              <td className="border border-foreground p-1 text-center">{GRAND_TOTAL_MAX}</td>
              <td className="border border-foreground p-1"></td>
              <td className="border border-foreground p-1"></td>
              <td className="border border-foreground p-1"></td>
              <td className="border border-foreground p-1 text-center">{grandTotal.toFixed(1)}</td>
              <td className="border border-foreground p-1"></td>
              <td className="border border-foreground p-1"></td>
            </tr>
          </tbody>
        </table>

        {/* Penalty + final score */}
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-7 mt-4 text-xs">
          <div className="space-y-1.5 leading-relaxed">
            <div className="font-semibold">To be deducted/penalty points</div>
            <div>Errors of course are penalised</div>
            <div>1st error &nbsp;&nbsp;&nbsp;= 0.5 Percentage point</div>
            <div>2nd error &nbsp;&nbsp;= 1 Percentage point</div>
            <div>3rd error &nbsp;&nbsp;&nbsp;= Elimination</div>
            <div>Two (2) points to be deducted per other error.</div>

            <div className="flex items-center gap-2 pt-2">
              <label className="font-medium">Course error:</label>
              <select
                className="border border-foreground bg-background px-2 py-1 outline-none focus:border-primary"
                value={courseError}
                onChange={(e) => setCourseError(parseFloat(e.target.value))}
              >
                {COURSE_ERRORS.map((c) => (
                  <option key={c.label} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">Other errors:</label>
              <input
                type="number"
                min={0}
                className="w-20 border border-foreground bg-background px-2 py-1 outline-none focus:border-primary"
                value={otherErrors}
                onChange={(e) => setOtherErrors(parseInt(e.target.value) || 0)}
              />
              <span className="text-muted-foreground">× -2 pts</span>
            </div>
          </div>

          <div>
            <div className="border border-foreground p-3 mt-9 min-h-[80px]">
              <div className="font-bold">TOTAL SCORE</div>
              <div className="font-bold text-lg mt-2">
                in % :{" "}
                {eliminated ? (
                  <span className="text-destructive">ELIMINATED</span>
                ) : (
                  <span className="text-primary">{percentage.toFixed(3)}%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-xs">
          <div>
            <div className="font-bold mb-1">Organisers:</div>
            <div className="text-muted-foreground italic">(exact address)</div>
            <textarea
              rows={3}
              className="w-full mt-1 border-b border-dotted border-foreground bg-transparent outline-none focus:border-primary resize-none"
              value={organisers}
              onChange={(e) => setOrganisers(e.target.value)}
            />
          </div>
          <div>
            <div className="font-bold mb-1">Signature of Judge:</div>
            <div className="border-b border-dotted border-foreground h-16"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Print / Save PDF
          </button>
          <button
            onClick={() => {
              if (confirm("Reset all scores?")) {
                setScores({});
                setCorrections({});
                setRemarks({});
                setCollective("");
                setCollectiveCorrection("");
                setCollectiveRemarks("");
                setCourseError(0);
                setOtherErrors(0);
              }
            }}
            className="border border-foreground px-4 py-2 text-sm font-medium hover:bg-accent transition"
          >
            Reset Scores
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
