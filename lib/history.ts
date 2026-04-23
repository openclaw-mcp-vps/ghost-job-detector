export interface HistoryEntry {
  id: string;
  createdAt: string;
  jobTitle: string;
  companyName: string;
  jobUrl?: string;
  legitimacyScore: number;
  riskBand: string;
  confidence: number;
  topSignals: string[];
}

const STORAGE_KEY = "ghost_job_history";

export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function pushHistoryEntry(entry: HistoryEntry) {
  const existing = readHistory();
  const deduped = existing.filter(
    (item) => !(item.jobTitle === entry.jobTitle && item.companyName === entry.companyName && item.jobUrl === entry.jobUrl)
  );

  deduped.unshift(entry);
  writeHistory(deduped.slice(0, 50));
}
