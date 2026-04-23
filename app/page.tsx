import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Target, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "How does Ghost Job Detector decide if a posting is fake?",
    answer:
      "Each analysis combines weighted language signals from the posting and external hiring footprint signals from public ATS endpoints and careers pages. You get both a score and explainable evidence."
  },
  {
    question: "Can I trust the score alone?",
    answer:
      "Treat the score as a decision aid, not a final verdict. The tool highlights where to verify headcount, posting recency, and hiring-manager ownership before investing your time."
  },
  {
    question: "Who is this for?",
    answer:
      "Job seekers who are applying weekly and career coaches who review many listings per client. The dashboard is designed to track risk patterns over time."
  },
  {
    question: "What do I get at $9/month?",
    answer:
      "Unlimited posting analyses, company hiring context checks, a personal risk dashboard, and browser extension support for quick scans on job boards."
  }
];

const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

export default function HomePage() {
  return (
    <main className="pb-20">
      <section className="container-max pt-12 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="default" className="mx-auto mb-4">
            Identify fake job postings before applying
          </Badge>
          <h1 className="text-balance text-4xl font-bold leading-tight text-[#f0f6ff] sm:text-6xl">
            Stop wasting nights on ghost jobs that were never meant to hire.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#9ab0ca]">
            Ghost Job Detector analyzes job descriptions and public hiring history to score whether a role
            is likely real, stale, or an evergreen pipeline post.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/analyze">
                Open Analyzer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={paymentLink} target="_blank" rel="noreferrer">
                Buy for $9/month
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="container-max mt-14 sm:mt-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#d6e1ee]">70% noise signal</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#8b9db6]">
              Recent labor-market studies estimate that many listings remain live without active intent to
              fill. Applicants end up feeding resume pipelines instead of real requisitions.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#d6e1ee]">Time saved weekly</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#8b9db6]">
              Use risk scoring before writing a cover letter. Most users cut low-quality applications and
              redirect effort to warm outreach and targeted roles.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#d6e1ee]">Coach-ready workflow</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[#8b9db6]">
              Career coaches can review client shortlists faster with a transparent signal trail, not a black
              box score.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container-max mt-16 sm:mt-24">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingDown className="h-5 w-5 text-[#ff9aa2]" />
                The Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[#d6e1ee]">
              <p>
                Job boards reward visibility, not hiring certainty. Companies leave postings up to build
                candidate pools, benchmark compensation, or signal growth.
              </p>
              <p>
                Job seekers pay the cost: resume customization, follow-up outreach, and interview prep for
                roles that never had budget approval.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShieldCheck className="h-5 w-5 text-[#8de09a]" />
                The Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[#d6e1ee]">
              <p>
                Ghost Job Detector scores each posting using explainable pattern detection: evergreen language,
                unrealistic requirement mixes, and missing decision-critical details.
              </p>
              <p>
                It then layers in company hiring footprint checks from public ATS sources so you can validate
                whether current demand supports the posting.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container-max mt-16 sm:mt-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">What You Get</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#24344a] bg-[#0b1522] p-4">
              <Target className="mb-3 h-5 w-5 text-[#8cc2ff]" />
              <p className="font-medium text-[#e6edf3]">Job analyzer</p>
              <p className="mt-1 text-sm text-[#8b9db6]">
                Paste any posting and get a legitimacy score, risk band, and practical next steps.
              </p>
            </div>
            <div className="rounded-xl border border-[#24344a] bg-[#0b1522] p-4">
              <Clock3 className="mb-3 h-5 w-5 text-[#8cc2ff]" />
              <p className="font-medium text-[#e6edf3]">Risk dashboard</p>
              <p className="mt-1 text-sm text-[#8b9db6]">
                Track every analyzed role and monitor score trends so your search strategy improves weekly.
              </p>
            </div>
            <div className="rounded-xl border border-[#24344a] bg-[#0b1522] p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-[#8cc2ff]" />
              <p className="font-medium text-[#e6edf3]">Browser extension</p>
              <p className="mt-1 text-sm text-[#8b9db6]">
                Run real-time checks directly from job board pages without switching tabs.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container-max mt-16 sm:mt-24" id="pricing">
        <Card className="mx-auto max-w-2xl border-[#2f81f7]/40">
          <CardHeader>
            <Badge className="w-fit" variant="default">
              Simple pricing
            </Badge>
            <CardTitle className="text-4xl">$9/month</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-[#d6e1ee]">
              <li>Unlimited ghost-job analyses</li>
              <li>Company hiring footprint checks</li>
              <li>Dashboard tracking for all analyzed postings</li>
              <li>Browser extension for one-click scans on job boards</li>
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="flex-1">
                <a href={paymentLink} target="_blank" rel="noreferrer">
                  Buy With Stripe Checkout
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link href="/analyze">I already purchased</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container-max mt-16 sm:mt-24">
        <h2 className="text-3xl font-semibold text-[#f0f6ff]">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-[#9ab0ca]">{faq.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
