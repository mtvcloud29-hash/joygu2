"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
export function ThemeToggle() { const { resolvedTheme, setTheme } = useTheme(); const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []); if (!mounted) return <span className="h-10 w-10" />; const dark = resolvedTheme === "dark"; return <button type="button" data-cursor="Theme" aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={() => setTheme(dark ? "light" : "dark")} className="rounded-full p-2.5 text-muted transition hover:bg-clay-100 hover:text-ink active:scale-90">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>; }
