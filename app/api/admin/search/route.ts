import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Result = { id: string; type: string; group: string; title: string; description: string; href: string };
const text = (value: unknown) => String(value ?? "");
function can(user: { role: string; permissions: unknown }, module: string) { if (user.role === "ADMIN") return true; const permissions = user.permissions; if (permissions && typeof permissions === "object" && !Array.isArray(permissions) && (permissions as { all?: boolean }).all === true) return true; return false; }
async function admin() { return getCurrentUser(); }
export async function GET(request: Request) {
  const user = await admin();
  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const params = new URL(request.url).searchParams; const q = params.get("q")?.trim(); const page = Math.max(1, Number(params.get("page") ?? 1));
  if (!q || q.length < 2) return NextResponse.json({ query: q ?? "", groups: [], total: 0, page, pages: 0 });
  const take = 6; const contains = { contains: q, mode: "insensitive" as const };
  const [products, categories, orders, users, roles, warehouses, suppliers, purchases, posts, blogCategories, comments, media, pages, notifications, activity] = await Promise.all([
    prisma.product.findMany({ where: { OR: [{ name: contains }, { slug: contains }, { description: contains }] }, select: { id: true, name: true, slug: true, description: true }, take }),
    prisma.category.findMany({ where: { OR: [{ name: contains }, { slug: contains }, { description: contains }] }, select: { id: true, name: true, slug: true, description: true }, take }),
    prisma.order.findMany({ where: { OR: [{ orderNumber: contains }, { customerName: contains }, { email: contains }] }, select: { id: true, orderNumber: true, customerName: true, email: true }, take }),
    prisma.user.findMany({ where: { OR: [{ name: contains }, { email: contains }, { phone: contains }] }, select: { id: true, name: true, email: true, role: true }, take }),
    prisma.staffRole.findMany({ where: { OR: [{ name: contains }, { slug: contains }] }, select: { id: true, name: true, slug: true, description: true }, take }),
    prisma.warehouse.findMany({ where: { OR: [{ name: contains }, { address: contains }, { manager: contains }] }, select: { id: true, name: true, address: true }, take }),
    prisma.supplier.findMany({ where: { OR: [{ name: contains }, { company: contains }, { email: contains }, { phone: contains }] }, select: { id: true, name: true, company: true, email: true }, take }),
    prisma.purchase.findMany({ where: { OR: [{ invoiceNumber: contains }, { notes: contains }] }, select: { id: true, invoiceNumber: true, notes: true }, take }),
    prisma.blogPost.findMany({ where: { OR: [{ title: contains }, { slug: contains }, { excerpt: contains }, { content: contains }] }, select: { id: true, title: true, slug: true, excerpt: true }, take }),
    prisma.blogCategory.findMany({ where: { OR: [{ name: contains }, { slug: contains }, { description: contains }] }, select: { id: true, name: true, slug: true, description: true }, take }),
    prisma.blogComment.findMany({ where: { OR: [{ name: contains }, { email: contains }, { body: contains }] }, select: { id: true, name: true, email: true, body: true, postId: true }, take }),
    can(user, "media") ? prisma.mediaAsset.findMany({ where: { OR: [{ name: contains }, { key: contains }, { folder: contains }] }, select: { id: true, name: true, key: true, folder: true }, take }) : Promise.resolve([]),
    can(user, "cms") ? prisma.cmsPage.findMany({ where: { OR: [{ title: contains }, { slug: contains }] }, select: { id: true, title: true, slug: true }, take }) : Promise.resolve([]),
    can(user, "notifications") ? prisma.adminNotification.findMany({ where: { OR: [{ title: contains }, { message: contains }, { type: contains }] }, select: { id: true, title: true, message: true }, take }) : Promise.resolve([]),
    can(user, "auditLogs") || user.role === "ADMIN" ? prisma.activityLog.findMany({ where: { OR: [{ entity: contains }, { entityId: contains }] }, select: { id: true, entity: true, entityId: true, action: true }, take }) : Promise.resolve([])
  ]);
  const groups: Array<{ group: string; results: Result[] }> = [];
  const add = (group: string, results: Result[]) => { if (results.length) groups.push({ group, results }); };
  add("Products", products.map((x) => ({ id: x.id, type: "product", group: "Products", title: x.name, description: x.description, href: `/products/${x.slug}` })));
  add("Categories", categories.map((x) => ({ id: x.id, type: "category", group: "Categories", title: x.name, description: x.description ?? x.slug, href: `/categories/${x.slug}` })));
  add("Orders", orders.map((x) => ({ id: x.id, type: "order", group: "Orders", title: x.orderNumber, description: `${x.customerName} · ${x.email}`, href: `/admin/orders/${x.id}` })));
  add("Customers / Users", users.map((x) => ({ id: x.id, type: x.role === "CUSTOMER" ? "customer" : "staff", group: "Customers / Users", title: x.name, description: `${x.email} · ${x.role}`, href: x.role === "CUSTOMER" ? `/admin/customers/${x.id}` : `/admin/staff/${x.id}` })));
  add("Roles", roles.map((x) => ({ id: x.id, type: "role", group: "Roles", title: x.name, description: x.description ?? x.slug, href: "/admin/roles" })));
  add("Warehouses", warehouses.map((x) => ({ id: x.id, type: "warehouse", group: "Warehouses", title: x.name, description: x.address, href: "/admin/warehouses" })));
  add("Suppliers", suppliers.map((x) => ({ id: x.id, type: "supplier", group: "Suppliers", title: x.company, description: `${x.name} · ${x.email}`, href: "/admin/suppliers" })));
  add("Purchases", purchases.map((x) => ({ id: x.id, type: "purchase", group: "Purchases", title: x.invoiceNumber, description: x.notes ?? "Purchase entry", href: "/admin/purchases" })));
  add("Blog", posts.map((x) => ({ id: x.id, type: "blog", group: "Blog", title: x.title, description: x.excerpt ?? x.slug, href: `/admin/blog/${x.id}` })));
  add("Blog Categories", blogCategories.map((x) => ({ id: x.id, type: "blog-category", group: "Blog Categories", title: x.name, description: x.description ?? x.slug, href: "/admin/blog/categories" })));
  add("Comments", comments.map((x) => ({ id: x.id, type: "comment", group: "Blog Comments", title: x.name, description: `${x.email} · ${x.body}`, href: "/admin/blog/comments" })));
  add("Media", media.map((x) => ({ id: x.id, type: "media", group: "Media", title: x.name, description: `${x.folder} · ${x.key}`, href: "/admin/media" })));
  add("CMS Pages", pages.map((x) => ({ id: x.id, type: "cms-page", group: "CMS Pages", title: x.title, description: x.slug, href: "/admin/page-builder" })));
  add("Notifications", notifications.map((x) => ({ id: x.id, type: "notification", group: "Notifications", title: x.title, description: x.message, href: "/admin/notifications" })));
  add("Activity", activity.map((x) => ({ id: x.id, type: "activity", group: "Activity Logs", title: `${x.action} · ${x.entity}`, description: x.entityId ?? "", href: "/admin/activity" })));
  await prisma.activityLog.create({ data: { userId: user.id, action: "SEARCH", entity: "GlobalSearch", metadata: { queryLength: q.length, resultCount: groups.reduce((n, group) => n + group.results.length, 0) } } });
  return NextResponse.json({ query: q, groups, total: groups.reduce((n, group) => n + group.results.length, 0), page, pages: 1 });
}
