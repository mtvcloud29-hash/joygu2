import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getCurrentUser } from "@/lib/auth";
import { createEmbed, discordColors, sendEmbedNow } from "@/lib/discord";
import { sendConfiguredEmail } from "@/lib/email";
import { getPrivateSettings } from "@/lib/settings";
import { getShippingProvider } from "@/lib/shipping/shiprocket";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null) as { type?: "discord" | "email" | "razorpay" | "shiprocket" } | null;
  const settings = await getPrivateSettings();

  try {
    if (body?.type === "discord") {
      const delivered = await sendEmbedNow(createEmbed({
        title: "✅ Discord settings test",
        description: "Joyguru Enterprise notifications are connected.",
        color: discordColors.success,
        fields: [
          { name: "Triggered by", value: user.email },
          { name: "Time", value: new Date().toISOString() }
        ]
      }));
      if (!delivered) return NextResponse.json({ error: "Discord rejected the test notification." }, { status: 502 });
      return NextResponse.json({ ok: true, message: "Discord test sent." });
    }

    if (body?.type === "email") {
      try {
        await sendConfiguredEmail({
          to: user.email,
          replyTo: settings.email.replyTo || settings.general.supportEmail || settings.general.businessEmail || settings.email.senderEmail,
          subject: "Joyguru Enterprise email settings test",
          text: "Your Joyguru Enterprise email settings are working."
        });
        return NextResponse.json({ ok: true, message: `Test email sent to ${user.email}.` });
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send test email." }, { status: 502 });
      }
    }

    if (body?.type === "razorpay") {
      if (!settings.payment.razorpayKeyId || !settings.payment.razorpaySecret) {
        return NextResponse.json({ error: "Configure Razorpay credentials first." }, { status: 400 });
      }
      const razorpay = new Razorpay({ key_id: settings.payment.razorpayKeyId, key_secret: settings.payment.razorpaySecret });
      await razorpay.orders.all({ count: 1 });
      return NextResponse.json({ ok: true, message: "Razorpay connection verified." });
    }

    if (body?.type === "shiprocket") {
      if (!settings.shipping.shiprocketEnabled) {
        return NextResponse.json({ error: "Shiprocket integration is disabled." }, { status: 400 });
      }
      if (!settings.shipping.shiprocketEmail || !settings.shipping.shiprocketPassword) {
        return NextResponse.json({ error: "Configure Shiprocket credentials first." }, { status: 400 });
      }

      const provider = getShippingProvider(settings.shipping.shiprocketEmail, settings.shipping.shiprocketPassword);
      if (!provider.testConnection) {
        return NextResponse.json(
          { error: "Shiprocket connection test is not available." },
          { status: 501 }
        );
      }
      try {
        await provider.testConnection();
        return NextResponse.json({ ok: true, message: "Shiprocket connection successful." });
      } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to verify Shiprocket connection." }, { status: 502 });
      }
    }

    return NextResponse.json({ error: "Unsupported test type." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to perform settings test." }, { status: 500 });
  }
}
