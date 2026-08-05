import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductManager } from "@/components/admin/products/ProductManager";
export const dynamic = "force-dynamic";
export default async function AdminProductsPage() { const user = await getCurrentUser(); if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) redirect("/account/login"); return <main className="container-shell py-12 lg:py-20"><Link href="/admin" className="text-xs font-semibold text-muted">← Dashboard</Link><div className="mt-7"><p className="eyebrow">Catalog</p><h1 className="section-title mt-3">Products.</h1><p className="mt-3 text-sm text-muted">Create, publish and maintain the production catalog.</p></div><ProductManager /></main>; }
