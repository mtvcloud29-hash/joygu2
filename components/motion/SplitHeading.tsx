"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText);

export function SplitHeading({ children, className, as = "h2", delay = 0 }: { children: React.ReactNode; className?: string; as?: "h1" | "h2" | "h3"; delay?: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      const split = SplitText.create(ref.current, { type: "lines,words", mask: "lines" });
      gsap.from(split.lines, { yPercent: 112, rotateX: -15, opacity: 0, duration: 1.05, stagger: .085, delay, ease: "power4.out", scrollTrigger: { trigger: ref.current, start: "top 86%", once: true } });
      return () => split.revert();
    }, ref);
    return () => context.revert();
  }, [delay]);
  const props = { ref, className: cn(className) };
  if (as === "h1") return <h1 {...props}>{children}</h1>;
  if (as === "h3") return <h3 {...props}>{children}</h3>;
  return <h2 {...props}>{children}</h2>;
}
