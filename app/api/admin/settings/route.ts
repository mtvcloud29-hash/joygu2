import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getPublicSettings, resetSettings, saveSettings, settingsSchema } from "@/lib/settings";

async function requireAdmin() { const user = await getCurrentUser(); return user && (user.role === "ADMIN" || user.role === "STAFF") ? user : null; }
export async function GET() { const user = await requireAdmin(); if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); return NextResponse.json({ settings: await getPublicSettings() }, { headers: { "Cache-Control": "no-store" } }); }
export async function POST(request: Request) { return save(request); }
export async function PUT(request: Request) { return save(request); }
export async function DELETE() { const user = await requireAdmin(); if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); try { return NextResponse.json({ ok: true, settings: await resetSettings() }); } catch { return NextResponse.json({ error: "Unable to reset settings." }, { status: 500 }); } }
async function save(request: Request) { const user = await requireAdmin(); if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const parsed = settingsSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid settings payload" }, { status: 400 }); try { const settings = await saveSettings(parsed.data); return NextResponse.json({ ok: true, settings }); } catch { return NextResponse.json({ error: "Unable to save settings." }, { status: 500 }); } }
