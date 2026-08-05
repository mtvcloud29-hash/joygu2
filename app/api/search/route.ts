import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoProducts } from "@/lib/demo-data";
import { safeQuery } from "@/lib/safe-db";
import { z } from "zod";
const querySchema = z.string().trim().min(1).max(80);
type SearchProduct = { slug: string; name: string; category: { name: string } };
export async function GET(request: Request) { const query = querySchema.safeParse(new URL(request.url).searchParams.get("q")); if (!query.success) return NextResponse.json({ products: [] }); const fallback: SearchProduct[] = demoProducts.filter((product) => `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query.data.toLowerCase())).slice(0, 6).map((product) => ({ slug: product.slug, name: product.name, category: { name: product.category } })); const products = await safeQuery(async () => prisma.product.findMany({ where: { active: true, OR: [{ name: { contains: query.data, mode: "insensitive" } }, { description: { contains: query.data, mode: "insensitive" } }, { category: { name: { contains: query.data, mode: "insensitive" } } }] }, select: { slug: true, name: true, category: { select: { name: true } } }, orderBy: { featured: "desc" }, take: 6 }), fallback); return NextResponse.json({ products }, { headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=120" } }); }
