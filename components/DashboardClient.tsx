"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarClock, ShieldAlert } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type HistoryEntry, readHistory } from "@/lib/history";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric"
});

function riskVariant(riskBand: string) {
  if (riskBand === "Likely Legitimate") {
    return "success" as const;
  }
  if (riskBand === "Needs Verification") {
    return "warning" as const;
  }
  return "danger" as const;
}

export function DashboardClient() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const chartData = useMemo(
    () =>
      history
        .slice(0, 10)
        .reverse()
        .map((entry) => ({
          label: `${entry.companyName.slice(0, 12)}`,
          score: entry.legitimacyScore
        })),
    [history]
  );

  const highRiskCount = history.filter((entry) => entry.riskBand === "High Ghost-Job Risk").length;
  const averageScore =
    history.length > 0
      ? Math.round(history.reduce((sum, entry) => sum + entry.legitimacyScore, 0) / history.length)
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-[#8b9db6]">
              <Activity className="h-4 w-4 text-[#8cc2ff]" />
              Analyses run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#e6edf3]">{history.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-[#8b9db6]">
              <ShieldAlert className="h-4 w-4 text-[#ff9aa2]" />
              High-risk postings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#e6edf3]">{highRiskCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-[#8b9db6]">
              <CalendarClock className="h-4 w-4 text-[#8cc2ff]" />
              Average score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#e6edf3]">{averageScore}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent score trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-[#8b9db6]">Run analyses from the Analyze page to populate your dashboard.</p>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#283548" />
                  <XAxis dataKey="label" stroke="#8b9db6" />
                  <YAxis stroke="#8b9db6" domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: "rgba(47,129,247,0.1)" }}
                    contentStyle={{ background: "#111a27", border: "1px solid #283548", color: "#e6edf3" }}
                  />
                  <Bar dataKey="score" fill="#2f81f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Analyzed jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-[#8b9db6]">No tracked jobs yet. Analyze your first posting to start tracking.</p>
          )}

          {history.map((entry) => (
            <div
              key={entry.id}
              className="rounded-lg border border-[#253247] bg-[#0b1522] px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-[#e6edf3]">{entry.jobTitle}</p>
                  <p className="text-sm text-[#8b9db6]">{entry.companyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={riskVariant(entry.riskBand)}>{entry.riskBand}</Badge>
                  <span className="text-sm font-semibold text-[#e6edf3]">{entry.legitimacyScore}/100</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#8b9db6]">
                <span>{dateFormat.format(new Date(entry.createdAt))}</span>
                <span>Confidence {entry.confidence}%</span>
                {entry.topSignals.length > 0 && <span>Signals: {entry.topSignals.join(" · ")}</span>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
