import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const ACCESS_COOKIE = "ghost_job_access";
const SESSION_DAYS = 31;

interface AccessPayload {
  email: string;
  exp: number;
}

function getSigningSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-access-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string) {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

export function createAccessToken(email: string, expiresAt: Date) {
  const payload: AccessPayload = {
    email: email.toLowerCase().trim(),
    exp: expiresAt.getTime()
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyAccessToken(token: string): AccessPayload | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = sign(encoded);
  const supplied = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (supplied.length !== expected.length) {
    return null;
  }

  if (!timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as AccessPayload;
    if (!parsed.email || !parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function getAccessSession() {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return null;
  }

  if (payload.exp < Date.now()) {
    return null;
  }

  return {
    email: payload.email,
    expiresAt: new Date(payload.exp)
  };
}

export async function hasPaidAccess() {
  const session = await getAccessSession();
  return Boolean(session);
}

export function applyAccessCookie(response: NextResponse, email: string, expiresAt?: Date) {
  const finalExpiry =
    expiresAt ?? new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const token = createAccessToken(email, finalExpiry);

  response.cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: finalExpiry
  });
}

export function clearAccessCookie(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
