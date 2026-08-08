import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrivateSettings } from "@/lib/settings";
import { getShippingProvider } from "@/lib/shipping/shiprocket";

async function admin() {
  const user = await getCurrentUser();
  return user && (user.role === "ADMIN" || user.role === "STAFF") ? user : null;
}

const schema = z.object({ orderId: z.string().cuid(), pickupLocation: z.string().min(1), weight: z.coerce.number().positive().default(1) });

export async function POST(request: Request) {
  if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid shipment request." }, { status: 400 });

  try {
    const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const address = order.address as { name?: string; phone?: string; line1?: string; city?: string; state?: string; pincode?: string; country?: string };
    const settings = await getPrivateSettings();
    if (!settings.shipping.shiprocketEnabled) return NextResponse.json({ error: "Shiprocket integration is disabled." }, { status: 400 });
    if (!settings.shipping.shiprocketEmail || !settings.shipping.shiprocketPassword) return NextResponse.json({ error: "Configure Shiprocket credentials first." }, { status: 400 });

    const provider = getShippingProvider(settings.shipping.shiprocketEmail, settings.shipping.shiprocketPassword);
    const result = await provider.createShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      email: order.email,
      address: {
        name: order.customerName,
        phone: order.phone,
        line1: String(address.line1 ?? ""),
        city: String(address.city ?? ""),
        state: String(address.state ?? ""),
        pincode: String(address.pincode ?? ""),
        country: "India"
      },
      items: order.items.map((item) => ({ name: item.name, quantity: item.quantity, price: Number(item.price) })),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      weight: parsed.data.weight,
      pickupLocation: parsed.data.pickupLocation
    });

    const shipment = await prisma.shipment.upsert({
      where: { orderId: order.id },
      update: { provider: result.providerShipmentId ? "SHIPROCKET" : "UNKNOWN", trackingNumber: result.awb, awb: result.awb, courier: result.courier, status: result.status, labelUrl: result.labelUrl, trackingUrl: result.trackingUrl },
      create: { orderId: order.id, provider: "SHIPROCKET", trackingNumber: result.awb, awb: result.awb, courier: result.courier, status: result.status, labelUrl: result.labelUrl, trackingUrl: result.trackingUrl }
    });

    return NextResponse.json({ ok: true, shipment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create shipment." }, { status: 503 });
  }
}
