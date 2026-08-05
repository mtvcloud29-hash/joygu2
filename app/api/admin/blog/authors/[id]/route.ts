import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
async function admin() { const user = await getCurrentUser(); return user && (user.role === "ADMIN" || user.role === "STAFF") ? user : null; }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { if (!await admin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 }); const id = (await params).id; const count = await prisma.blogPost.count({ where: { authorId: id } }); if (count > 0) return NextResponse.json({ error: "Authors with posts cannot be deleted. Reassign their posts first." }, { status: 409 }); await prisma.user.update({ where: { id }, data: { authorSlug: null, authorBio: null, authorAvatarUrl: null, authorWebsite: null, authorSocialLinks: Prisma.JsonNull, featuredAuthor: false } }); return NextResponse.json({ ok: true }); }
