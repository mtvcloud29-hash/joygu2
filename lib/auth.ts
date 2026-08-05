import crypto from "node:crypto";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? "local-development-secret-change-me");
const cookieName = "joyguru_session";
type SessionMeta = { ipAddress?: string; userAgent?: string };
function tokenHash(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }
export async function createSession(userId: string, meta: SessionMeta = {}) { const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret); await prisma.session.create({ data: { userId, tokenHash: tokenHash(token), expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), ipAddress: meta.ipAddress, userAgent: meta.userAgent } }); (await cookies()).set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 }); }
export async function destroySession() { const token = (await cookies()).get(cookieName)?.value; if (token) await prisma.session.updateMany({ where: { tokenHash: tokenHash(token) }, data: { revokedAt: new Date() } }); (await cookies()).delete(cookieName); }
export async function getCurrentUser() { const token = (await cookies()).get(cookieName)?.value; if (!token) return null; try { const { payload } = await jwtVerify(token, secret); const session = await prisma.session.findFirst({ where: { tokenHash: tokenHash(token), revokedAt: null, expiresAt: { gt: new Date() } } }); if (!session || session.userId !== String(payload.userId)) return null; await prisma.session.update({ where: { id: session.id }, data: { lastActiveAt: new Date() } }); return prisma.user.findUnique({ where: { id: session.userId } }); } catch { return null; } }
