"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type MagneticLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "data-cursor"> & { href: string; "data-cursor"?: string };

export function MagneticLink({ className, children, "data-cursor": cursor = "Explore", ...props }: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.45 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.45 });
  const move = (event: React.PointerEvent<HTMLDivElement>) => { const rect = ref.current?.getBoundingClientRect(); if (!rect) return; x.set((event.clientX - (rect.left + rect.width / 2)) * 0.16); y.set((event.clientY - (rect.top + rect.height / 2)) * 0.16); };
  return <motion.div style={{ x, y }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }}><a ref={ref} className={cn("button-primary", className)} {...props} data-cursor={cursor}>{children}</a></motion.div>;
}
