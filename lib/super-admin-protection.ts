import { prisma } from "@/lib/prisma";
import { notifySuperAdminProtectionAttempt } from "@/lib/discord-webhooks";
import { isConfiguredSuperAdmin } from "@/lib/super-admin";

export async function logProtectionAttempt(input: { actorId: string; actorEmail: string; targetId: string; action: string; reason: string; ip?: string; userAgent?: string }) {
  await prisma.activityLog.create({ data: { userId: input.actorId, action: "UPDATE", entity: "SuperAdminProtection", entityId: input.targetId, ipAddress: input.ip, userAgent: input.userAgent, metadata: { action: input.action, reason: input.reason, targetEmail: isConfiguredSuperAdmin(input.actorEmail) ? "protected" : input.actorEmail } } });
  notifySuperAdminProtectionAttempt({ actorEmail: input.actorEmail, action: input.action, reason: input.reason, ip: input.ip });
}

export async function protectionFailure(input: { actorId: string; actorEmail: string; targetId: string; action: string; reason: string; ip?: string; userAgent?: string }) { await logProtectionAttempt(input); return { error: "This action is protected. There must always be at least one active Super Admin." }; }
