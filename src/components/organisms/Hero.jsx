"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useFeaturedInstitute } from "@/hooks/useFeaturedInstitute";

const DEFAULT_INSTITUTE_LOGO = "/collage-logo.png";

const HERO_CAROUSEL_IMAGES = [
  "/mit/State-Level-Compition-Technofair-1.jpeg",
  "/mit/Traning-And-Placement.jpeg",
  "/mit/computer-1.jpg",
  "/mit/images%20(1).jpeg",
  "/mit/images%20(2).jpeg",
  "/mit/images.jpeg",
];

export default function Hero() {
  const institute = useFeaturedInstitute();
  const [slide, setSlide] = useState(0);

  // The institute's logo is AWS/CDN-hosted, a host next/image's optimizer
  // doesn't allow-list in production (see next.config.mjs) — without a
  // fallback that 400s into a broken-image icon instead of the placeholder.
  const [logoSrc, setLogoSrc] = useState(
    institute?.logo || DEFAULT_INSTITUTE_LOGO,
  );

  useEffect(() => {
    setLogoSrc(institute?.logo || DEFAULT_INSTITUTE_LOGO);
  }, [institute?.logo]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Background refraction mask */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/40 via-orange-50/20 to-slate-50 pointer-events-none" />
      <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-orange-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-24 h-112 w-md rounded-full bg-amber-300/25 blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[26px_26px] pointer-events-none" />

      {/* TOP: Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 sm:px-10 lg:px-16 pt-12 pb-10 grid lg:grid-cols-2 gap-10 items-center">
        {/* LEFT: Text panel */}
        <div className="flex flex-col">
          {/* Top pill badge */}
          <div className="relative inline-flex w-fit items-center gap-2 bg-white/90 backdrop-blur border border-amber-200 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm shadow-amber-100 ring-1 ring-amber-100/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            An AI Powered Language Lab
          </div>

          {/* Institute identity strip */}
          <div className="mt-3 flex flex-col items-start justify-center max-w-md">
            <div className="relative h-44 w-44 shrink-0 drop-shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-transform duration-500 hover:scale-[1.03]">
              <Image
                src={logoSrc}
                alt={institute?.institute_name || "Institute"}
                fill
                sizes="176px"
                unoptimized
                className="object-contain"
                onError={() => setLogoSrc(DEFAULT_INSTITUTE_LOGO)}
              />
            </div>
          </div>

          <h1 className="mt-1 max-w-lg text-3xl md:text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tighter text-slate-900 drop-shadow-sm">
            {institute?.institute_name || (
              <>
                Your Personal <span className="text-red-500">AI</span>{" "}
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 bg-clip-text text-transparent">
                  English Coach
                </span>
              </>
            )}
          </h1>

          <p className="mt-3 text-base text-slate-600 max-w-md leading-relaxed">
            Matoshri Institute of Technology, located in Dhanore, Yeola (Nashik
            district, Maharashtra), is a rural technical school founded in 2009.
            It is approved by the AICTE and offers diploma and non-AICTE design
            programs.
          </p>
        </div>

        {/* RIGHT: Showcase image carousel */}
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-tr from-amber-400/25 to-orange-400/25 blur-3xl rounded-full -z-10" />
          <div className="relative h-80 md:h-112 overflow-hidden rounded-3xl border-2 border-white shadow-[0_25px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition-transform duration-500 hover:scale-[1.015]">
            {HERO_CAROUSEL_IMAGES.map((src, idx) => (
              <Image
                key={src}
                src={src}
                alt={institute?.institute_name || "Institute campus"}
                fill
                priority={idx === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`object-cover transition-opacity duration-1000 ${
                  idx === slide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-white/90 backdrop-blur border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              <Sparkles size={12} />
              Featured Institute
            </div>
            {/* Carousel dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {HERO_CAROUSEL_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlide(idx)}
                  aria-label={`Show slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === slide ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Floating Background Sparkle Bits */}
      </div>
    </section>
  );
}
