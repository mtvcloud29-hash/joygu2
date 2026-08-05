import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
const schema = z.object({ order: z.string().min(6), email: z.string().email() });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Enter your order number and email." }, { status: 400 }); const order = await prisma.order.findFirst({ where: { orderNumber: parsed.data.order.toUpperCase(), email: parsed.data.email.toLowerCase() }, select: { orderNumber: true, status: true, paymentStatus: true, createdAt: true, updatedAt: true, items: { select: { name: true, quantity: true } } } }); if (!order) return NextResponse.json({ error: "We couldn’t find an order with those details." }, { status: 404 }); return NextResponse.json({ ok: true, order }); }
