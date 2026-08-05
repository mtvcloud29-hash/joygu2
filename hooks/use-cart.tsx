"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CatalogProduct } from "@/lib/catalog";

type CartItem = Pick<CatalogProduct, "id" | "slug" | "name" | "price" | "image" | "stock"> & { quantity: number };
type CartContextValue = { items: CartItem[]; itemCount: number; subtotal: number; addItem: (product: CatalogProduct, quantity?: number) => void; removeItem: (id: string) => void; updateQuantity: (id: string, quantity: number) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem("joyguru-cart"); if (saved) setItems(JSON.parse(saved) as CartItem[]); } finally { setHydrated(true); } }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("joyguru-cart", JSON.stringify(items)); }, [items, hydrated]);
  const value = useMemo(() => ({ items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0), addItem: (product: CatalogProduct, quantity = 1) => setItems((current) => { const existing = current.find((item) => item.id === product.id); if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, item.stock) } : item); return [...current, { id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, stock: product.stock, quantity: Math.min(quantity, product.stock) }]; }), removeItem: (id: string) => setItems((current) => current.filter((item) => item.id !== id)), updateQuantity: (id: string, quantity: number) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item)), clear: () => setItems([]) }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart must be used inside CartProvider"); return value; }
