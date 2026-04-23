import { NextResponse } from "next/server";
import { z } from "zod";

import { hasPaidAccess } from "@/lib/auth";
import { analyzeJobPosting } from "@/lib/job-detector";

export const runtime = "nodejs";

const requestSchema = z.object({
  jobTitle: z.string().min(2, "Job title is required"),
  companyName: z.string().min(2, "Company name is required"),
  description: z.string().min(60, "Description must include at least 60 words"),
  jobUrl: z.string().url().optional().or(z.literal(""))
});

export async function POST(request: Request) {
  try {
    const access = await hasPaidAccess();
    if (!access) {
      return NextResponse.json(
        {
          error: "Paid access required. Complete checkout, then unlock this browser."
        },
        { status: 402 }
      );
    }

    const payload = requestSchema.parse(await request.json());

    const analysis = await analyzeJobPosting({
      jobTitle: payload.jobTitle,
      companyName: payload.companyName,
      description: payload.description,
      jobUrl: payload.jobUrl || undefined
    });

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Invalid request"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Unable to analyze job posting"
      },
      { status: 500 }
    );
  }
}
