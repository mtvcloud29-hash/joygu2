"use server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { sendContactNotification } from "@/lib/notifications";
export async function submitContact(formData: FormData) { const parsed = contactSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." }; try { await prisma.contactMessage.create({ data: parsed.data }); await sendContactNotification(parsed.data); return { ok: true, message: "Thank you. We’ll be in touch within one working day." }; } catch { return { ok: false, message: "We couldn’t send your message. Please email us directly." }; } }
