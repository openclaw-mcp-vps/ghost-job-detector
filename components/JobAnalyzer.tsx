"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { CompanyInsights } from "@/components/CompanyInsights";
import { ScoreCard } from "@/components/ScoreCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { pushHistoryEntry } from "@/lib/history";

interface AnalyzeResponse {
  legitimacyScore: number;
  riskBand: "High Ghost-Job Risk" | "Needs Verification" | "Likely Legitimate";
  confidence: number;
  summary: string;
  recommendations: string[];
  signals: Array<{
    id: string;
    label: string;
    category: "risk" | "positive";
    weight: number;
    evidence: string;
  }>;
  companyInsight: {
    company: string;
    openRolesEstimate: number | null;
    hiringVelocity: "high" | "normal" | "low" | "unknown";
    staleRoleRisk: number;
    confidence: number;
    dataSources: string[];
    signals: Array<{ label: string; impact: number; detail: string }>;
    summary: string;
  };
}

export function JobAnalyzer() {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const wordCount = useMemo(
    () => description.trim().split(/\s+/).filter(Boolean).length,
    [description]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (wordCount < 60) {
      setError("Add at least 60 words from the posting for a reliable score.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          companyName,
          jobUrl,
          description
        })
      });

      if (!response.ok) {
        const failure = (await response.json()) as { error?: string };
        throw new Error(failure.error || "Analysis failed");
      }

      const payload = (await response.json()) as AnalyzeResponse;
      setResult(payload);

      pushHistoryEntry({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        jobTitle,
        companyName,
        jobUrl,
        legitimacyScore: payload.legitimacyScore,
        riskBand: payload.riskBand,
        confidence: payload.confidence,
        topSignals: payload.signals.slice(0, 3).map((signal) => signal.label)
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-5 w-5 text-[#8cc2ff]" />
            Analyze a Job Posting
          </CardTitle>
          <CardDescription>
            Paste the full posting to detect evergreen requisitions, vague language, and mismatch patterns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d6e1ee]" htmlFor="jobTitle">
                  Job title
                </label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  required
                  placeholder="Senior Product Designer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#d6e1ee]" htmlFor="companyName">
                  Company
                </label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  required
                  placeholder="Acme Health"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#d6e1ee]" htmlFor="jobUrl">
                Job URL
              </label>
              <Input
                id="jobUrl"
                value={jobUrl}
                onChange={(event) => setJobUrl(event.target.value)}
                type="url"
                placeholder="https://company.com/careers/job-123"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#d6e1ee]" htmlFor="description">
                Job description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                placeholder="Paste the full responsibilities, requirements, and hiring process details."
              />
              <p className="text-xs text-[#8b9db6]">
                {wordCount} words. Reliable analysis starts at 60+ words.
              </p>
            </div>

            {error && <p className="text-sm text-[#ff9aa2]">{error}</p>}

            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scoring posting
                </>
              ) : (
                "Run Ghost-Job Analysis"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <ScoreCard
            legitimacyScore={result.legitimacyScore}
            riskBand={result.riskBand}
            confidence={result.confidence}
            summary={result.summary}
            signals={result.signals}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.recommendations.map((recommendation) => (
                <div
                  key={recommendation}
                  className="rounded-lg border border-[#26344a] bg-[#0b1522] px-3 py-2 text-sm text-[#d6e1ee]"
                >
                  {recommendation}
                </div>
              ))}
            </CardContent>
          </Card>

          <CompanyInsights insight={result.companyInsight} />
        </div>
      )}
    </div>
  );
}
