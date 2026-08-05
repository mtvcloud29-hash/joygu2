import { site } from "@/lib/constants";
import { absoluteUrl, formatINR } from "@/lib/utils";

export const discordColors = {
  success: 0x2e8b57,
  info: 0x3b82f6,
  warning: 0xf2b84b,
  error: 0xb42318,
  pink: 0xec4899,
  purple: 0x8b5cf6,
  orange: 0xf97316,
  gold: 0xd4a72c,
  grey: 0x6b7280,
  darkGrey: 0x374151,
  darkRed: 0x7f1d1d,
  blurple: 0x5865f2
} as const;

export type DiscordField = { name: string; value: string; inline?: boolean };
export type DiscordEmbed = {
  title: string;
  description?: string;
  color?: number;
  url?: string;
  timestamp?: string;
  fields?: DiscordField[];
  author?: { name: string; url?: string; icon_url?: string };
  thumbnail?: { url: string };
  footer?: { text: string; icon_url?: string };
};
export type DiscordPayload = { username?: string; avatar_url?: string; allowed_mentions?: { parse: string[] }; embeds: DiscordEmbed[] };

const maxFieldValue = 1024;
const maxDescription = 4096;

function truncate(value: string, max: number) { return value.length > max ? `${value.slice(0, max - 1)}…` : value; }
export function sanitizeDiscordText(value: unknown, max = maxFieldValue) { return truncate(String(value ?? "").replaceAll("@everyone", "@ everyone").replaceAll("@here", "@ here").replace(/[<>]/g, ""), max) || "—"; }
export function maskEmail(email: string) { const [local = "", domain = ""] = email.split("@"); return domain ? `${local.slice(0, 2)}***@${domain}` : sanitizeDiscordText(email); }
export function maskPhone(phone: string) { const digits = phone.replace(/\D/g, ""); return digits.length >= 4 ? `••••••${digits.slice(-4)}` : sanitizeDiscordText(phone); }
export function maskIp(ip?: string) { if (!ip) return "Unavailable"; const parts = ip.split("."); return parts.length === 4 ? `${parts[0]}.${parts[1]}.xxx.xxx` : sanitizeDiscordText(ip); }

function brandImage() { return process.env.DISCORD_BRAND_IMAGE_URL || absoluteUrl("/images/photography/pottery-earth.jpg"); }
type DiscordToggle = "newOrder" | "paymentSuccess" | "paymentFailed" | "refund" | "adminLogin" | "failedLogin" | "newsletter" | "wholesale" | "contact" | "lowStock" | "outOfStock" | "serverStartup" | "deployment" | "productCreated" | "productUpdated" | "productDeleted";
function toggleForTitle(title: string): DiscordToggle | null { const normalized = title.toLowerCase(); if (normalized.includes("new order")) return "newOrder"; if (normalized.includes("payment successful")) return "paymentSuccess"; if (normalized.includes("payment failed")) return "paymentFailed"; if (normalized.includes("refund")) return "refund"; if (normalized.includes("failed admin")) return "failedLogin"; if (normalized.includes("admin login")) return "adminLogin"; if (normalized.includes("newsletter")) return "newsletter"; if (normalized.includes("wholesale")) return "wholesale"; if (normalized.includes("contact")) return "contact"; if (normalized.includes("low stock")) return "lowStock"; if (normalized.includes("out of stock")) return "outOfStock"; if (normalized.includes("server started")) return "serverStartup"; if (normalized.includes("deployment")) return "deployment"; if (normalized.includes("product created")) return "productCreated"; if (normalized.includes("product updated")) return "productUpdated"; if (normalized.includes("product deleted")) return "productDeleted"; return null; }
async function resolveConfig(title: string) { const environment = { url: process.env.DISCORD_WEBHOOK_URL, image: brandImage() }; try { const { getPrivateSettings } = await import("@/lib/settings"); const settings = await getPrivateSettings(); const toggle = toggleForTitle(title); if (!settings.discord.enabled || (toggle && !settings.discord[toggle])) return null; return { url: settings.discord.webhookUrl || environment.url, image: settings.discord.brandImage || environment.image }; } catch { return environment; } }
function baseEmbed(input: Omit<DiscordEmbed, "author" | "footer" | "timestamp" | "thumbnail"> & { thumbnail?: string }): DiscordEmbed {
  return { ...input, title: sanitizeDiscordText(input.title, 256), description: input.description ? sanitizeDiscordText(input.description, maxDescription) : undefined, timestamp: new Date().toISOString(), author: { name: site.name, url: process.env.NEXT_PUBLIC_SITE_URL || undefined, icon_url: brandImage() }, thumbnail: { url: input.thumbnail || brandImage() }, footer: { text: "Joyguru Enterprise · Operations", icon_url: brandImage() }, fields: input.fields?.slice(0, 25).map((field) => ({ name: sanitizeDiscordText(field.name, 256), value: sanitizeDiscordText(field.value), inline: field.inline ?? true })) };
}

export function createEmbed(input: Omit<DiscordEmbed, "author" | "footer" | "timestamp" | "thumbnail"> & { thumbnail?: string }): DiscordEmbed { return baseEmbed(input); }

function wait(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }
async function deliver(payload: DiscordPayload, url: string | undefined) {
  if (!url) return false;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    try {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, allowed_mentions: { parse: [] } }), signal: controller.signal, cache: "no-store" });
      if (response.ok) return true;
      if (response.status >= 400 && response.status < 500 && response.status !== 429) { console.error("Discord webhook rejected notification", { status: response.status }); return false; }
      if (attempt < 3) await wait(Math.min(1_000, 250 * 2 ** (attempt - 1)));
    } catch (error) {
      if (attempt === 3) console.error("Discord webhook unavailable", error instanceof Error ? error.message : "Unknown Discord error");
      else await wait(Math.min(1_000, 250 * 2 ** (attempt - 1)));
    } finally { clearTimeout(timeout); }
  }
  return false;
}

/** Queues delivery without making the caller await Discord or fail on Discord errors. */
export async function sendEmbedNow(embed: DiscordEmbed) { const config = await resolveConfig(embed.title); if (!config?.url) return false; const image = config.image; const enriched: DiscordEmbed = { ...embed, author: { ...(embed.author ?? { name: site.name }), icon_url: image }, footer: { ...(embed.footer ?? { text: "Joyguru Enterprise · Operations" }), icon_url: image }, thumbnail: embed.thumbnail ?? { url: image } }; return deliver({ username: site.name, avatar_url: image, embeds: [enriched] }, config.url); }
export function queueEmbed(embed: DiscordEmbed) { void sendEmbedNow(embed).catch((error: unknown) => console.error("Discord notification queue failed", error instanceof Error ? error.message : "Unknown Discord error")); }
export function sendEmbed(embed: DiscordEmbed) { queueEmbed(embed); }
export function sendSuccess(title: string, fields: DiscordField[], description?: string) { sendEmbed(createEmbed({ title, fields, description, color: discordColors.success })); }
export function sendWarning(title: string, fields: DiscordField[], description?: string) { sendEmbed(createEmbed({ title, fields, description, color: discordColors.warning })); }
export function sendError(title: string, fields: DiscordField[], description?: string) { sendEmbed(createEmbed({ title, fields, description, color: discordColors.error })); }
export function sendInfo(title: string, fields: DiscordField[], description?: string) { sendEmbed(createEmbed({ title, fields, description, color: discordColors.info })); }
export { formatINR };
