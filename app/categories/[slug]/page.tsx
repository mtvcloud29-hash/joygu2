import { notFound } from "next/navigation";
import { categories } from "@/lib/catalog";
import { getProducts } from "@/lib/products";
import { ProductGrid } from "@/components/product/ProductCard";
export const dynamic = "force-dynamic";
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) { const slug = (await params).slug; const category = categories.find((item) => item.slug === slug); if (!category) notFound(); const products = await getProducts({ category: slug }); return <main className="container-shell py-16 lg:py-24"><p className="eyebrow">Collection / {category.name}</p><h1 className="section-title mt-4">{category.name}<br /><em className="font-normal text-clay-400">{category.description.toLowerCase()}</em></h1><p className="body-copy mt-6 max-w-lg">Thoughtful forms, made in Bengal and designed to find a place in your everyday.</p><div className="mt-14"><ProductGrid products={products} /></div></main>; }
