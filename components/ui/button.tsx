import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" | "ghost" }) {
  return <button className={cn(variant === "primary" ? "button-primary" : variant === "quiet" ? "button-quiet" : "inline-flex items-center justify-center rounded-full p-2 text-muted transition hover:bg-clay-100 hover:text-ink", className)} {...props} />;
}
