"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Signal {
  id: string;
  label: string;
  category: "risk" | "positive";
  weight: number;
  evidence: string;
}

interface ScoreCardProps {
  legitimacyScore: number;
  confidence: number;
  riskBand: "High Ghost-Job Risk" | "Needs Verification" | "Likely Legitimate";
  summary: string;
  signals: Signal[];
}

function getScoreColor(score: number) {
  if (score >= 74) {
    return "#3fb950";
  }
  if (score >= 52) {
    return "#f2cc60";
  }
  return "#ff6b6b";
}

function getBandBadgeVariant(band: ScoreCardProps["riskBand"]) {
  if (band === "Likely Legitimate") {
    return "success" as const;
  }
  if (band === "Needs Verification") {
    return "warning" as const;
  }
  return "danger" as const;
}

function BandIcon({ band }: { band: ScoreCardProps["riskBand"] }) {
  if (band === "Likely Legitimate") {
    return <CheckCircle2 className="h-4 w-4" />;
  }
  if (band === "Needs Verification") {
    return <AlertTriangle className="h-4 w-4" />;
  }
  return <ShieldAlert className="h-4 w-4" />;
}

export function ScoreCard({ legitimacyScore, confidence, riskBand, summary, signals }: ScoreCardProps) {
  const color = getScoreColor(legitimacyScore);
  const chartData = [{ name: "legitimacy", value: legitimacyScore, fill: color }];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl">Legitimacy Score</CardTitle>
          <p className="mt-1 text-sm text-[#8b9db6]">
            Confidence {confidence}% based on posting language and company hiring signals.
          </p>
        </div>
        <Badge variant={getBandBadgeVariant(riskBand)} className="gap-1.5 text-xs">
          <BandIcon band={riskBand} />
          {riskBand}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={chartData}
              innerRadius="66%"
              outerRadius="100%"
              startAngle={210}
              endAngle={-30}
              barSize={20}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={10} />
              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fill: "#e6edf3", fontSize: "2rem", fontWeight: 700 }}
              >
                {legitimacyScore}
              </text>
              <text
                x="50%"
                y="61%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fill: "#8b9db6", fontSize: "0.8rem", fontWeight: 500 }}
              >
                out of 100
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[#d6e1ee]">{summary}</p>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8b9db6]">Top Signals</p>
            {signals.slice(0, 4).map((signal) => (
              <div
                key={`${signal.id}-${signal.label}`}
                className="rounded-lg border border-[#253247] bg-[#0b1522] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#e6edf3]">{signal.label}</span>
                  <Badge variant={signal.category === "risk" ? "danger" : "success"}>
                    {signal.category === "risk" ? `+${signal.weight} risk` : `-${signal.weight} risk`}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#8b9db6]">{signal.evidence}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
