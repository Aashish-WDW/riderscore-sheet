"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  DUMMY_RIDERS, DUMMY_EVENTS, DUMMY_SESSIONS, DUMMY_ENTRIES,
  type Rider, type ScoringSession,
  TEST_CARDS, TEST_NAMES, ROLE_LABELS, ROLE_DASHBOARD,
} from "@/lib/dummy-data";
import {
  ExternalLink, Search, Calendar, Users, FileText,
  CheckCircle, Clock, FileEdit, ChevronRight, Trophy,
  LayoutDashboard, Layers, Plus, X, Loader2,
} from "lucide-react";

type Tab = "overview" | "sheets" | "riders" | "sessions";

const STATUS_CHIP: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  submitted: "bg-highlight/20 text-highlight",
  verified:  "bg-primary/10 text-primary",
  upcoming:  "bg-muted text-muted-foreground",
  active:    "bg-highlight/20 text-highlight",
  completed: "bg-primary/10 text-primary",
};

function SessionStatusIcon({ status }: { status: ScoringSession["status"] }) {
  if (status === "verified")  return <CheckCircle className="h-3.5 w-3.5 text-highlight" />;
  if (status === "submitted") return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  return <FileEdit className="h-3.5 w-3.5 text-muted-foreground/40" />;
}

const EMPTY_RIDER_FORM = { name: "", nf: "", competitorNo: "", horse: "", horseNo: "" };

export default function HubPage() {
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>("overview");
  const [sheetKind, setSheetKind] = useState<"dressage" | "showjumping">("dressage");
  const [riderSearch, setRiderSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState<"all" | ScoringSession["status"]>("all");
  const [allRiders, setAllRiders] = useState<Rider[]>(DUMMY_RIDERS);
  const [allSessions] = useState<ScoringSession[]>(DUMMY_SESSIONS);
  const [showAddRider, setShowAddRider] = useState(false);
  const [riderForm, setRiderForm] = useState(EMPTY_RIDER_FORM);
  const [riderFormError, setRiderFormError] = useState("");
  const [riderFormSaving, setRiderFormSaving] = useState(false);

  if (!user) return null;

  const activeEvent = DUMMY_EVENTS.find((e) => e.status === "active");
  const pending  = allSessions.filter((s) => s.status === "submitted").length;
  const verified = allSessions.filter((s) => s.status === "verified").length;

  const filteredRiders = allRiders.filter(
    (r) =>
      r.name.toLowerCase().includes(riderSearch.toLowerCase()) ||
      r.horse.toLowerCase().includes(riderSearch.toLowerCase()) ||
      r.competitorNo.includes(riderSearch)
  );

  const filteredSessions =
    sessionFilter === "all" ? allSessions : allSessions.filter((s) => s.status === sessionFilter);

  const roleDash = ROLE_DASHBOARD[user.role];

  const stats = [
    { label: "Active Events",     value: DUMMY_EVENTS.filter((e) => e.status === "active").length, icon: Calendar },
    { label: "Registered Riders", value: allRiders.length,                                          icon: Users },
    { label: "Pending Review",    value: pending,                                                    icon: Clock },
    { label: "Verified Sheets",   value: verified,                                                   icon: CheckCircle },
  ];

  const quickActions = [
    { label: "My Dashboard",   href: roleDash,                   icon: LayoutDashboard, accent: "border-primary/30 hover:bg-primary/5" },
    { label: "All Riders",     action: () => setTab("riders"),   icon: Users,           accent: "border-border hover:bg-muted" },
    { label: "Scoring Sheets", action: () => setTab("sheets"),   icon: Layers,          accent: "border-border hover:bg-muted" },
    { label: "Saved Scores",   action: () => setTab("sessions"), icon: FileText,        accent: "border-border hover:bg-muted" },
    ...(activeEvent ? [{ label: activeEvent.name, href: roleDash, icon: Trophy, accent: "border-highlight/30 hover:bg-highlight/5 text-highlight" }] : []),
  ];

  const handleAddRider = () => {
    if (!riderForm.name.trim()) { setRiderFormError("Rider name is required."); return; }
    if (!riderForm.competitorNo.trim()) { setRiderFormError("Competitor number is required."); return; }
    setRiderFormSaving(true);
    setTimeout(() => {
      const newRider: Rider = {
        id: `r${Date.now()}`,
        name: riderForm.name.trim(),
        nf: riderForm.nf.trim(),
        competitorNo: riderForm.competitorNo.trim(),
        horse: riderForm.horse.trim(),
        horseNo: riderForm.horseNo.trim(),
      };
      setAllRiders((prev) => [...prev, newRider]);
      setRiderForm(EMPTY_RIDER_FORM);
      setRiderFormError("");
      setShowAddRider(false);
      setRiderFormSaving(false);
    }, 400);
  };

  return (
    <div className="p-5 md:p-8 max-w-6xl mx-auto space-y-6">

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">{ROLE_LABELS[user.role]}</div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight">
            Welcome back, <span className="italic text-highlight">{user.name.split(" ")[0]}</span>
          </h1>
          {activeEvent && (
            <p className="text-sm text-muted-foreground mt-1">
              Active event: <span className="text-foreground font-medium">{activeEvent.name}</span> · {activeEvent.date}
            </p>
          )}
        </div>
        <Link href={roleDash} className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
          <LayoutDashboard className="h-4 w-4" /> My Dashboard <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="font-display text-3xl tabular-nums">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-0.5 border-b border-border overflow-x-auto">
        {(["overview", "sheets", "riders", "sessions"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors -mb-px ${
              tab === t ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "overview" ? "Overview" : t === "sheets" ? "Scoring Sheets" : t === "riders" ? "Riders" : "Saved Scores"}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg mb-3">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {quickActions.map((a) => {
                const Icon = a.icon;
                const inner = (<><Icon className="h-5 w-5 mb-2 text-muted-foreground" /><span className="text-xs font-medium text-center leading-tight">{a.label}</span></>);
                return "href" in a ? (
                  <Link key={a.label} href={a.href} className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-colors ${a.accent}`}>{inner}</Link>
                ) : (
                  <button key={a.label} onClick={a.action} className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-colors ${a.accent}`}>{inner}</button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-base">Events</h2>
                <span className="text-xs text-muted-foreground">{DUMMY_EVENTS.length} total</span>
              </div>
              <div className="divide-y divide-border">
                {DUMMY_EVENTS.map((ev) => (
                  <div key={ev.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{ev.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{ev.date} · {ev.classes.length} classes</div>
                    </div>
                    <span className={`shrink-0 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${STATUS_CHIP[ev.status]}`}>{ev.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-display text-base">Recent Sessions</h2>
                <button onClick={() => setTab("sessions")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  See all <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="divide-y divide-border">
                {allSessions.slice(0, 4).map((s) => {
                  const rider = allRiders.find((r) => r.id === s.riderId);
                  return (
                    <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                      <SessionStatusIcon status={s.status} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{rider?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{TEST_NAMES[s.testId] ?? s.testId} · {rider?.horse ?? "—"}</div>
                      </div>
                      <div className="font-display tabular-nums text-highlight text-sm shrink-0">
                        {s.percentage > 0 ? `${s.percentage.toFixed(2)}%` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-base">Riders</h2>
              <button onClick={() => setTab("riders")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                All {allRiders.length} <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-2.5">No.</th>
                    <th className="text-left px-5 py-2.5">Rider</th>
                    <th className="text-left px-5 py-2.5">NF</th>
                    <th className="text-left px-5 py-2.5">Horse</th>
                    <th className="text-center px-5 py-2.5">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allRiders.slice(0, 5).map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{r.competitorNo}</td>
                      <td className="px-5 py-2.5 font-medium">{r.name}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{r.nf}</td>
                      <td className="px-5 py-2.5">{r.horse}</td>
                      <td className="px-5 py-2.5 text-center font-display tabular-nums text-sm">{allSessions.filter((s) => s.riderId === r.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SCORING SHEETS */}
      {tab === "sheets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground">Open any scoring sheet to start scoring. Scores auto-save as you go.</p>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(["dressage", "showjumping"] as const).map((k) => (
                <button key={k} onClick={() => setSheetKind(k)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors capitalize ${sheetKind === k ? "bg-card shadow-soft text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {k === "dressage" ? "Dressage" : "Show Jumping"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEST_CARDS.filter((t) => (t.kind ?? "dressage") === sheetKind).map((t) => {
              const riderCount = activeEvent
                ? activeEvent.classes.filter((c) => c.testId === t.slug).reduce((n, c) => n + (DUMMY_ENTRIES[c.id]?.length ?? 0), 0)
                : 0;
              const href = t.kind === "showjumping" ? `/scoring/sj/${t.slug}` : `/scoring/${t.slug}`;
              return (
                <div key={t.slug} className="bg-card border border-border rounded-xl p-5 shadow-soft flex flex-col gap-3 hover:border-foreground/20 transition-colors">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{t.appendix}</div>
                    <div className="font-display text-xl tracking-tight">{t.category}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-snug">{t.description}</div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      {t.kind === "showjumping" ? "Fault & time based" : <>Max <span className="font-mono">{t.maxScore}</span> pts</>}
                      {riderCount > 0 && <> · <span className="text-foreground">{riderCount} riders today</span></>}
                    </div>
                    <Link href={href} target="_blank"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RIDERS */}
      {tab === "riders" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input type="text" placeholder="Search by name, horse or number…" value={riderSearch}
                onChange={(e) => setRiderSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <span className="text-xs text-muted-foreground">{filteredRiders.length} of {allRiders.length}</span>
            <button onClick={() => { setShowAddRider(true); setRiderFormError(""); }}
              className="ml-auto flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" /> Add Rider
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">No.</th>
                  <th className="text-left px-5 py-3">Rider</th>
                  <th className="text-left px-5 py-3">NF</th>
                  <th className="text-left px-5 py-3">Horse</th>
                  <th className="text-left px-5 py-3">H.No</th>
                  <th className="text-center px-5 py-3">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRiders.map((r) => {
                  const sessions = allSessions.filter((s) => s.riderId === r.id);
                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.competitorNo}</td>
                      <td className="px-5 py-3 font-medium">{r.name}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.nf}</td>
                      <td className="px-5 py-3">{r.horse}</td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r.horseNo}</td>
                      <td className="px-5 py-3 text-center font-display tabular-nums">{sessions.length}</td>
                    </tr>
                  );
                })}
                {filteredRiders.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">No riders match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SESSIONS */}
      {tab === "sessions" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "draft", "submitted", "verified"] as const).map((f) => (
              <button key={f} onClick={() => setSessionFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${sessionFilter === f ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== "all" && <span className="ml-1.5 opacity-60">{allSessions.filter((s) => s.status === f).length}</span>}
              </button>
            ))}
            <span className="text-xs text-muted-foreground ml-auto">{filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
            {filteredSessions.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No sessions found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3">Rider</th>
                    <th className="text-left px-5 py-3">Horse</th>
                    <th className="text-left px-5 py-3">Test</th>
                    <th className="text-left px-5 py-3">Event</th>
                    <th className="text-center px-5 py-3">Score</th>
                    <th className="text-center px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Sheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSessions.map((s) => {
                    const rider = allRiders.find((r) => r.id === s.riderId);
                    const event = DUMMY_EVENTS.find((e) => e.id === s.eventId);
                    return (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium">{rider?.name ?? "—"}</td>
                        <td className="px-5 py-3 text-muted-foreground">{rider?.horse ?? "—"}</td>
                        <td className="px-5 py-3 text-muted-foreground">{TEST_NAMES[s.testId] ?? s.testId}</td>
                        <td className="px-5 py-3 text-muted-foreground text-xs max-w-[140px] truncate">{event?.name ?? "—"}</td>
                        <td className="px-5 py-3 text-center font-display tabular-nums text-highlight">{s.percentage > 0 ? `${s.percentage.toFixed(2)}%` : "—"}</td>
                        <td className="px-5 py-3 text-center">
                          <span className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider font-medium">
                            <SessionStatusIcon status={s.status} /> {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/scoring/${s.testId}`} target="_blank" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                            Open <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ADD RIDER MODAL */}
      {showAddRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display text-lg">Add New Rider</h2>
              <button onClick={() => { setShowAddRider(false); setRiderForm(EMPTY_RIDER_FORM); setRiderFormError(""); }}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"><X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Rider Name <span className="text-destructive">*</span></label>
                  <input type="text" value={riderForm.name} onChange={(e) => setRiderForm({ ...riderForm, name: e.target.value })} placeholder="Full name"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Competitor No. <span className="text-destructive">*</span></label>
                  <input type="text" value={riderForm.competitorNo} onChange={(e) => setRiderForm({ ...riderForm, competitorNo: e.target.value })} placeholder="e.g. 109"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">NF / Country</label>
                  <input type="text" value={riderForm.nf} onChange={(e) => setRiderForm({ ...riderForm, nf: e.target.value })} placeholder="e.g. IND"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Horse Name</label>
                  <input type="text" value={riderForm.horse} onChange={(e) => setRiderForm({ ...riderForm, horse: e.target.value })} placeholder="Horse name"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Horse No.</label>
                  <input type="text" value={riderForm.horseNo} onChange={(e) => setRiderForm({ ...riderForm, horseNo: e.target.value })} placeholder="e.g. H09"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              {riderFormError && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{riderFormError}</p>}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => { setShowAddRider(false); setRiderForm(EMPTY_RIDER_FORM); setRiderFormError(""); }}
                className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleAddRider} disabled={riderFormSaving}
                className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                {riderFormSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Add Rider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
