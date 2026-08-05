import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function AccountSecurityPage() { const user = await getCurrentUser(); if (!user) redirect("/account/login"); return <main className="container-shell py-12 lg:py-20"><Link href="/account" className="text-xs font-semibold text-muted">← Account</Link><p className="eyebrow mt-8">Account settings</p><h1 className="section-title mt-3">Security.</h1><section className="surface mt-10 max-w-2xl p-7"><ShieldCheck size={22} className="text-clay-400" /><h2 className="mt-7 text-xl font-semibold">Password protection</h2><p className="mt-3 text-sm leading-6 text-muted">Keep your account protected with a strong password and secure session.</p><Link href="/account/forgot-password" className="button-primary mt-6">Change password</Link></section></main>; }
