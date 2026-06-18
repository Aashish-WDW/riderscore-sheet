"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DUMMY_EVENTS, DUMMY_RIDERS, DUMMY_ENTRIES, DUMMY_USERS, TEST_NAMES } from "@/lib/dummy-data";
import { ExternalLink } from "lucide-react";

export default function ShowjumpingJudgeDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"today" | "history">("today");

  if (!user || user.role !== "showjumping_judge") return null;

  const activeEvent = DUMMY_EVENTS.find((e) => e.status === "active");
  const myClasses   = activeEvent?.classes.filter((c) => c.judgeId === user.id && c.type === "showjumping") ?? [];
  const pastEvents  = DUMMY_EVENTS.filter((e) => e.status !== "active");

  const writer = activeEvent?.classes.find((c) => c.type === "showjumping")?.writerId
    ? DUMMY_USERS.find((u) => u.id === activeEvent.classes.find((c) => c.type === "showjumping")?.writerId)
    : null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Showjumping Judge</div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Judge <span className="italic text-highlight">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome, {user.name}</p>
      </div>

      {activeEvent && (
        <div className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary mb-1">Active Event</div>
            <div className="font-display text-lg">{activeEvent.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {activeEvent.date} · {myClasses.length} class{myClasses.length !== 1 ? "es" : ""} assigned
              {writer && <> · Writer: {writer.name}</>}
            </div>
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full bg-highlight/20 text-highlight">Live</span>
        </div>
      )}

      <div className="flex items-center gap-1 border-b border-border">
        {(["today", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm border-b-2 transition-colors -mb-px ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t === "today" ? "Today's Rounds" : "History"}
          </button>
        ))}
      </div>

      {tab === "today" && (
        <div className="space-y-4">
          {myClasses.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">No classes assigned to you in the active event.</p>
          )}
          {myClasses.map((cls) => {
            const entries = DUMMY_ENTRIES[cls.id] ?? [];
            return (
              <div key={cls.id} className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <div className="font-display text-lg">{cls.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cls.startTime} · {TEST_NAMES[cls.testId] ?? cls.testId}</div>
                  </div>
                  <Link href={`/scoring/sj/${cls.testId}`} target="_blank"
                    className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Open Scoring Sheet <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                <div className="divide-y divide-border">
                  {entries.map((rid, idx) => {
                    const rider = DUMMY_RIDERS.find((r) => r.id === rid);
                    return (
                      <div key={rid} className="px-5 py-3.5 flex items-center gap-4">
                        <span className="font-mono text-xs text-muted-foreground w-5">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{rider?.name}</div>
                          <div className="text-xs text-muted-foreground">{rider?.horse} · #{rider?.competitorNo}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "history" && (
        <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
          {pastEvents.flatMap((e) => e.classes.filter((c) => c.type === "showjumping")).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No past showjumping classes yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {pastEvents.map((ev) =>
                ev.classes.filter((c) => c.type === "showjumping").map((cls) => (
                  <div key={cls.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">{cls.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{ev.name} · {ev.date}</div>
                    </div>
                    <Link href={`/scoring/sj/${cls.testId}`} target="_blank" className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors">
                      Open
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
