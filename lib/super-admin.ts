import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notifySuperAdminCreated, notifySuperAdminRepaired } from "@/lib/discord-webhooks";

const defaultEmail = "admin123@gml.com";
export function configuredSuperAdminEmail() { return (process.env.SUPER_ADMIN_EMAIL ?? defaultEmail).trim().toLowerCase(); }
export function isConfiguredSuperAdmin(email: string) { return email.trim().toLowerCase() === configuredSuperAdminEmail(); }
function fullPermissions(value: unknown) { return Boolean(value && typeof value === "object" && !Array.isArray(value) && (value as { all?: unknown }).all === true); }

export async function ensureSuperAdmin() {
  const email = configuredSuperAdminEmail();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      if (!password) { console.warn("SUPER_ADMIN_PASSWORD is not configured; super-admin provisioning was skipped."); return false; }
      const passwordHash = await bcrypt.hash(password, 12);
      const created = await prisma.user.create({ data: { name: "Joyguru Super Admin", email, passwordHash, role: Role.ADMIN, emailVerifiedAt: new Date(), isActive: true, permissions: { all: true } } });
      await prisma.activityLog.create({ data: { userId: created.id, action: "CREATE", entity: "SuperAdmin", entityId: created.id, newValue: { email, role: "ADMIN", isActive: true, emailVerified: true, permissions: "all" } } });
      notifySuperAdminCreated(email);
      return true;
    }
    const changes: string[] = [];
    if (existing.role !== Role.ADMIN) changes.push("role");
    if (!existing.isActive) changes.push("isActive");
    if (!existing.emailVerifiedAt) changes.push("emailVerifiedAt");
    if (!fullPermissions(existing.permissions)) changes.push("permissions");
    if (!existing.passwordHash && password) changes.push("passwordHash");
    if (!changes.length) return true;
    const repaired = await prisma.user.update({ where: { id: existing.id }, data: { ...(existing.role !== Role.ADMIN ? { role: Role.ADMIN } : {}), ...(existing.isActive ? {} : { isActive: true }), ...(existing.emailVerifiedAt ? {} : { emailVerifiedAt: new Date() }), ...(fullPermissions(existing.permissions) ? {} : { permissions: { all: true } }), ...(existing.passwordHash || !password ? {} : { passwordHash: await bcrypt.hash(password, 12) }) } });
    await prisma.activityLog.create({ data: { userId: repaired.id, action: "UPDATE", entity: "SuperAdmin", entityId: repaired.id, previousValue: { role: existing.role, isActive: existing.isActive, emailVerified: Boolean(existing.emailVerifiedAt), permissions: existing.permissions }, newValue: { role: repaired.role, isActive: repaired.isActive, emailVerified: Boolean(repaired.emailVerifiedAt), permissions: "all" }, metadata: { changes } } });
    notifySuperAdminRepaired(email, changes);
    return true;
  } catch (error) { console.error("Super-admin provisioning failed", error instanceof Error ? error.message : "Unknown error"); return false; }
}
