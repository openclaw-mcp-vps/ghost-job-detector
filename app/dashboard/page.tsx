import Link from "next/link";

import { DashboardClient } from "@/components/DashboardClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPaidAccess } from "@/lib/auth";

export default async function DashboardPage() {
  const hasAccess = await hasPaidAccess();

  if (!hasAccess) {
    return (
      <main className="container-max py-12">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Dashboard locked</CardTitle>
            <CardDescription>
              Purchase and unlock access to track scoring history across all analyzed postings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link href="/analyze">Unlock Access</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container-max py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#f0f6ff]">Analysis Dashboard</h1>
          <p className="mt-1 text-sm text-[#8b9db6]">
            Track which companies and posting patterns consume your application time.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/analyze">Run New Analysis</Link>
        </Button>
      </div>
      <DashboardClient />
    </main>
  );
}
