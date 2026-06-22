"use client";

import {
  FaRobot,
  FaMicrophone,
  FaSpellCheck,
  FaBook,
  FaPen,
  FaBrain,
} from "react-icons/fa";
import FeatureCard from "@/components/molecules/FeatureCard";

const features = [
  {
    icon: <FaRobot />,
    title: "AI Tutor",
    description: "24/7 intelligent language assistant customized to your learning pace.",
  },
  {
    icon: <FaMicrophone />,
    title: "Speaking Practice",
    description: "Improve your pronunciation instantly with localized real-time speech assessment.",
  },
  {
    icon: <FaSpellCheck />,
    title: "Grammar Checker",
    description: "Get context-aware grammar correction and alternative phrasing suggestions.",
  },
  {
    icon: <FaBook />,
    title: "Vocabulary Builder",
    description: "Learn high-frequency contextual words generated dynamically by AI.",
  },
  {
    icon: <FaPen />,
    title: "Essay Evaluator",
    description: "Submit long-form compositions and receive comprehensive structural analytics.",
  },
  {
    icon: <FaBrain />,
    title: "Smart Quizzes",
    description: "Adaptive testing structures configured dynamically from your past problem areas.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-slate-50">
      
      {/* GLASS REFRACTION ENGINE: Multi-layered background graphics to blur through */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Warm Ambient Glow Core */}
        <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-amber-200/30 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-200/20 blur-[120px]" />
        
        {/* Sharp Vector Shapes for Dynamic Glass Distortion */}
        <div className="absolute top-1/3 right-[15%] w-96 h-96 rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] bg-gradient-to-tr from-amber-400/20 to-orange-400/20 animate-[spin_25s_linear_infinite]" />
        <div className="absolute bottom-1/4 left-[10%] w-[450px] h-[450px] rounded-[60%_40%_30%_70%_/_50%_30%_70%_50%] bg-gradient-to-br from-emerald-300/15 to-teal-400/10 animate-[spin_35s_linear_infinite_reverse]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Powerful{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
              AI Learning Tools
            </span>
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-500">
            Everything you need to bypass traditional language barriers and build fluency fast.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, index) => (
            <FeatureCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}