"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) { const ref = useRef<HTMLDivElement>(null); const px = useMotionValue(0.5); const py = useMotionValue(0.5); const rotateX = useSpring(useTransform(py, [0, 1], [4, -4]), { stiffness: 180, damping: 22 }); const rotateY = useSpring(useTransform(px, [0, 1], [-4, 4]), { stiffness: 180, damping: 22 }); return <motion.div ref={ref} style={{ rotateX, rotateY, transformPerspective: 900 }} onPointerMove={(event) => { const rect = ref.current?.getBoundingClientRect(); if (!rect) return; px.set((event.clientX - rect.left) / rect.width); py.set((event.clientY - rect.top) / rect.height); }} onPointerLeave={() => { px.set(0.5); py.set(0.5); }} className={cn(className)}>{children}</motion.div>; }
