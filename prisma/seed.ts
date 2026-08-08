import { PrismaClient, DiscountType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { catalog, categories } from "../lib/catalog";

const prisma = new PrismaClient();
async function main() {
  const categoryRecords = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const record = await prisma.category.upsert({ where: { slug: category.slug }, update: { name: category.name, description: category.description, image: category.image, sortOrder: index, active: true }, create: { name: category.name, slug: category.slug, description: category.description, image: category.image, sortOrder: index, active: true } });
    categoryRecords.set(category.slug, record.id);
  }
  for (const item of catalog) {
    const categoryId = categoryRecords.get(item.categorySlug);
    if (!categoryId) continue;
    await prisma.product.upsert({ where: { slug: item.slug }, update: { id: item.id, categoryId, name: item.name, description: item.description, price: item.price, compareAt: item.compareAt, wholesalePrice: item.wholesalePrice, stock: item.stock, material: item.material, dimensions: item.dimensions, weight: item.weight, usage: item.usage, benefits: item.benefits, featured: item.featured, active: true, images: { deleteMany: {}, create: item.gallery.map((url, sortOrder) => ({ url, alt: item.name, sortOrder })) } }, create: { id: item.id, categoryId, slug: item.slug, name: item.name, description: item.description, price: item.price, compareAt: item.compareAt, wholesalePrice: item.wholesalePrice, stock: item.stock, material: item.material, dimensions: item.dimensions, weight: item.weight, usage: item.usage, benefits: item.benefits, featured: item.featured, active: true, images: { create: item.gallery.map((url, sortOrder) => ({ url, alt: item.name, sortOrder })) } } });
  }
  const adminEmail = (process.env.SUPER_ADMIN_EMAIL ?? "admin123@gml.com").trim().toLowerCase();
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) throw new Error("SUPER_ADMIN_PASSWORD must be set before seeding the admin account.");
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({ where: { email: adminEmail }, update: { role: Role.ADMIN, emailVerifiedAt: new Date(), isActive: true, permissions: { all: true } }, create: { name: "Joyguru Super Admin", email: adminEmail, passwordHash, role: Role.ADMIN, emailVerifiedAt: new Date(), isActive: true, permissions: { all: true } } });
  await prisma.coupon.upsert({ where: { code: "WELCOME10" }, update: {}, create: { code: "WELCOME10", type: DiscountType.PERCENTAGE, value: 10, minSubtotal: 999, active: true } });
  console.log(`Seeded ${catalog.length} products across ${categories.length} categories.`);
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
