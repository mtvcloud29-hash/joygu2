"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function IntroLoader() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (window.sessionStorage.getItem("joyguru-intro-seen")) return; setVisible(true); const timer = window.setTimeout(() => { window.sessionStorage.setItem("joyguru-intro-seen", "1"); setVisible(false); }, 1250); return () => window.clearTimeout(timer); }, []);
  return <AnimatePresence>{visible && <motion.div role="status" aria-label="Loading Joyguru Enterprise" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: .65, ease: [0.22, 1, 0.36, 1] } }} className="fixed inset-0 z-[100] flex items-center justify-center bg-ink text-[#f8f2ec]"><div className="text-center"><motion.div initial={{ scale: .65, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 16 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-clay-300/60"><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }} className="block h-11 w-11 rounded-[46%] border-2 border-clay-300 border-t-transparent" /></motion.div><p className="mt-8 text-[10px] font-bold uppercase tracking-[.24em] text-clay-300">Joyguru Enterprise</p><p className="display mt-3 text-3xl text-white">Objects with an old soul.</p><button type="button" onClick={() => { window.sessionStorage.setItem("joyguru-intro-seen", "1"); setVisible(false); }} className="mt-10 text-[10px] font-bold uppercase tracking-[.18em] text-white/50 transition hover:text-white">Enter · skip intro</button></div></motion.div>}</AnimatePresence>;
}
