import Link from "next/link";
import Image from "next/image";
import type { CatalogProduct } from "@/lib/catalog";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { TiltCard } from "@/components/motion/TiltCard";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  return <article className="group relative">
    <Link href={`/products/${product.slug}`} data-cursor="View" className="block">
      <TiltCard>
        <div className="relative aspect-[.88] overflow-hidden rounded-3xl bg-clay-100 shadow-[0_12px_34px_rgba(90,45,20,.05)] transition-[box-shadow,transform] duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_54px_rgba(90,45,20,.13)]">
          <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {discount > 0 && <Badge className="absolute left-4 top-4">-{discount}%</Badge>}
          {lowStock && <span className="absolute bottom-4 left-4 rounded-full bg-white/75 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-clay-500 shadow-sm backdrop-blur">Only {product.stock} left</span>}
          <span aria-hidden="true" className="absolute right-4 top-4 h-2 w-2 rounded-full bg-white/80 opacity-0 backdrop-blur transition group-hover:opacity-100" />
        </div>
      </TiltCard>
    </Link>
    <div className="flex items-start justify-between gap-3 px-1 pt-4">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-clay-400">{product.category}</p>
        <Link href={`/products/${product.slug}`} data-cursor="View" className="mt-1 block truncate text-[15px] font-semibold text-ink transition-colors hover:text-clay-400">{product.name}</Link>
        <div className="mt-2 flex items-center gap-2"><span className="text-sm font-semibold text-ink">{formatINR(product.price)}</span>{product.compareAt && <span className="text-xs text-muted/60 line-through">{formatINR(product.compareAt)}</span>}</div>
      </div>
      <AddToCartButton product={product} compact />
    </div>
  </article>;
}

export function ProductGrid({ products }: { products: CatalogProduct[] }) { return <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>; }
