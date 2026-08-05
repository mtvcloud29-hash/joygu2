"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const activeImage = images[active] ?? images[0];
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setLightboxOpen(false); if (event.key === "ArrowRight") setActive((current) => (current + 1) % images.length); if (event.key === "ArrowLeft") setActive((current) => (current - 1 + images.length) % images.length); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [images.length]);
  return <>
    <div className="grid gap-3 sm:grid-cols-[88px_1fr]">
      <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">{images.map((image, index) => <motion.button key={image} type="button" whileTap={{ scale: .94 }} onClick={() => setActive(index)} aria-label={`View ${name}, image ${index + 1}`} className={`relative aspect-square w-20 overflow-hidden rounded-2xl border-2 bg-clay-100 transition-colors ${active === index ? "border-clay-400" : "border-transparent"}`}><Image src={image} alt={`${name} view ${index + 1}`} fill sizes="80px" className="object-cover" /></motion.button>)}</div>
      <div onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={(event) => { const start = touchStart.current; const end = event.changedTouches[0]?.clientX; touchStart.current = null; if (start === null || end === undefined || Math.abs(end - start) < 42) return; setActive((current) => end < start ? (current + 1) % images.length : (current - 1 + images.length) % images.length); }} className="group relative order-1 aspect-square overflow-hidden rounded-[2rem] bg-clay-100 sm:order-2">
        <AnimatePresence mode="wait"><motion.button key={activeImage} type="button" onClick={() => setLightboxOpen(true)} data-cursor="Zoom" initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .55, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 h-full w-full cursor-zoom-in"><Image src={activeImage} alt={name} fill priority sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition duration-1000 group-hover:scale-105" /></motion.button></AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/45 to-transparent p-5 pt-16 opacity-0 transition duration-500 group-hover:opacity-100"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-white">View in detail</span><Maximize2 size={16} className="text-white" /></div>
      </div>
    </div>
    <AnimatePresence>{lightboxOpen && <motion.div role="dialog" aria-modal="true" aria-label={`${name} image viewer`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-5 backdrop-blur-xl sm:p-10" onClick={() => setLightboxOpen(false)}><motion.div initial={{ scale: .92, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .94 }} transition={{ type: "spring", stiffness: 160, damping: 22 }} className="relative h-full w-full max-w-5xl" onClick={(event) => event.stopPropagation()}><Image src={activeImage} alt={name} fill sizes="100vw" className="object-contain" /><button type="button" aria-label="Close image viewer" onClick={() => setLightboxOpen(false)} className="absolute right-0 top-0 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/20"><X size={20} /></button><p className="absolute bottom-0 left-0 text-xs font-semibold uppercase tracking-[.18em] text-white/60">{name} · {active + 1} / {images.length}</p></motion.div></motion.div>}</AnimatePresence>
  </>;
}
