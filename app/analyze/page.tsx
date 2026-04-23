import Link from "next/link";

import { JobAnalyzer } from "@/components/JobAnalyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hasPaidAccess } from "@/lib/auth";

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

export default async function AnalyzePage() {
  const hasAccess = await hasPaidAccess();

  if (!hasAccess) {
    return (
      <main className="container-max py-12">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Analyzer Access</CardTitle>
              <CardDescription>
                Ghost Job Detector is paid-only. Buy access, then unlock this device with your purchase email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a href={paymentLink} target="_blank" rel="noreferrer">
                  Buy for $9/month
                </a>
              </Button>

              <form action="/api/unlock" method="post" className="space-y-3 rounded-lg border border-[#27364d] p-4">
                <p className="text-sm text-[#d6e1ee]">
                  Already purchased? Enter the same email used at checkout.
                </p>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  autoComplete="email"
                />
                <input type="hidden" name="redirect" value="/analyze" />
                <Button type="submit">Unlock Access</Button>
              </form>

              <p className="text-xs text-[#8b9db6]">
                Access is stored in an encrypted cookie on this browser.
              </p>
            </CardContent>
          </Card>

          <Button asChild variant="ghost">
            <Link href="/">Back to landing page</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-max py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#f0f6ff]">Ghost Job Analyzer</h1>
          <p className="mt-1 text-sm text-[#8b9db6]">
            Score job legitimacy before you spend time tailoring your application.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">Open Dashboard</Link>
        </Button>
      </div>
      <JobAnalyzer />
    </main>
  );
}
