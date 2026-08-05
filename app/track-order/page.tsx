import type { Metadata } from "next";
import { TrackForm } from "@/components/track/TrackForm";
export const metadata: Metadata = { title: "Track your order" };
export default function TrackOrderPage() { return <main className="container-shell py-16 lg:py-24"><p className="eyebrow">Order tracking</p><h1 className="section-title mt-4">Where is your<br /><em className="font-normal text-clay-400">clayware?</em></h1><p className="body-copy mt-6 max-w-md">Enter the order number from your confirmation email and the email address used at checkout.</p><div className="mt-10"><TrackForm /></div></main>; }
