"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!progressRef.current) return;
    const quickScale = gsap.quickTo(progressRef.current, "scaleX", { duration: 0.22, ease: "power3.out" });
    const trigger = ScrollTrigger.create({ start: "top top", end: "max", onUpdate: (self) => quickScale(self.progress) });
    return () => trigger.kill();
  }, []);
  return <div aria-hidden="true" className="pointer-events-none fixed left-0 right-0 top-0 z-[70] h-[2px] origin-left bg-transparent"><div ref={progressRef} className="h-full origin-left scale-x-0 bg-clay-400 shadow-[0_0_14px_rgba(216,140,88,.65)]" /></div>;
}
