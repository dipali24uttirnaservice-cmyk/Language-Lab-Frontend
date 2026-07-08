"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Globe,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Headphones,
  Video,
  FileText,
  BookOpen,
  PenTool,

} from "lucide-react";
import { useFeaturedInstitute } from "@/hooks/useFeaturedInstitute";
import { useRouter } from "next/navigation";

const INSTITUTE_PLACEHOLDER = "/institute-placeholder.svg";

const HERO_CAROUSEL_IMAGES = ["/image.jpg", "/image1.jpg", "/image2.png"];

const FEATURE_CHIPS = [
  { name: "Audio", icon: Headphones, color: "bg-violet-100 border-violet-300 text-violet-700" },
  { name: "Video", icon: Video, color: "bg-blue-100 border-blue-300 text-blue-700" },
  { name: "Text", icon: FileText, color: "bg-emerald-100 border-emerald-300 text-emerald-700" },
  { name: "Vocabulary", icon: BookOpen, color: "bg-pink-100 border-pink-300 text-pink-700" },
  { name: "Exercise", icon: PenTool, color: "bg-amber-100 border-amber-300 text-amber-700" },
];

export default function Hero() {
  const router = useRouter();
  const institute = useFeaturedInstitute();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Background refraction mask */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/40 via-orange-50/20 to-slate-50 pointer-events-none" />

      {/* TOP: Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 sm:px-10 lg:px-16 pt-24 pb-10 grid lg:grid-cols-2 gap-10 items-center">
        {/* LEFT: Text panel */}
        <div className="flex flex-col">
          {/* Top pill badge */}
          <div className="relative inline-flex w-fit items-center gap-2 bg-white border border-amber-200 text-amber-800 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm shadow-amber-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            New AI Testimonial Feature is live
          </div>

          <h1 className="mt-4 max-w-lg text-3xl md:text-4xl xl:text-5xl font-extrabold leading-[1.1] tracking-tighter text-slate-900">
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
            Learn to speak with confidence through immersive, AI-guided lessons
            built around real conversations. Practice at your own pace with
            audio, video, and interactive exercises designed to turn every
            session into visible progress.
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push("/student-login")}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            >
              Explore More
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Feature chips */}
          <ul className="mt-6 flex flex-wrap gap-3 max-w-md">
            {FEATURE_CHIPS.map(({ name, icon: Icon, color }) => (
              <li
                key={name}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 shadow-[3px_3px_0_rgba(15,23,42,0.12)] hover:-translate-y-0.5 hover:shadow-[4px_5px_0_rgba(15,23,42,0.18)] transition-all duration-200 ${color}`}
              >
                <Icon size={16} />
                <span className="text-sm font-bold">{name}</span>
              </li>
            ))}
          </ul>

          {/* Institute identity strip */}
          <div className="mt-6 flex items-center gap-4 max-w-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-[0_10px_25px_rgba(245,158,11,0.4)]">
              <img
                src={INSTITUTE_PLACEHOLDER}
                alt={institute?.institute_name || "Institute"}
                className="h-6 w-6 object-contain"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-slate-900 truncate">
                  {institute?.institute_name || "Your Institute"}
                </h3>
                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                {(institute?.address?.dist || institute?.address?.state) && (
                  <p className="flex items-center gap-1 text-xs text-slate-600">
                    <MapPin size={11} className="text-amber-600" />
                    {[institute.address.dist, institute.address.state].filter(Boolean).join(", ")}
                  </p>
                )}
                {institute?.website && (
                  <a
                    href={institute.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    <Globe size={11} />
                    {institute.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Showcase image carousel */}
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-tr from-amber-400/25 to-orange-400/25 blur-3xl rounded-full -z-10" />
          <div className="relative h-80 md:h-112 overflow-hidden rounded-3xl border-2 border-white shadow-[0_25px_60px_rgba(0,0,0,0.18)] transition-transform duration-500 hover:scale-[1.015]">
            {HERO_CAROUSEL_IMAGES.map((src, idx) => (
              <img
                key={src}
                src={src}
                alt={institute?.institute_name || "Institute campus"}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === slide ? "opacity-100" : "opacity-0"
                  }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 bg-white/90 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm">
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
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === slide ? "w-5 bg-white" : "w-1.5 bg-white/60"
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
