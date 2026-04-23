import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export interface EntitlementRecord {
  email: string;
  active: boolean;
  plan: string;
  source: string;
  updatedAt: string;
  expiresAt: string | null;
}

const dataPath = path.join(process.cwd(), "data", "entitlements.json");

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

async function loadEntitlements() {
  try {
    const raw = await readFile(dataPath, "utf8");
    return JSON.parse(raw) as EntitlementRecord[];
  } catch {
    return [];
  }
}

async function saveEntitlements(records: EntitlementRecord[]) {
  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify(records, null, 2), "utf8");
}

export async function upsertEntitlement(record: EntitlementRecord) {
  const normalized = normalizeEmail(record.email);
  const records = await loadEntitlements();
  const withoutExisting = records.filter((entry) => normalizeEmail(entry.email) !== normalized);
  withoutExisting.push({ ...record, email: normalized });
  await saveEntitlements(withoutExisting);
}

export async function getEntitlement(email: string) {
  const normalized = normalizeEmail(email);
  const records = await loadEntitlements();
  const record = records.find((entry) => normalizeEmail(entry.email) === normalized);

  if (!record) {
    return null;
  }

  if (!record.active) {
    return null;
  }

  if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
    return null;
  }

  return record;
}

export function deriveExpiry(days = 31) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
