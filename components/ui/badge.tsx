import { cn } from "@/lib/utils";
export function Badge({ children, className }: { children: React.ReactNode; className?: string }) { return <span className={cn("inline-flex items-center rounded-full bg-clay-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-clay-500", className)}>{children}</span>; }
