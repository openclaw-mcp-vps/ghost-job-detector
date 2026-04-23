import { NextResponse } from "next/server";

import { applyAccessCookie } from "@/lib/auth";
import { getEntitlement } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

function buildRedirectUrl(request: Request, path: string, params: Record<string, string>) {
  const url = new URL(path, request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let email = "";
  let redirectPath = "/analyze";

  if (contentType.includes("application/json")) {
    const json = (await request.json()) as { email?: string; redirect?: string };
    email = json.email?.toLowerCase().trim() || "";
    redirectPath = json.redirect || redirectPath;
  } else {
    const form = await request.formData();
    email = String(form.get("email") || "").toLowerCase().trim();
    const postedRedirect = String(form.get("redirect") || "").trim();
    if (postedRedirect.startsWith("/")) {
      redirectPath = postedRedirect;
    }
  }

  if (!email) {
    return NextResponse.redirect(buildRedirectUrl(request, redirectPath, { unlock: "missing_email" }));
  }

  const entitlement = await getEntitlement(email);

  if (!entitlement) {
    return NextResponse.redirect(buildRedirectUrl(request, redirectPath, { unlock: "not_found" }));
  }

  const response = NextResponse.redirect(buildRedirectUrl(request, redirectPath, { unlock: "success" }));

  applyAccessCookie(
    response,
    entitlement.email,
    entitlement.expiresAt ? new Date(entitlement.expiresAt) : undefined
  );

  return response;
}
