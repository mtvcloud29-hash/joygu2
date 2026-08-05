"use client";
import { Check, Share2 } from "lucide-react";
import { useState } from "react";
export function ShareProductButton({ name }: { name: string }) { const [copied, setCopied] = useState(false); async function share() { const url = window.location.href; if (navigator.share) { await navigator.share({ title: name, text: `Discover ${name} from Joyguru Enterprise.`, url }); return; } await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } return <button type="button" onClick={() => void share()} data-cursor="Share" className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-clay-400">{copied ? <Check size={15} /> : <Share2 size={15} />}{copied ? "Link copied" : "Share piece"}</button>; }
