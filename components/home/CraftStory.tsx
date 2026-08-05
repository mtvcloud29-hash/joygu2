"use client";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Flame, Hand, Leaf } from "lucide-react";
import { useRef } from "react";

const steps = [
  { number: "01", label: "The earth", title: "Begin with what the land gives us.", body: "Local clay, prepared slowly and left with the memory of the hands that will shape it.", image: "/images/photography/pottery-earth.jpg", icon: Leaf },
  { number: "02", label: "The hand", title: "A form begins in the palm.", body: "A quiet rhythm of throwing, trimming and waiting. There is no shortcut to a good form.", image: "/images/photography/pottery-wheel.jpg", icon: Hand },
  { number: "03", label: "The air", title: "Time is part of the material.", body: "Every piece rests in the open air until its surface and its structure are ready for what comes next.", image: "/images/photography/ceramics-close.jpg", icon: Leaf },
  { number: "04", label: "The kiln", title: "Fire gives it a future.", body: "Fired in small batches, the clay finds its strength, colour and final character.", image: "/images/photography/pottery-heritage.jpg", icon: Flame },
  { number: "05", label: "The home", title: "Made to become part of yours.", body: "A vessel leaves the studio and enters a slower story — your table, your morning, your everyday.", image: "/images/photography/pottery-market.jpg", icon: Hand }
];

function StoryLayer({ step, index, progress }: { step: typeof steps[number]; index: number; progress: MotionValue<number> }) {
  const start = index / steps.length;
  const fade = useTransform(progress, index === 0 ? [0, .12, .25] : [Math.max(0, start - .07), start + .04, Math.min(1, start + .22)], index === 0 ? [1, 1, 0] : [0, 1, index === steps.length - 1 ? 1 : 0]);
  const scale = useTransform(progress, [Math.max(0, start - .07), start + .2], [1.08, 1]);
  const y = useTransform(progress, [Math.max(0, start - .07), start + .14], [28, 0]);
  const Icon = step.icon;
  return <motion.div style={{ opacity: fade, scale }} className="absolute inset-0"><Image src={step.image} alt="" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/5 to-transparent" /><motion.div style={{ y }} className="absolute inset-x-0 bottom-0 p-7 sm:p-10"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-clay-200">{step.number} · {step.label}</p><p className="display mt-3 text-4xl font-semibold leading-[.9] text-white sm:text-5xl">{step.title}</p><p className="mt-4 max-w-sm text-sm leading-6 text-white/70">{step.body}</p><Icon size={20} className="mt-6 text-clay-200" /></motion.div></motion.div>;
}

export function CraftStory() {
  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: .5 });
  const lineProgress = useTransform(progress, [0, 1], [0, 1]);
  return <section ref={storyRef} className="relative h-[500vh] bg-ink text-white"><div className="sticky top-0 flex min-h-screen items-center overflow-hidden py-12 lg:py-20"><div className="container-shell w-full"><div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:items-center"><div className="relative z-10"><p className="eyebrow text-clay-300">The making of a piece</p><h2 className="section-title mt-5 max-w-md text-white">From earth<br /><em className="font-normal text-clay-300">to everyday.</em></h2><p className="mt-7 max-w-sm text-sm leading-7 text-white/60">A piece of Joyguru is never made in a hurry. Scroll through the quiet stages that give every object its character.</p><div className="mt-12 hidden items-center gap-4 lg:flex"><div className="relative h-36 w-px bg-white/15"><motion.div style={{ scaleY: lineProgress }} className="absolute inset-x-0 top-0 h-full origin-top bg-clay-300" /></div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-white/45">Scroll<br />the process</div></div></div><div className="relative aspect-[.82] overflow-hidden rounded-[2rem] bg-[#7e3b26] shadow-[0_30px_80px_rgba(0,0,0,.25)] sm:aspect-[1.05] lg:aspect-[.98]"><div className="absolute inset-0">{steps.map((step, index) => <StoryLayer key={step.number} step={step} index={index} progress={progress} />)}</div><div className="pointer-events-none absolute left-5 top-5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/70 backdrop-blur-xl">Joyguru studio · West Bengal</div></div></div></div></div></section>;
}
