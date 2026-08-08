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

const schema = z.object({ shipmentId: z.string().cuid(), action: z.enum(["awb", "pickup", "track", "cancel"]) });

export async function POST(request: Request) {
	const user = await admin();
	if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const p = schema.safeParse(await request.json().catch(() => null));
	if (!p.success) return NextResponse.json({ error: "Invalid shipment action." }, { status: 400 });
	const shipment = await prisma.shipment.findUnique({ where: { id: p.data.shipmentId }, include: { order: true } });
	if (!shipment) return NextResponse.json({ error: "Shipment not found." }, { status: 404 });

	try {
		const settings = await getPrivateSettings();
		const provider = getShippingProvider(settings.shipping.shiprocketEmail || undefined, settings.shipping.shiprocketPassword || undefined);
		let result;

		if (p.data.action === "awb") {
			result = await provider.assignAwb(shipment.trackingNumber ?? shipment.orderId);
		} else if (p.data.action === "pickup") {
			result = await provider.schedulePickup(shipment.trackingNumber ?? shipment.orderId);
		} else if (p.data.action === "track") {
			if (!shipment.awb) return NextResponse.json({ error: "AWB is required for tracking." }, { status: 400 });
			result = await provider.getTracking(shipment.awb);
		} else {
			if (!shipment.awb) return NextResponse.json({ error: "AWB is required for cancellation." }, { status: 400 });
			result = await provider.cancelShipment(shipment.awb);
		}

		const updated = await prisma.shipment.update({ where: { id: shipment.id }, data: { status: result.status, awb: result.awb ?? shipment.awb, trackingNumber: result.awb ?? shipment.trackingNumber, courier: result.courier ?? shipment.courier, trackingUrl: result.trackingUrl ?? shipment.trackingUrl } });
		await prisma.activityLog.create({ data: { userId: user.id, action: "UPDATE", entity: "Shipment", entityId: shipment.id, metadata: { action: p.data.action, status: result.status } } });
		return NextResponse.json({ ok: true, shipment: updated });
	} catch (error) {
		return NextResponse.json({ error: error instanceof Error ? error.message : "Shipping action failed." }, { status: 503 });
	}
}
