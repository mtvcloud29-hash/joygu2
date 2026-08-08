import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
export const dynamic = "force-dynamic";
export default async function AdminMediaPage() { const user = await getCurrentUser(); if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) redirect("/account/login"); return <main className="min-h-screen bg-[#f4eee8]"><div className="container-shell py-10 lg:py-14"><Link href="/admin" className="text-xs font-semibold text-muted">← Dashboard</Link><div className="mt-7"><p className="eyebrow">Admin / Media</p><h1 className="display mt-3 text-5xl font-semibold tracking-[-.05em] text-ink">Media library.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted">Upload and organize production assets in Cloudflare R2. Images, video and documents remain private until you publish their public URL.</p></div><div className="mt-10"><MediaLibrary /></div></div></main>; }
