import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[140px] w-full rounded-md border border-[#2c3a4f] bg-[#0b1522] px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#6d7f98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f81f7] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
