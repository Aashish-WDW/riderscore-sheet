"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DUMMY_RIDERS, DUMMY_SESSIONS, DUMMY_EVENTS, DUMMY_ENTRIES, TEST_NAMES } from "@/lib/dummy-data";
import { Trophy, Calendar, ExternalLink } from "lucide-react";

const STATUS_CHIP: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  submitted: "bg-highlight/20 text-highlight",
  verified:  "bg-primary/10 text-primary",
};

export default function RiderDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "rider") return null;

  const myRider    = DUMMY_RIDERS.find((r) => r.userId === user.id);
  const mySessions = DUMMY_SESSIONS.filter((s) => s.riderId === myRider?.id);

  const upcomingEntries: { event: typeof DUMMY_EVENTS[0]; classObj: typeof DUMMY_EVENTS[0]["classes"][0] }[] = [];
  DUMMY_EVENTS.filter((e) => e.status !== "completed").forEach((ev) => {
    ev.classes.forEach((cls) => {
      if (myRider && (DUMMY_ENTRIES[cls.id] ?? []).includes(myRider.id)) {
        upcomingEntries.push({ event: ev, classObj: cls });
      }
    });
  });

  const verifiedSessions = mySessions.filter((s) => s.status === "verified");
  const bestScore = verifiedSessions.length ? Math.max(...verifiedSessions.map((s) => s.percentage)) : null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Rider</div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          My <span className="italic text-highlight">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome, {user.name}</p>
      </div>

      {myRider ? (
        <div className="bg-card border border-border rounded-xl p-6 shadow-soft">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Competitor No.", value: myRider.competitorNo },
              { label: "NF",             value: myRider.nf },
              { label: "Horse",          value: myRider.horse },
              { label: "Horse No.",      value: myRider.horseNo },
            ].map((f) => (
              <div key={f.label}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{f.label}</div>
                <div className="font-display text-lg">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 text-center text-sm text-muted-foreground shadow-soft">
          No rider profile found. Contact the show secretary to register.
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Upcoming Entries", value: upcomingEntries.length },
          { label: "Total Sessions",   value: mySessions.length },
          { label: "Best Score",       value: bestScore !== null ? `${bestScore.toFixed(2)}%` : "—" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-soft text-center">
            <div className="font-display text-3xl tabular-nums">{s.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg">Upcoming Entries</h2>
        </div>
        {upcomingEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No upcoming entries.</p>
        ) : (
          <div className="divide-y divide-border">
            {upcomingEntries.map(({ event, classObj }) => (
              <div key={classObj.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{classObj.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{event.name} · {event.date} · {classObj.startTime}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{TEST_NAMES[classObj.testId] ?? classObj.testId}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${event.status === "active" ? "bg-highlight/20 text-highlight" : "bg-muted text-muted-foreground"}`}>
                    {event.status}
                  </span>
                  <Link href={classObj.type === "showjumping" ? `/scoring/sj/${classObj.testId}` : `/scoring/${classObj.testId}`} target="_blank"
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                  >
                    Test <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Trophy className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-lg">My Results</h2>
        </div>
        {mySessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No scored sessions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Test</th>
                <th className="text-left px-5 py-3">Event</th>
                <th className="text-center px-5 py-3">Score</th>
                <th className="text-center px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mySessions.map((s) => {
                const event = DUMMY_EVENTS.find((e) => e.id === s.eventId);
                return (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">{TEST_NAMES[s.testId] ?? s.testId}</td>
                    <td className="px-5 py-3 text-muted-foreground text-xs max-w-[160px] truncate">{event?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-center font-display tabular-nums text-highlight">
                      {s.percentage > 0 ? `${s.percentage.toFixed(2)}%` : "—"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${STATUS_CHIP[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
