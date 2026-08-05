"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorGlow() {
  const x = useSpring(useMotionValue(-100), { stiffness: 280, damping: 28, mass: .2 });
  const y = useSpring(useMotionValue(-100), { stiffness: 280, damping: 28, mass: .2 });
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => { x.set(event.clientX); y.set(event.clientY); const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]"); setLabel(target?.dataset.cursor ?? ""); };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);
  return <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[65] hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-clay-400/70 bg-[#f8f2ec]/20 text-[9px] font-bold uppercase tracking-[.16em] text-clay-500 mix-blend-multiply backdrop-blur-sm md:flex" animate={{ width: label ? 76 : 20, height: label ? 76 : 20, opacity: label ? .96 : .72 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} style={{ x, y }}><span className={label ? "block" : "hidden"}>{label}</span></motion.div>;
}
