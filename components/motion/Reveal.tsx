"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export function Reveal({ className, delay = 0, y = 24, children, ...props }: HTMLMotionProps<"div"> & { delay?: number; y?: number }) {
  return <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ type: "spring", stiffness: 68, damping: 18, mass: 0.75, delay }} className={cn(className)} {...props}>{children}</motion.div>;
}
