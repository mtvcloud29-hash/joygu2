import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { notifyNewUser } from "@/lib/discord-webhooks";
export async function POST(request: Request) { const parsed = signupSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 }); try { const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } }); if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 }); const user = await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash: await bcrypt.hash(parsed.data.password, 12) } }); await createSession(user.id); notifyNewUser({ name: user.name, email: user.email, role: user.role }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 }); } }
