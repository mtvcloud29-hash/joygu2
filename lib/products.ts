import { prisma } from "@/lib/prisma";
import { demoProducts, type CatalogProduct } from "@/lib/demo-data";
import { safeQuery } from "@/lib/safe-db";

function filterDemoProducts(filters?: { category?: string; query?: string; featured?: boolean }) {
  const query = filters?.query?.toLowerCase().trim();
  return demoProducts.filter((product) => (!filters?.category || product.categorySlug === filters.category) && (filters?.featured === undefined || product.featured === filters.featured) && (!query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query)));
}

export async function getProducts(filters?: { category?: string; query?: string; featured?: boolean }): Promise<CatalogProduct[]> {
  const fallback = filterDemoProducts(filters);
  const where = {
    active: true,
    ...(filters?.category ? { category: { slug: filters.category } } : {}),
    ...(filters?.query ? { OR: [{ name: { contains: filters.query, mode: "insensitive" as const } }, { description: { contains: filters.query, mode: "insensitive" as const } }] } : {}),
    ...(filters?.featured !== undefined ? { featured: filters.featured } : {})
  };
  return safeQuery(async () => {
    const products = await prisma.product.findMany({ where, include: { category: true, images: { orderBy: { sortOrder: "asc" } }, reviews: { where: { status: "APPROVED" }, select: { rating: true } } }, orderBy: { createdAt: "desc" } });
    return products.map((product) => ({ id: product.id, slug: product.slug, name: product.name, category: product.category.name, categorySlug: product.category.slug, description: product.description, price: Number(product.price), compareAt: product.compareAt ? Number(product.compareAt) : null, wholesalePrice: product.wholesalePrice ? Number(product.wholesalePrice) : null, stock: product.stock, material: product.material, dimensions: product.dimensions, weight: product.weight, usage: product.usage, benefits: product.benefits, image: product.images[0]?.url ?? "/images/photography/pottery-earth.jpg", gallery: product.images.length ? product.images.map((image) => image.url) : ["/images/photography/pottery-earth.jpg"], featured: product.featured, rating: product.reviews.length ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0, reviewCount: product.reviews.length }));
  }, fallback);
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

type ApprovedReview = { id: string; rating: number; body: string; user: { name: string } };
export async function getApprovedReviews(slug: string): Promise<ApprovedReview[]> {
  return safeQuery(async () => prisma.review.findMany({ where: { product: { slug }, status: "APPROVED" }, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 3 }).then((reviews) => reviews.map((review) => ({ id: review.id, rating: review.rating, body: review.body, user: review.user }))), []);
}
