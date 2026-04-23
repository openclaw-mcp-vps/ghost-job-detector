import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "border-[#2f81f7]/40 bg-[#11213a] text-[#8cc2ff]",
        danger: "border-[#ff6b6b]/40 bg-[#30181e] text-[#ff9aa2]",
        warning: "border-[#f2cc60]/40 bg-[#312a15] text-[#ffd56c]",
        success: "border-[#3fb950]/40 bg-[#152b1a] text-[#8de09a]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
