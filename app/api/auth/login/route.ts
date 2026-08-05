import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { notifyAdminLogin } from "@/lib/discord-webhooks";

function requestIp(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? undefined; }
function userAgent(request: Request) { return request.headers.get("user-agent")?.slice(0, 180) ?? "Unavailable"; }

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 });
  const email = parsed.data.email.toLowerCase(); const ip = requestIp(request); const browser = userAgent(request); const now = new Date();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { await prisma.loginAttempt.create({ data: { email, ipAddress: ip, userAgent: browser, success: false, reason: "Unknown account" } }); notifyAdminLogin({ email, ip, browser, success: false, reason: "Unknown account" }); return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 }); }
    if (user.lockedUntil && user.lockedUntil > now) return NextResponse.json({ error: "Account temporarily locked. Try again later." }, { status: 423 });
    const valid = Boolean(user.isActive && user.passwordHash && await bcrypt.compare(parsed.data.password, user.passwordHash));
    await prisma.loginAttempt.create({ data: { userId: user?.id, email, ipAddress: ip, userAgent: browser, success: valid, reason: valid ? "Authenticated" : "Invalid credentials" } });
    if (!valid) {
      const recent = await prisma.loginAttempt.count({ where: { email, success: false, createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } } });
      if (user && recent >= 5) { await prisma.user.update({ where: { id: user.id }, data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } }); notifyAdminLogin({ email, ip, browser, success: false, reason: "Account locked after repeated failures" }); }
      else notifyAdminLogin({ email, ip, browser, success: false, reason: "Invalid email or password" });
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: now, lockedUntil: null } });
    await createSession(user.id, { ipAddress: ip, userAgent: browser });
    if (user.role === "ADMIN" || user.role === "STAFF") notifyAdminLogin({ email: user.email, ip, browser, success: true, reason: `${user.role} authenticated` });
    return NextResponse.json({ ok: true });
  } catch { notifyAdminLogin({ email, ip, browser, success: false, reason: "Authentication service error" }); return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 }); }
}
