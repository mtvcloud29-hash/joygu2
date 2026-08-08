import { site } from "@/lib/constants";
import { formatINR } from "@/lib/utils";
import { notifyContact } from "@/lib/discord-webhooks";
import { sendInfo } from "@/lib/discord";
import { sendConfiguredEmail } from "@/lib/email";

async function emailSettings() { const { getPrivateSettings } = await import("@/lib/settings"); return getPrivateSettings(); }
/** Backwards-compatible generic notifier for existing integrations. Delivery is queued and non-blocking. */
export function notifyDiscord(title: string, fields: Record<string, string>) { sendInfo(title, Object.entries(fields).map(([name, value]) => ({ name, value }))); }
export async function sendOrderConfirmation(order: { orderNumber: string; email: string; customerName: string; total: number }) { const settings = await emailSettings(); if (!settings.email.enabled || !settings.email.orderEmails) return; try { await sendConfiguredEmail({ to: order.email, replyTo: settings.email.replyTo || settings.general.supportEmail || settings.general.businessEmail || site.email, subject: `Order ${order.orderNumber} confirmed`, html: `<div style="font-family:Arial,sans-serif;color:#2d1a10"><h1>Thank you, ${order.customerName}.</h1><p>Your Joyguru order <strong>${order.orderNumber}</strong> is confirmed.</p><p>Order total: <strong>${formatINR(order.total)}</strong></p><p>We’ll send another note when it leaves our studio.</p></div>` }); } catch { /* Email delivery is optional for order flows; failures are swallowed. */ } }
export async function sendContactNotification(contact: { name: string; email: string; phone?: string; subject: string; message: string }) { const settings = await emailSettings(); if (settings.email.enabled) { try { await sendConfiguredEmail({ to: settings.general.businessEmail || site.email, replyTo: contact.email, subject: `Website enquiry: ${contact.subject}`, text: `${contact.name} (${contact.email})\n\n${contact.message}` }); } catch { /* Email delivery is optional for contact flows; failures are swallowed. */ } } notifyContact({ name: contact.name, phone: contact.phone, email: contact.email, message: `${contact.subject}\n\n${contact.message}` }); }
export { notifyContact as notifyContactDiscord } from "@/lib/discord-webhooks";
