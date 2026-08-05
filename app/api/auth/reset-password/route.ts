import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const schema = z.object({ token: z.string().min(20), password: z.string().min(8) });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Use a password with at least 8 characters." }, { status: 400 }); const tokenHash = crypto.createHash("sha256").update(parsed.data.token).digest("hex"); const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } }); if (!record || record.expiresAt < new Date()) return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 }); await prisma.$transaction([prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } }), prisma.passwordResetToken.delete({ where: { id: record.id } })]); return NextResponse.json({ ok: true }); }
