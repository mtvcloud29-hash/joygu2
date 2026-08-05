import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";
const schema = z.object({ label: z.string().min(1), name: z.string().min(2), phone: z.string().regex(/^[6-9]\d{9}$/), line1: z.string().min(10), city: z.string().min(2), state: z.string().min(2), pincode: z.string().regex(/^\d{6}$/) });
export async function POST(request: Request) { const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid address" }, { status: 400 }); const count = await prisma.address.count({ where: { userId: user.id } }); const address = await prisma.address.create({ data: { ...parsed.data, userId: user.id, isDefault: count === 0 } }); return NextResponse.json({ ok: true, address }); }
