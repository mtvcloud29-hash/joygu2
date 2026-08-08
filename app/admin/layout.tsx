"use client";
import { useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
export default function AdminLayout({ children }: { children: React.ReactNode }) { useEffect(() => { document.body.classList.add("admin-mode"); return () => document.body.classList.remove("admin-mode"); }, []); return <AdminShell>{children}</AdminShell>; }
