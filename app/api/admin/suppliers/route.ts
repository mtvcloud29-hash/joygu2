import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ name: z.string().min(2), company: z.string().min(2), gst: z.string().optional(), phone: z.string().min(5), email: z.string().email(), address: z.string().min(5), notes: z.string().optional() });
async function admin() { const user = await getCurrentUser(); return user && (user.role === "ADMIN" || user.role === "STAFF") ? user : null; }
export async function GET() { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); return NextResponse.json({ suppliers: await prisma.supplier.findMany({ orderBy: { createdAt: "desc" }, include: { purchases: { select: { total: true } } } }) }); }
export async function POST(request: Request) { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid supplier." }, { status: 400 }); return NextResponse.json({ ok: true, supplier: await prisma.supplier.create({ data: parsed.data }) }); }
