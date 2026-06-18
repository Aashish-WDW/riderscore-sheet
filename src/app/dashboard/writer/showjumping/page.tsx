"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DUMMY_EVENTS, DUMMY_RIDERS, DUMMY_ENTRIES, DUMMY_USERS, TEST_NAMES } from "@/lib/dummy-data";
import { ExternalLink, Pen } from "lucide-react";

export default function ShowjumpingWriterDashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "showjumping_writer") return null;

  const activeEvent = DUMMY_EVENTS.find((e) => e.status === "active");
  const myClasses   = activeEvent?.classes.filter((c) => c.writerId === user.id && c.type === "showjumping") ?? [];
  const judge       = myClasses[0]?.judgeId ? DUMMY_USERS.find((u) => u.id === myClasses[0].judgeId) : null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">Showjumping Writer</div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Writer <span className="italic text-highlight">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome, {user.name}</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display text-lg">Today&apos;s Ride List</h2>
          {activeEvent && <p className="text-xs text-muted-foreground mt-0.5">{activeEvent.name}{judge && <> · Judge: {judge.name}</>}</p>}
        </div>
        {myClasses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No classes assigned.</p>
        ) : (
          <div className="divide-y divide-border">
            {myClasses.map((cls) => {
              const entries = DUMMY_ENTRIES[cls.id] ?? [];
              return (
                <div key={cls.id}>
                  <div className="px-5 py-3 bg-muted/40 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{cls.name}</span>
                      <span className="text-xs text-muted-foreground ml-3">{cls.startTime}</span>
                      <span className="text-xs text-muted-foreground ml-3">{TEST_NAMES[cls.testId] ?? cls.testId}</span>
                    </div>
                    <Link href={`/scoring/sj/${cls.testId}`} target="_blank"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
                    >
                      Sheet <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  {entries.map((rid, idx) => {
                    const rider = DUMMY_RIDERS.find((r) => r.id === rid);
                    return (
                      <div key={rid} className="px-5 py-3 flex items-center gap-4 hover:bg-muted/20">
                        <span className="font-mono text-xs text-muted-foreground w-5">{idx + 1}</span>
                        <div className="flex-1">
                          <div className="text-sm">{rider?.name}</div>
                          <div className="text-xs text-muted-foreground">{rider?.horse}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {myClasses.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-soft">
          <Pen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <div className="font-display text-lg mb-1">No Active Session</div>
          <p className="text-sm text-muted-foreground">Waiting for the judge to begin a showjumping class.</p>
        </div>
      )}
    </div>
  );
}
