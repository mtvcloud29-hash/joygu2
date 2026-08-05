import * as React from "react";
import { cn } from "@/lib/utils";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cn("min-h-36 w-full resize-y rounded-xl border border-clay-200 bg-white/80 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-clay-400 focus:ring-2 focus:ring-clay-200", className)} {...props} />);
Textarea.displayName = "Textarea";
