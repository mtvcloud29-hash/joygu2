import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ name: z.string().min(2).max(120), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().max(500).optional() });
async function admin() { const user = await getCurrentUser(); return user && (user.role === "ADMIN" || user.role === "STAFF") ? user : null; }
export async function GET() { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); return NextResponse.json({ categories: await prisma.blogCategory.findMany({ orderBy: { name: "asc" } }) }); }
export async function POST(request: Request) { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid category." }, { status: 400 }); return NextResponse.json({ ok: true, category: await prisma.blogCategory.create({ data: parsed.data }) }); }
