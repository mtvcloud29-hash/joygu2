import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPublicIntegrations } from "@/lib/integrations";
import { IntegrationsClient } from "@/components/admin/integrations/IntegrationsClient";
export const dynamic = "force-dynamic";
export default async function IntegrationsPage() { const user = await getCurrentUser(); if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) redirect("/account/login"); return <main className="min-h-screen bg-[#f4eee8]"><div className="container-shell py-10 lg:py-14"><p className="eyebrow">Admin / Integrations</p><h1 className="display mt-3 text-5xl font-semibold tracking-[-.05em] text-ink">Integrations.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Connect operational providers without exposing credentials to the browser.</p><IntegrationsClient initial={await getPublicIntegrations()} /></div></main>; }
