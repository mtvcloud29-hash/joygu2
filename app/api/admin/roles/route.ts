import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emptyPermissions } from "@/lib/permissions";

async function admin() { const user = await getCurrentUser(); return user && (user.role === "ADMIN" || user.role === "STAFF") ? user : null; }
const schema = z.object({ name: z.string().min(2).max(80), slug: z.string().regex(/^[a-z0-9-]+$/), description: z.string().max(500).optional(), permissions: z.record(z.string(), z.record(z.string(), z.boolean())).default(emptyPermissions()) });
export async function GET() { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const roles = await prisma.staffRole.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { assignments: true } } } }); return NextResponse.json({ roles }); }
export async function POST(request: Request) { const user = await admin(); if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid role" }, { status: 400 }); const role = await prisma.staffRole.create({ data: { ...parsed.data, createdById: user.id } }); await prisma.activityLog.create({ data: { userId: user.id, action: "CREATE", entity: "StaffRole", entityId: role.id, newValue: parsed.data } }); return NextResponse.json({ ok: true, role }); }
