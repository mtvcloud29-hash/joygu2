import nodemailer from "nodemailer";
import { Resend } from "resend";
import { site } from "@/lib/constants";
import { getPrivateSettings } from "@/lib/settings";
import type { SettingsDocument } from "@/lib/settings";

export type EmailProvider = "resend" | "smtp";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  from?: string;
}

function normalizeProvider(provider?: string): EmailProvider {
  return provider === "smtp" ? "smtp" : "resend";
}

function getSenderDetails(settings: SettingsDocument) {
  const senderEmail = settings.email.senderEmail || settings.general.businessEmail || settings.general.supportEmail || site.email;
  const senderName = settings.email.senderName || settings.general.companyName || site.name;
  return { senderEmail, senderName };
}

export async function sendConfiguredEmail({ to, subject, text, html, replyTo, from }: SendEmailOptions) {
  const settings = await getPrivateSettings();
  if (!settings.email.enabled) throw new Error("Email delivery is disabled in settings.");

  const provider = normalizeProvider(settings.email.provider);
  const { senderEmail, senderName } = getSenderDetails(settings);
  const fromAddress = from ?? `${senderName} <${senderEmail}>`;
  const replyToAddress = replyTo ?? settings.email.replyTo ?? settings.general.supportEmail ?? senderEmail;

  if (provider === "smtp") {
    const host = settings.email.smtpHost?.trim() ?? "";
    const username = settings.email.smtpUsername?.trim() ?? "";
    const password = settings.email.smtpPassword?.trim() ?? "";
    const port = Number(settings.email.smtpPort) || 587;
    const encryption = settings.email.smtpEncryption || "STARTTLS";

    if (!host || !username || !password || !senderEmail) {
      throw new Error("SMTP host, username, password, and sender email are required.");
    }

    const secure = encryption === "SSL" || encryption === "TLS";
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: encryption === "STARTTLS",
      ignoreTLS: encryption === "None",
      auth: { user: username, pass: password },
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      replyTo: replyToAddress,
      subject,
      text,
      html,
    });

    if (!info.messageId) {
      throw new Error("SMTP server did not accept the message.");
    }

    return info;
  }

  const apiKey = settings.email.resendApiKey?.trim() ?? "";
  if (!apiKey) {
    throw new Error("Resend API key is required.");
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from: fromAddress,
    to,
    replyTo: replyToAddress,
    subject,
    text,
    html,
  } as any);

  if (result.error) {
    throw new Error(result.error.message ?? "Unable to send email.");
  }

  return result;
}
