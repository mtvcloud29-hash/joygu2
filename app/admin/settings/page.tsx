import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getPublicSettings } from "@/lib/settings";
import { SettingsClient } from "@/components/admin/settings/SettingsClient";

export const dynamic = "force-dynamic";
export default async function AdminSettingsPage() { const user = await getCurrentUser(); if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) redirect("/account/login"); return <SettingsClient initialSettings={await getPublicSettings()} />; }
