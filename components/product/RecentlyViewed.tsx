"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { formatINR } from "@/lib/utils";

type ViewedProduct = { slug: string; name: string; image: string; price: number };
export function RecentlyViewed({ product }: { product: ViewedProduct }) { const [items, setItems] = useState<ViewedProduct[]>([]); useEffect(() => { let saved: ViewedProduct[] = []; try { saved = JSON.parse(localStorage.getItem("joyguru-recently-viewed") ?? "[]") as ViewedProduct[]; } catch { saved = []; } setItems(saved.filter((item) => item.slug !== product.slug).slice(0, 4)); localStorage.setItem("joyguru-recently-viewed", JSON.stringify([product, ...saved.filter((item) => item.slug !== product.slug)].slice(0, 8))); }, [product]); if (!items.length) return null; return <section className="mt-24 border-t border-clay-200 pt-16"><div className="flex items-end justify-between"><div><p className="eyebrow">A thread to follow</p><h2 className="section-title mt-3 text-4xl">Recently viewed.</h2></div><ArrowUpRight size={17} className="mb-1 text-clay-400" /></div><div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">{items.map((item) => <Link href={`/products/${item.slug}`} data-cursor="View" key={item.slug} className="group"><div className="relative aspect-[.9] overflow-hidden rounded-3xl bg-clay-100"><Image src={item.image} alt={item.name} fill sizes="25vw" className="object-cover transition duration-700 group-hover:scale-105" /></div><p className="mt-3 text-sm font-semibold text-ink">{item.name}</p><p className="mt-1 text-xs text-muted">{formatINR(item.price)}</p></Link>)}</div></section>; }
