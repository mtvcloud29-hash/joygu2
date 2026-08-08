import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";
const schema = z.object({ email: z.string().email() });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 }); const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } }); if (user?.passwordHash && process.env.RESEND_API_KEY) { const token = crypto.randomBytes(32).toString("hex"); const tokenHash = crypto.createHash("sha256").update(token).digest("hex"); await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }); await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 1000 * 60 * 30) } }); const resend = new Resend(process.env.RESEND_API_KEY); await resend.emails.send({ from: process.env.EMAIL_FROM ?? "Joyguru Enterprise <orders@joyguruenterprise.in>", to: user.email, subject: "Reset your Joyguru password", html: `<p>Hello ${user.name},</p><p><a href="${absoluteUrl(`/account/reset-password?token=${token}`)}">Reset your password</a>. This link expires in 30 minutes.</p>` }); } return NextResponse.json({ ok: true, message: "If an account exists for that email, a reset link is on its way." }); }
