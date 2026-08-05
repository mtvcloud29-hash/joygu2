import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { defaultHomepageBlocks } from "@/lib/page-builder";
import { PageBuilderClient } from "@/components/admin/page-builder/PageBuilderClient";
export const dynamic = "force-dynamic";
export default async function PageBuilderPage() { const user = await getCurrentUser(); if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) redirect("/account/login"); return <main className="min-h-screen bg-[#f4eee8]"><div className="container-shell py-10 lg:py-14"><p className="eyebrow">Admin / Experience</p><h1 className="display mt-3 text-5xl font-semibold tracking-[-.05em] text-ink">Homepage builder.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Compose the homepage from typed content blocks, preview changes and publish only when the story is ready.</p><PageBuilderClient fallbackBlocks={defaultHomepageBlocks} /></div></main>; }
