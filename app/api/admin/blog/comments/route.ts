import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
async function admin() { const user = await getCurrentUser(); return user && (user.role === "ADMIN" || user.role === "STAFF") ? user : null; }
export async function GET() { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); return NextResponse.json({ comments: await prisma.blogComment.findMany({ orderBy: { createdAt: "desc" }, include: { post: { select: { title: true } } } }) }); }
export async function PATCH(request: Request) { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const parsed = z.object({ id: z.string().cuid(), status: z.enum(["PENDING", "APPROVED", "REJECTED", "SPAM"]) }).safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid comment action." }, { status: 400 }); return NextResponse.json({ ok: true, comment: await prisma.blogComment.update({ where: { id: parsed.data.id }, data: { status: parsed.data.status } }) }); }
