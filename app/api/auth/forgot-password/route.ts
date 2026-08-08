import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendConfiguredEmail } from "@/lib/email";
import { getPrivateSettings } from "@/lib/settings";
import { absoluteUrl } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const settings = await getPrivateSettings();

  if (user?.passwordHash && settings.email.enabled && settings.email.passwordResetEmails) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 1000 * 60 * 30) } });
    try {
      await sendConfiguredEmail({
        to: user.email,
        replyTo: settings.email.replyTo || settings.general.supportEmail || settings.general.businessEmail,
        subject: "Reset your Joyguru password",
        html: `<p>Hello ${user.name},</p><p><a href="${absoluteUrl(`/account/reset-password?token=${token}`)}">Reset your password</a>. This link expires in 30 minutes.</p>`
      });
    } catch {
      /* Password reset emails are best-effort. */
    }
  }

  return NextResponse.json({ ok: true, message: "If an account exists for that email, a reset link is on its way." });
}
