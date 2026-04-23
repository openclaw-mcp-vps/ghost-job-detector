import * as cheerio from "cheerio";

export type HiringVelocity = "high" | "normal" | "low" | "unknown";

export interface CompanyInsightSignal {
  label: string;
  impact: number;
  detail: string;
}

export interface CompanyInsight {
  company: string;
  openRolesEstimate: number | null;
  hiringVelocity: HiringVelocity;
  staleRoleRisk: number;
  confidence: number;
  dataSources: string[];
  signals: CompanyInsightSignal[];
  summary: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "");
}

function scoreVelocity(roles: number | null): HiringVelocity {
  if (roles === null) {
    return "unknown";
  }
  if (roles > 120) {
    return "high";
  }
  if (roles >= 20) {
    return "normal";
  }
  return "low";
}

async function fetchGreenhouseCount(companyName: string) {
  const slug = slugify(companyName);
  if (!slug) {
    return null;
  }

  try {
    const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, {
      headers: { "User-Agent": "ghost-job-detector/1.0" },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { jobs?: unknown[] };
    return payload.jobs?.length ?? null;
  } catch {
    return null;
  }
}

async function fetchLeverCount(companyName: string) {
  const slug = slugify(companyName);
  if (!slug) {
    return null;
  }

  try {
    const response = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, {
      headers: { "User-Agent": "ghost-job-detector/1.0" },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown[];
    return payload.length;
  } catch {
    return null;
  }
}

async function scrapeCareersIndicators(url?: string | null) {
  if (!url) {
    return {
      staleRisk: null,
      signal: null as CompanyInsightSignal | null,
      source: null as string | null
    };
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "ghost-job-detector/1.0" },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return {
        staleRisk: null,
        signal: null,
        source: null
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const text = $("body").text().toLowerCase();

    const signals: RegExp[] = [
      /always hiring/,
      /join our talent community/,
      /future opportunities/,
      /apply for future roles/
    ];

    const matched = signals.some((pattern) => pattern.test(text));

    if (matched) {
      return {
        staleRisk: 18,
        signal: {
          label: "Evergreen language on careers page",
          impact: 18,
          detail:
            "Company careers content emphasizes a continuous pipeline rather than role-specific openings."
        },
        source: url
      };
    }

    return {
      staleRisk: 0,
      signal: {
        label: "Role-specific language detected",
        impact: -6,
        detail:
          "Careers page appears to focus on concrete openings instead of generic talent pooling."
      },
      source: url
    };
  } catch {
    return {
      staleRisk: null,
      signal: null,
      source: null
    };
  }
}

export async function getCompanyInsight(companyName: string, careersUrl?: string | null) {
  const trimmed = companyName.trim();
  const dataSources: string[] = [];
  const signals: CompanyInsightSignal[] = [];

  const [greenhouseCount, leverCount, pageIndicator] = await Promise.all([
    fetchGreenhouseCount(trimmed),
    fetchLeverCount(trimmed),
    scrapeCareersIndicators(careersUrl)
  ]);

  if (greenhouseCount !== null) {
    dataSources.push("Greenhouse board API");
  }

  if (leverCount !== null) {
    dataSources.push("Lever postings API");
  }

  if (pageIndicator.source) {
    dataSources.push(`Careers page (${pageIndicator.source})`);
  }

  if (pageIndicator.signal) {
    signals.push(pageIndicator.signal);
  }

  const values = [greenhouseCount, leverCount].filter((entry): entry is number => entry !== null);
  const openRolesEstimate = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

  const hiringVelocity = scoreVelocity(openRolesEstimate);
  let staleRoleRisk = pageIndicator.staleRisk ?? 0;

  if (openRolesEstimate !== null && openRolesEstimate < 5) {
    staleRoleRisk += 8;
    signals.push({
      label: "Low active openings footprint",
      impact: 8,
      detail:
        "External job board footprint is thin, which can indicate stale listings staying live for visibility."
    });
  }

  if (openRolesEstimate !== null && openRolesEstimate > 120) {
    staleRoleRisk += 10;
    signals.push({
      label: "Unusually high opening count",
      impact: 10,
      detail:
        "Very high volume can indicate evergreen requisitions that refresh without immediate hiring intent."
    });
  }

  staleRoleRisk = Math.max(0, Math.min(100, staleRoleRisk));

  const confidenceBase = dataSources.length * 24 + (openRolesEstimate !== null ? 20 : 0);
  const confidence = Math.max(10, Math.min(95, confidenceBase));

  const summary =
    openRolesEstimate === null
      ? "No reliable public ATS count was found. Verify this company directly on its careers site and LinkedIn."
      : `${trimmed} shows roughly ${openRolesEstimate} open roles across public ATS sources, with ${hiringVelocity} hiring velocity signals.`;

  return {
    company: trimmed,
    openRolesEstimate,
    hiringVelocity,
    staleRoleRisk,
    confidence,
    dataSources,
    signals,
    summary
  } satisfies CompanyInsight;
}
