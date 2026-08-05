import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { notifyPaymentFailed, notifyPaymentSuccess } from "@/lib/discord-webhooks";
import { getPrivateSettings } from "@/lib/settings";

type RazorpayEvent = { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; error_description?: string; error_reason?: string } } } };

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const settings = await getPrivateSettings();
  const secret = settings.payment.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  let event: RazorpayEvent;
  try { event = JSON.parse(body) as RazorpayEvent; } catch { return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 }); }
  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) return NextResponse.json({ received: true });
  const order = await prisma.order.findUnique({ where: { razorpayOrderId: payment.order_id }, include: { items: true } });
  if (!order) return NextResponse.json({ received: true });
  if (event.event === "payment.captured" && payment.id) {
    if (order.paymentStatus === "PAID") return NextResponse.json({ received: true });
    const updated = await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "CONFIRMED", razorpayPaymentId: payment.id }, include: { items: true } });
    await prisma.$transaction(async (tx) => { for (const item of updated.items) { const product = await tx.product.findUnique({ where: { id: item.productId } }); if (!product) continue; await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } }); await tx.inventoryHistory.create({ data: { productId: item.productId, previousStock: product.stock, newStock: product.stock - item.quantity, quantityChanged: -item.quantity, reason: "ORDER_PLACED", userId: updated.userId ?? undefined } }); } });
    notifyPaymentSuccess({ orderId: updated.orderNumber, paymentId: payment.id, amount: Number(updated.total), customer: updated.customerName, method: updated.paymentMethod });
  }
  if (event.event === "payment.failed") notifyPaymentFailed({ orderId: order.orderNumber, customer: order.customerName, reason: payment.error_reason ?? "Gateway rejected the payment", gatewayError: payment.error_description, amount: payment.amount ? payment.amount / 100 : Number(order.total) });
  return NextResponse.json({ received: true });
}
