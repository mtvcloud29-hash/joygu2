"use server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { notifyNewsletter } from "@/lib/discord-webhooks";
const schema = z.object({ email: z.string().email() });
export async function subscribeToNewsletter(formData: FormData) { const parsed = schema.safeParse({ email: formData.get("email") }); if (!parsed.success) return { ok: false, message: "Enter a valid email address." }; try { const email = parsed.data.email.toLowerCase(); const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } }); await prisma.newsletterSubscriber.upsert({ where: { email }, update: { subscribed: true }, create: { email } }); if (!existing?.subscribed) notifyNewsletter(email); return { ok: true, message: "You’re on the list. Welcome to the quieter side of the internet." }; } catch { return { ok: false, message: "We couldn’t save that right now. Please try again." }; } }
