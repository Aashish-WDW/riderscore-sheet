"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DUMMY_EVENTS, DUMMY_RIDERS, DUMMY_SESSIONS, DUMMY_ENTRIES, ShowEvent, TEST_NAMES } from "@/lib/dummy-data";
import { Calendar, Users, Plus, ChevronDown, ChevronUp, ExternalLink, X } from "lucide-react";

const STATUS_CHIP: Record<string, string> = {
  upcoming:  "bg-muted text-muted-foreground",
  active:    "bg-highlight/20 text-highlight",
  completed: "bg-primary/10 text-primary",
  submitted: "bg-highlight/20 text-highlight",
  verified:  "bg-primary/10 text-primary",
  draft:     "bg-muted text-muted-foreground",
};

function EventCard({ ev }: { ev: ShowEvent }) {
  const [open, setOpen] = useState(ev.status === "active");
  const totalEntries = ev.classes.reduce((n, c) => n + (DUMMY_ENTRIES[c.id]?.length ?? 0), 0);

  return (
    <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
      <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors text-left" onClick={() => setOpen((o) => !o)}>
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display text-lg">{ev.name}</span>
            <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${STATUS_CHIP[ev.status]}`}>{ev.status}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{ev.date} · {ev.location} · {ev.classes.length} classes · {totalEntries} entries</div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          {ev.classes.map((cls) => {
            const entries = DUMMY_ENTRIES[cls.id] ?? [];
            const sessions = DUMMY_SESSIONS.filter((s) => s.classId === cls.id);
            return (
              <div key={cls.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <div>
                    <div className="text-sm font-medium">{cls.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cls.startTime} · {TEST_NAMES[cls.testId] ?? cls.testId} · {entries.length} riders</div>
                  </div>
                  <Link href={cls.type === "showjumping" ? `/scoring/sj/${cls.testId}` : `/scoring/${cls.testId}`} target="_blank" className="shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors">
                    Open Sheet <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                {entries.length > 0 && (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="text-left px-3 py-2">No.</th>
                          <th className="text-left px-3 py-2">Rider</th>
                          <th className="text-left px-3 py-2">Horse</th>
                          <th className="text-center px-3 py-2">Score</th>
                          <th className="text-center px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {entries.map((rid) => {
                          const rider = DUMMY_RIDERS.find((r) => r.id === rid);
                          const session = sessions.find((s) => s.riderId === rid);
                          return (
                            <tr key={rid} className="hover:bg-muted/20">
                              <td className="px-3 py-2 text-muted-foreground">{rider?.competitorNo}</td>
                              <td className="px-3 py-2 font-medium">{rider?.name}</td>
                              <td className="px-3 py-2 text-muted-foreground">{rider?.horse}</td>
                              <td className="px-3 py-2 text-center font-display tabular-nums text-highlight">
                                {session?.percentage ? `${session.percentage.toFixed(2)}%` : "—"}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${session ? (STATUS_CHIP[session.status] ?? "") : "bg-muted text-muted-foreground"}`}>
                                  {session?.status ?? "pending"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SecretaryDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"events" | "riders">("events");
  const [showAddRider, setShowAddRider] = useState(false);
  const [newRider, setNewRider] = useState({ name: "", nf: "", competitorNo: "", horse: "", horseNo: "" });

  if (!user || user.role !== "show_secretary") return null;

  const active    = DUMMY_EVENTS.filter((e) => e.status === "active").length;
  const upcoming  = DUMMY_EVENTS.filter((e) => e.status === "upcoming").length;
  const completed = DUMMY_EVENTS.filter((e) => e.status === "completed").length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Show Secretary</div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Secretary <span className="italic text-highlight">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active",    value: active,    color: "text-highlight" },
          { label: "Upcoming",  value: upcoming,  color: "text-foreground" },
          { label: "Completed", value: completed, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-soft text-center">
            <div className={`font-display text-3xl tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 border-b border-border">
        {(["events", "riders"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors -mb-px ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "events" ? <Calendar className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <div className="ml-auto mb-1">
          <button onClick={() => tab === "riders" && setShowAddRider(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-3.5 w-3.5" />
            {tab === "events" ? "New Event" : "Add Rider"}
          </button>
        </div>
      </div>

      {tab === "events" && (
        <div className="space-y-4">
          {DUMMY_EVENTS.map((ev) => <EventCard key={ev.id} ev={ev} />)}
        </div>
      )}

      {tab === "riders" && (
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
              {DUMMY_RIDERS.map((r) => {
                const sessions = DUMMY_SESSIONS.filter((s) => s.riderId === r.id);
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-muted-foreground">{r.competitorNo}</td>
                    <td className="px-5 py-3 font-medium">{r.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.nf}</td>
                    <td className="px-5 py-3">{r.horse}</td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">{r.horseNo}</td>
                    <td className="px-5 py-3 text-center"><span className="font-display text-sm tabular-nums">{sessions.length}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddRider && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl">Add Rider</h2>
              <button onClick={() => setShowAddRider(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Rider Name</label>
                <input value={newRider.name} onChange={(e) => setNewRider((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" placeholder="Jane Smith" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">NF</label>
                  <input value={newRider.nf} onChange={(e) => setNewRider((p) => ({ ...p, nf: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" placeholder="IND" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Competitor No.</label>
                  <input value={newRider.competitorNo} onChange={(e) => setNewRider((p) => ({ ...p, competitorNo: e.target.value }))}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" placeholder="109" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Horse Name</label>
                <input value={newRider.horse} onChange={(e) => setNewRider((p) => ({ ...p, horse: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" placeholder="Starlight" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddRider(false)} className="flex-1 border border-border rounded-lg py-2.5 text-sm hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => setShowAddRider(false)} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">Add Rider</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
