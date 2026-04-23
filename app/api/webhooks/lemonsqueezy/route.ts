import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { deriveExpiry, upsertEntitlement } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

interface StripeEvent {
  type: string;
  data?: {
    object?: Record<string, unknown>;
  };
}

function verifyStripeSignature(payload: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, item) => {
    const [key, value] = item.split("=");
    if (!key || !value) {
      return acc;
    }
    acc[key] = acc[key] ? [...acc[key], value] : [value];
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  return signatures.some((candidate) => {
    const expectedBuffer = Buffer.from(expected, "utf8");
    const candidateBuffer = Buffer.from(candidate, "utf8");

    if (expectedBuffer.length !== candidateBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, candidateBuffer);
  });
}

function isActiveSubscription(status: string | undefined) {
  return status === "active" || status === "trialing" || status === "past_due";
}

function toString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const payload = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (secret) {
    const signature = request.headers.get("stripe-signature");
    const verified = verifyStripeSignature(payload, signature, secret);

    if (!verified) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: StripeEvent;

  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const object = event.data?.object ?? {};
  let email = "";
  let active = false;
  let expiresAt: Date | null = null;

  if (event.type === "checkout.session.completed") {
    const customerDetails = object.customer_details as { email?: string } | undefined;
    email = customerDetails?.email || toString(object.customer_email);
    active = true;
    expiresAt = deriveExpiry(31);
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
    email = toString(object.customer_email);
    const status = toString(object.status);
    active = isActiveSubscription(status);

    const periodEnd = object.current_period_end;
    if (typeof periodEnd === "number") {
      expiresAt = new Date(periodEnd * 1000);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    email = toString(object.customer_email);
    active = false;
    expiresAt = new Date();
  }

  if (email) {
    await upsertEntitlement({
      email,
      active,
      plan: "$9/mo",
      source: `stripe:${event.type}`,
      updatedAt: new Date().toISOString(),
      expiresAt: expiresAt ? expiresAt.toISOString() : null
    });
  }

  return NextResponse.json({ received: true, event: event.type });
}
