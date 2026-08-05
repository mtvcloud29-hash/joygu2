import * as React from "react";
import { cn } from "@/lib/utils";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn("h-12 w-full rounded-xl border border-clay-200 bg-white/80 px-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-clay-400 focus:ring-2 focus:ring-clay-200", className)} {...props} />);
Input.displayName = "Input";
