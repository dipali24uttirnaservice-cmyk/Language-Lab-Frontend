"use client";

import { motion } from "framer-motion";
import PricingCard from "@/components/molecules/PricingCard";

const plans = [
  {
    title: "Free",
    price: "$0",
    description: "Perfect for testing the water and exploring our core AI models.",
    features: [
      "Basic Structured Lessons",
      "5 AI Conversations Daily",
      "Community Discord Access",
      "Standard Performance Track"
    ],
  },
  {
    title: "Pro",
    price: "$19",
    popular: true,
    description: "Our complete immersion suite for accelerating daily path to fluency.",
    features: [
      "Unlimited AI Tutor Interactions",
      "Real-Time Speaking Practice",
      "Advanced Grammar Analyzer",
      "Official Verified Certificates",
    ],
  },
  {
    title: "Enterprise",
    price: "$49",
    description: "Engineered specifically for schools, teams, and academic workforces.",
    features: [
      "Collaborative Team Spaces",
      "Admin Analytics Dashboard",
      "Priority API Resource Slots",
      "Custom LMS Integrations",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-100 via-orange-50/40 to-emerald-50/20">
      
      {/* =========================================================================
          ADVANCED 3D GLASS ENVIRONMENT & BACKGROUND REFRACTION ENGINE
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        
        {/* Ambient Sky Horizon Glow Maps */}
        <div className="absolute top-0 right-0 w-full h-[700px] bg-gradient-to-bl from-amber-200/40 via-orange-100/20 to-transparent blur-[140px]" />
        
        {/* Central Giant Glass Lens / Ring */}
        <motion.div 
          animate={{ scale: [1, 1.015, 1], rotate: [0, 0.5, 0] }}
          transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] flex items-center justify-center"
        >
          <div className="w-full h-full rounded-full border-[16px] border-white/35 shadow-[inset_0_0_100px_rgba(255,255,255,0.5),0_30px_120px_rgba(217,119,6,0.12)] backdrop-blur-[4px] relative">
            <div className="absolute inset-1 rounded-full border-[2.5px] border-amber-300/20" />
          </div>
        </motion.div>

        {/* 3D Glass Pipeline Beam (Horizontal connector crossing behind the cards) */}
        <div className="hidden lg:block absolute top-[55%] left-0 w-full h-12 bg-gradient-to-r from-white/10 via-white/40 to-white/10 border-y border-white/50 shadow-sm backdrop-blur-[6px]" />

        {/* Left Side: Structural Vertical Glass Column Stack */}
        <div className="absolute left-[-4%] top-[15%] w-[25%] h-[75%] flex gap-3 items-end opacity-85">
          <div className="w-28 h-[95%] bg-gradient-to-b from-white/20 via-slate-200/30 to-transparent border-r border-white/40 backdrop-blur-[10px] skew-y-3" />
          <div className="w-20 h-[70%] bg-white/20 border-l border-white/60 backdrop-blur-[6px] shadow-lg -translate-x-6" />
        </div>

        {/* Right Side: Architectural Glass Pillars & Warm Sun Shards */}
        <div className="absolute right-[-3%] top-[8%] w-[25%] h-[85%] flex flex-col gap-8 items-start opacity-90">
          <div className="w-full h-[50%] bg-gradient-to-tr from-emerald-100/10 via-white/30 to-white/10 border-l-2 border-white/60 backdrop-blur-[12px] shadow-md" />
          <div className="w-[85%] h-[40%] bg-gradient-to-br from-amber-400/10 via-orange-300/10 to-white/30 border border-white/40 backdrop-blur-[8px] -translate-y-10" />
        </div>

      </div>

      {/* =========================================================================
          FOREGROUND CONTENT GRID LAYER
          ========================================================================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Section Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-24">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
            Simple, Honest{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="mt-4 text-base font-semibold text-slate-500/90">
            Choose the ideal acceleration tier tailored directly to your personal fluency ambitions.
          </p>
        </div>

        {/* 3-Column Pricing Layout Array with 3D Spatial Offset */}
    
<div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto items-stretch">
  {plans.map((plan) => (
    // Removed the inline style offset here
    <div key={plan.title} className="relative h-full">
      <PricingCard
        title={plan.title}
        price={plan.price}
        description={plan.description}
        features={plan.features}
        // We no longer pass "popular" or set it to false for all
        popular={false} 
      />
    </div>
  ))}
</div>
      </div>
    </section>
  );
}