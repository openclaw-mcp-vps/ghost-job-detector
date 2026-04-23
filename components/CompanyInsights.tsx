"use client";

import { Activity, Building2, Globe, Radar } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanySignal {
  label: string;
  impact: number;
  detail: string;
}

interface CompanyInsight {
  company: string;
  openRolesEstimate: number | null;
  hiringVelocity: "high" | "normal" | "low" | "unknown";
  staleRoleRisk: number;
  confidence: number;
  dataSources: string[];
  signals: CompanySignal[];
  summary: string;
}

function velocityColor(velocity: CompanyInsight["hiringVelocity"]) {
  if (velocity === "high") {
    return "warning" as const;
  }
  if (velocity === "normal") {
    return "success" as const;
  }
  if (velocity === "low") {
    return "danger" as const;
  }
  return "default" as const;
}

export function CompanyInsights({ insight }: { insight: CompanyInsight }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="h-5 w-5 text-[#8cc2ff]" />
          Company Hiring Insight
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-[#d6e1ee]">{insight.summary}</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[#27364d] bg-[#0b1522] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8b9db6]">Open roles</p>
            <p className="mt-1 text-2xl font-semibold text-[#e6edf3]">
              {insight.openRolesEstimate ?? "Unknown"}
            </p>
          </div>
          <div className="rounded-lg border border-[#27364d] bg-[#0b1522] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8b9db6]">Hiring velocity</p>
            <div className="mt-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#8cc2ff]" />
              <Badge variant={velocityColor(insight.hiringVelocity)}>
                {insight.hiringVelocity.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="rounded-lg border border-[#27364d] bg-[#0b1522] p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8b9db6]">Stale role risk</p>
            <div className="mt-2 flex items-center gap-2">
              <Radar className="h-4 w-4 text-[#8cc2ff]" />
              <span className="font-semibold text-[#e6edf3]">{insight.staleRoleRisk}/100</span>
            </div>
          </div>
        </div>

        {insight.signals.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.12em] text-[#8b9db6]">Company Signals</p>
            {insight.signals.slice(0, 3).map((signal) => (
              <div
                key={`${signal.label}-${signal.impact}`}
                className="rounded-lg border border-[#27364d] bg-[#0b1522] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[#e6edf3]">{signal.label}</span>
                  <Badge variant={signal.impact > 0 ? "warning" : "success"}>
                    {signal.impact > 0 ? `+${signal.impact} risk` : `${signal.impact} risk`}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[#8b9db6]">{signal.detail}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b9db6]">
          <Globe className="h-3.5 w-3.5" />
          {insight.dataSources.length > 0
            ? `Sources: ${insight.dataSources.join(" · ")}`
            : "No public ATS sources found for this company"}
        </div>
      </CardContent>
    </Card>
  );
}
