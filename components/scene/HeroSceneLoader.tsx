"use client";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/scene/HeroScene").then((module) => module.HeroScene), { ssr: false, loading: () => <div className="h-full w-full" aria-hidden="true" /> });
export function HeroSceneLoader() { return <HeroScene />; }
