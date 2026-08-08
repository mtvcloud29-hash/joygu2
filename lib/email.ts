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

function formatSmtpError(error: unknown) {
  if (error instanceof Error) {
    const response = (error as Error & { response?: string }).response;
    const code = (error as Error & { code?: string }).code;
    const stack = error.stack;
    return [error.message, code, response, stack].filter(Boolean).join(" | ");
  }
  return String(error);
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
    const encryption = (settings.email.smtpEncryption || "STARTTLS").toUpperCase();
    const port = Number(settings.email.smtpPort) || (encryption === "SSL" ? 465 : 587);

    if (!host || !username || !password || !senderEmail) {
      throw new Error("SMTP host, username, password, and sender email are required.");
    }

    let secure = false;
    let requireTLS = false;
    let ignoreTLS = false;

    if (encryption === "SSL") {
      secure = true;
    } else if (encryption === "TLS" || encryption === "STARTTLS") {
      secure = false;
      requireTLS = true;
    } else if (encryption === "NONE") {
      ignoreTLS = true;
    }

    console.info("[smtp] preparing transport", {
      provider,
      host,
      port,
      username,
      encryption,
      passwordExists: Boolean(password),
      passwordLength: password.length,
    });

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS,
      ignoreTLS,
      auth: { user: username, pass: password },
    });

    try {
      await transporter.verify();
      console.info("[smtp] transport verified", {
        provider,
        host,
        port,
        username,
        secure,
        encryption,
      });
    } catch (error) {
      const message = formatSmtpError(error);
      const nodemailerError = error as Error & { code?: string; response?: string; command?: string };
      console.error("[smtp] verification failed", {
        provider,
        host,
        port,
        username,
        encryption,
        passwordExists: Boolean(password),
        passwordLength: password.length,
        errorCode: nodemailerError.code,
        errorResponse: nodemailerError.response,
        errorCommand: nodemailerError.command,
        errorMessage: nodemailerError.message,
        error: message,
      });
      throw new Error(message);
    }

    try {
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
    } catch (error) {
      const message = formatSmtpError(error);
      const nodemailerError = error as Error & { code?: string; response?: string; command?: string };
      console.error("[smtp] send failed", {
        provider,
        host,
        port,
        username,
        encryption,
        passwordExists: Boolean(password),
        passwordLength: password.length,
        errorCode: nodemailerError.code,
        errorResponse: nodemailerError.response,
        errorCommand: nodemailerError.command,
        errorMessage: nodemailerError.message,
        error: message,
      });
      throw new Error(message);
    }
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
