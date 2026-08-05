import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, ChevronRight, Star, Truck } from "lucide-react";
import { getApprovedReviews, getProductBySlug, getProducts } from "@/lib/products";
import { formatINR } from "@/lib/utils";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductGrid } from "@/components/product/ProductCard";
import { WishlistButton } from "@/components/product/WishlistButton";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { ShareProductButton } from "@/components/product/ShareProductButton";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/Reveal";
import { absoluteUrl } from "@/lib/utils";
import { safeJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return product ? { title: product.name, description: product.description, openGraph: { title: product.name, description: product.description, images: [product.image] }, alternates: { canonical: absoluteUrl(`/products/${product.slug}`) } } : { title: "Piece not found" };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const [related, reviews] = await Promise.all([getProducts({ category: product.categorySlug }), getApprovedReviews(slug)]);
  const relatedProducts = related.filter((item) => item.id !== product.id).slice(0, 4);
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const productSchema = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: product.gallery.map((image) => absoluteUrl(image)), sku: product.id, brand: { "@type": "Brand", name: "Joyguru Enterprise" }, offers: { "@type": "Offer", url: absoluteUrl(`/products/${product.slug}`), priceCurrency: "INR", price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }, ...(product.reviewCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.toFixed(1), reviewCount: product.reviewCount } } : {}) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Products", item: absoluteUrl("/products") }, { "@type": "ListItem", position: 2, name: product.category, item: absoluteUrl(`/categories/${product.categorySlug}`) }, { "@type": "ListItem", position: 3, name: product.name, item: absoluteUrl(`/products/${product.slug}`) }] };
  return <main className="container-shell py-10 lg:py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }} />
    <Link href="/products" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-clay-400"><ChevronRight size={15} className="rotate-180" /> Back to collection</Link>
    <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
      <Reveal y={14}><ProductGallery images={product.gallery} name={product.name} /></Reveal>
      <Reveal delay={.08} className="lg:sticky lg:top-28 lg:self-start lg:py-3"><div className="flex items-center justify-between"><Badge>{product.category}</Badge><WishlistButton productId={product.id} /></div><h1 className="display mt-6 text-5xl font-semibold leading-[.88] tracking-[-.045em] text-ink sm:text-7xl">{product.name}</h1><div className="mt-6 flex flex-wrap items-center gap-3"><span className="text-xl font-semibold text-ink">{formatINR(product.price)}</span>{product.compareAt && <><span className="text-sm text-muted/60 line-through">{formatINR(product.compareAt)}</span><Badge>-{discount}%</Badge></>}</div><div className="mt-4 flex items-center gap-2 text-xs text-muted"><span className="flex items-center gap-1 text-clay-400"><Star size={14} fill="currentColor" /> {product.rating ? product.rating.toFixed(1) : "New"}</span><span>·</span><span>{product.reviewCount ? `${product.reviewCount} considered reviews` : "Be the first to review"}</span></div><p className="body-copy mt-8 max-w-lg text-base">{product.description}</p><div className="mt-9 flex flex-wrap items-center gap-4"><AddToCartButton product={product} /><a href={`https://wa.me/919775733649?text=${encodeURIComponent(`Hello Joyguru, I’m interested in ${product.name}.`)}`} target="_blank" rel="noreferrer" className="button-quiet">WhatsApp enquiry</a><ShareProductButton name={product.name} /></div><div className="mt-10 grid gap-3 border-y border-clay-200 py-6 text-sm text-muted sm:grid-cols-2"><div className="flex gap-3"><Check size={17} className="shrink-0 text-clay-400" /><span>Handmade in small batches</span></div><div className="flex gap-3"><Truck size={17} className="shrink-0 text-clay-400" /><span>Ships across India</span></div><div className="flex gap-3"><Check size={17} className="shrink-0 text-clay-400" /><span>{product.stock > 5 ? "In stock, ready to ship" : `Only ${product.stock} left`}</span></div><div className="flex gap-3"><Check size={17} className="shrink-0 text-clay-400" /><span>Secure checkout</span></div></div><div className="mt-8 grid gap-5 border-b border-clay-200 pb-8 sm:grid-cols-2"><div><p className="eyebrow">Details</p><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-muted">Material</dt><dd className="text-right font-semibold text-ink">{product.material}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Dimensions</dt><dd className="text-right font-semibold text-ink">{product.dimensions}</dd></div><div className="flex justify-between gap-3"><dt className="text-muted">Weight</dt><dd className="text-right font-semibold text-ink">{product.weight}</dd></div></dl></div><div><p className="eyebrow">Good to know</p><ul className="mt-4 space-y-3 text-sm text-muted">{product.benefits.map((benefit) => <li className="flex gap-2" key={benefit}><Check size={15} className="mt-0.5 shrink-0 text-clay-400" />{benefit}</li>)}</ul></div></div><Link href="/wholesale" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-clay-500 hover:text-clay-400">Need quantities for a business? Explore wholesale <ArrowRight size={15} /></Link></Reveal>
    </div>
    {reviews.length > 0 && <Reveal className="mt-24 border-t border-clay-200 pt-16"><div className="flex items-end justify-between"><div><p className="eyebrow">From considered homes</p><h2 className="section-title mt-3 text-4xl">What people say.</h2></div><div className="hidden items-center gap-2 text-sm text-clay-400 sm:flex"><Star size={15} fill="currentColor" /> {product.rating.toFixed(1)} average</div></div><div className="mt-10 grid gap-4 md:grid-cols-3">{reviews.map((review) => <article key={review.id} className="surface flex min-h-52 flex-col justify-between p-6"><div className="flex gap-1 text-clay-400">{Array.from({ length: review.rating }).map((_, index) => <Star key={index} size={13} fill="currentColor" />)}</div><p className="mt-8 text-sm leading-6 text-ink">“{review.body}”</p><p className="mt-6 text-xs font-semibold uppercase tracking-[.14em] text-muted">{review.user.name}</p></article>)}</div></Reveal>}
    <RecentlyViewed product={{ slug: product.slug, name: product.name, image: product.image, price: product.price }} />
    {relatedProducts.length > 0 && <Reveal className="mt-24 border-t border-clay-200 pt-16"><div className="flex items-end justify-between"><div><p className="eyebrow">You may also like</p><h2 className="section-title mt-3 text-4xl">More from {product.category}.</h2></div><Link href={`/products?category=${product.categorySlug}`} className="hidden items-center gap-2 text-sm font-semibold text-clay-500 sm:inline-flex">View all <ArrowRight size={15} /></Link></div><div className="mt-10"><ProductGrid products={relatedProducts} /></div></Reveal>}
  </main>;
}
