"use client";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

export function AddToCartButton({ product, compact = false, quantity = 1 }: { product: CatalogProduct; compact?: boolean; quantity?: number }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const add = () => { addItem(product, quantity); setAdded(true); if (timer.current) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setAdded(false), 1300); };
  if (compact) return <motion.button type="button" whileTap={{ scale: .88 }} aria-label={`Add ${product.name} to cart`} aria-live="polite" disabled={!product.stock} onClick={add} className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-clay-200 bg-clay-100 text-clay-500 shadow-sm transition hover:border-clay-400 hover:bg-clay-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">{added ? <Check size={16} /> : <Plus size={17} />}</motion.button>;
  return <Button disabled={!product.stock} onClick={add}>{added ? <Check size={17} /> : <ShoppingBag size={17} />}{added ? "Added to bag" : product.stock ? "Add to bag" : "Sold out"}</Button>;
}
