"use client";
import { motion } from "framer-motion";

type Point = { label: string; value: number };
export function RevenueChart({ points }: { points: Point[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const width = 720;
  const height = 240;
  const path = points.map((point, index) => { const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width; const y = height - (point.value / max) * (height - 24) - 12; return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`; }).join(" ");
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;
  return <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-[#f8f2ec] p-4 sm:p-6"><div className="absolute inset-x-6 top-6 flex justify-between text-[10px] font-bold uppercase tracking-[.14em] text-muted"><span>Revenue · 30 days</span><span>₹{Math.round(max).toLocaleString("en-IN")} peak</span></div><svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="absolute inset-x-5 bottom-8 top-14 h-[calc(100%-88px)] w-[calc(100%-40px)] overflow-visible"><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#D88C58" stopOpacity=".28" /><stop offset="1" stopColor="#D88C58" stopOpacity="0" /></linearGradient></defs><path d={area} fill="url(#revenue-fill)" /><motion.path d={path} fill="none" stroke="#B86134" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} /></svg><div className="absolute bottom-3 left-6 right-6 flex justify-between text-[10px] text-muted"><span>{points[0]?.label ?? "—"}</span><span>{points[Math.floor(points.length / 2)]?.label ?? "—"}</span><span>{points[points.length - 1]?.label ?? "—"}</span></div></div>;
}
