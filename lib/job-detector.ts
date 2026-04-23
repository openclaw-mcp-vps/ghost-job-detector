import OpenAI from "openai";

import { getCompanyInsight, type CompanyInsight } from "@/lib/company-data";

export interface JobAnalysisInput {
  jobTitle: string;
  companyName: string;
  description: string;
  jobUrl?: string;
  careersUrl?: string;
}

export interface AnalysisSignal {
  id: string;
  label: string;
  category: "risk" | "positive";
  weight: number;
  evidence: string;
}

export interface JobAnalysisResult {
  legitimacyScore: number;
  riskBand: "High Ghost-Job Risk" | "Needs Verification" | "Likely Legitimate";
  confidence: number;
  summary: string;
  recommendations: string[];
  signals: AnalysisSignal[];
  companyInsight: CompanyInsight;
}

const riskPatterns = [
  {
    id: "evergreen_language",
    label: "Evergreen hiring language",
    regex: /(always hiring|future opportunities|talent community|continuous pipeline)/i,
    weight: 18
  },
  {
    id: "vague_scope",
    label: "Vague role scope",
    regex: /(other duties as assigned|wear many hats|dynamic environment|fast-paced)/i,
    weight: 12
  },
  {
    id: "no_salary",
    label: "No compensation signal",
    regex: /^(?!.*(\$\s?\d|salary|compensation|pay range|base pay)).*$/is,
    weight: 7
  },
  {
    id: "immediate_urgency",
    label: "Unusual urgency language",
    regex: /(urgent hire|start immediately|fill asap|immediate start)/i,
    weight: 9
  },
  {
    id: "bulk_applications",
    label: "Mass application bait language",
    regex: /(easy apply|quick apply|apply now in seconds|no interview required)/i,
    weight: 14
  }
] as const;

const positivePatterns = [
  {
    id: "clear_process",
    label: "Clear interview process",
    regex: /(interview process|hiring process|timeline|panel interview|final round)/i,
    weight: 8
  },
  {
    id: "named_team",
    label: "Specific team context",
    regex: /(report to|hiring manager|team lead|cross-functional partners)/i,
    weight: 8
  },
  {
    id: "specific_outcomes",
    label: "Outcome-driven responsibilities",
    regex: /(first 90 days|deliverables|key results|success metrics)/i,
    weight: 10
  }
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function detectUnrealisticCombo(description: string) {
  const normalized = description.toLowerCase();
  const evidence: string[] = [];
  let weight = 0;

  const juniorYearsMatch = normalized.match(/(entry|junior)[\s\S]{0,70}(\d{1,2})\+?\s*years?/i);
  if (juniorYearsMatch) {
    const years = Number(juniorYearsMatch[2]);
    if (years >= 4) {
      weight += 16;
      evidence.push(`Entry-level language paired with ${years}+ years required`);
    }
  }

  const techMentions = (
    normalized.match(
      /\b(react|next\.js|typescript|python|java|go|kubernetes|aws|gcp|azure|terraform|spark|hadoop|salesforce|figma|tableau)\b/g
    ) || []
  ).length;

  if (techMentions >= 10) {
    weight += 10;
    evidence.push(`Role asks for at least ${techMentions} major technologies`);
  }

  const seniorityConflict =
    /(entry|junior)/i.test(normalized) && /(staff|principal|director|lead)/i.test(normalized);

  if (seniorityConflict) {
    weight += 11;
    evidence.push("Conflicting seniority terms in one posting");
  }

  return {
    weight,
    evidence
  };
}

function computeConfidence(description: string, signals: AnalysisSignal[], companyConfidence: number) {
  const wordCount = description.trim().split(/\s+/).length;
  const detailScore = clamp(Math.round((wordCount / 400) * 45), 10, 45);
  const signalBalance = clamp(30 - Math.abs(signals.length - 5) * 3, 10, 30);
  const confidence = clamp(Math.round(detailScore + signalBalance + companyConfidence * 0.25), 25, 98);
  return confidence;
}

function getBand(score: number): JobAnalysisResult["riskBand"] {
  if (score >= 74) {
    return "Likely Legitimate";
  }
  if (score >= 52) {
    return "Needs Verification";
  }
  return "High Ghost-Job Risk";
}

function topRecommendations(signals: AnalysisSignal[], companyInsight: CompanyInsight) {
  const recommendations: string[] = [];

  if (signals.some((signal) => signal.id === "no_salary")) {
    recommendations.push("Ask for salary band and interview timeline before applying.");
  }

  if (signals.some((signal) => signal.id === "evergreen_language")) {
    recommendations.push(
      "Verify whether the role has an approved headcount for this quarter, not just an evergreen pipeline."
    );
  }

  if (companyInsight.openRolesEstimate !== null && companyInsight.openRolesEstimate < 5) {
    recommendations.push(
      "Cross-check the company LinkedIn hiring feed to confirm this role was posted in the last 30 days."
    );
  }

  recommendations.push(
    "Send a targeted outreach message to the listed hiring manager before spending time on a full application."
  );

  return recommendations.slice(0, 4);
}

async function generateAiSummary(
  input: JobAnalysisInput,
  legitimacyScore: number,
  riskBand: JobAnalysisResult["riskBand"],
  keySignals: AnalysisSignal[]
) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const topSignalSummary = keySignals
      .slice(0, 3)
      .map((signal) => `${signal.label} (${signal.category}, ${signal.weight})`)
      .join("; ");

    const completion = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content:
              "You are a concise hiring-risk analyst. Write one practical sentence for a job seeker."
          },
          {
            role: "user",
            content:
              `Job title: ${input.jobTitle}\nCompany: ${input.companyName}\nLegitimacy score: ${legitimacyScore}\nRisk band: ${riskBand}\nSignals: ${topSignalSummary}`
          }
        ]
      },
      {
        signal: AbortSignal.timeout(5000)
      }
    );

    return completion.choices[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function analyzeJobPosting(input: JobAnalysisInput): Promise<JobAnalysisResult> {
  const description = input.description.trim();
  const companyInsight = await getCompanyInsight(input.companyName, input.careersUrl || input.jobUrl);

  const signals: AnalysisSignal[] = [];
  let rawRisk = 0;
  let rawPositive = 0;

  for (const pattern of riskPatterns) {
    if (pattern.regex.test(description)) {
      signals.push({
        id: pattern.id,
        label: pattern.label,
        category: "risk",
        weight: pattern.weight,
        evidence: "Detected in posting copy"
      });
      rawRisk += pattern.weight;
    }
  }

  for (const pattern of positivePatterns) {
    if (pattern.regex.test(description)) {
      signals.push({
        id: pattern.id,
        label: pattern.label,
        category: "positive",
        weight: pattern.weight,
        evidence: "Detected in posting copy"
      });
      rawPositive += pattern.weight;
    }
  }

  const unrealisticCombo = detectUnrealisticCombo(description);
  if (unrealisticCombo.weight > 0) {
    signals.push({
      id: "unrealistic_combo",
      label: "Unrealistic requirement combination",
      category: "risk",
      weight: unrealisticCombo.weight,
      evidence: unrealisticCombo.evidence.join("; ")
    });
    rawRisk += unrealisticCombo.weight;
  }

  rawRisk += companyInsight.staleRoleRisk;

  const wordCount = description.split(/\s+/).filter(Boolean).length;
  if (wordCount < 120) {
    rawRisk += 9;
    signals.push({
      id: "thin_description",
      label: "Thin job description",
      category: "risk",
      weight: 9,
      evidence: `Only ${wordCount} words of role detail`
    });
  }

  // Logistic transform behaves like a lightweight calibrated classifier.
  const modelInput = rawRisk - rawPositive - 12;
  const riskProbability = 1 / (1 + Math.exp(-(modelInput / 14)));
  const riskScore = clamp(Math.round(riskProbability * 100), 3, 98);
  const legitimacyScore = 100 - riskScore;

  const riskBand = getBand(legitimacyScore);
  const confidence = computeConfidence(description, signals, companyInsight.confidence);
  const recommendations = topRecommendations(signals, companyInsight);

  const fallbackSummary =
    riskBand === "Likely Legitimate"
      ? "The posting includes enough concrete signals to justify applying, but still validate timeline and active headcount."
      : riskBand === "Needs Verification"
        ? "The posting is mixed: some concrete details exist, but there are enough warning signals to verify headcount before applying."
        : "This posting has multiple ghost-job patterns. Confirm budget approval and posting recency before spending application time.";

  const aiSummary = await generateAiSummary(input, legitimacyScore, riskBand, signals);

  return {
    legitimacyScore,
    riskBand,
    confidence,
    summary: aiSummary || fallbackSummary,
    recommendations,
    signals: signals.sort((a, b) => b.weight - a.weight),
    companyInsight
  };
}
