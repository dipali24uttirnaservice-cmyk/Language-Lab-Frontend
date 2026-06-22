"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import TestimonialCard from "@/components/molecules/TestimonialCard";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "English Learner",
    review:
      "The AI tutor helped me improve my English speaking confidence in just a few weeks. It's incredibly natural to converse with.",
  },
  {
    name: "David Lee",
    role: "Student",
    review:
      "The pronunciation feedback is amazing. It feels like having a personal native speaker teacher sitting right next to you 24/7.",
  },
  {
    name: "Maria Garcia",
    role: "Professional",
    review:
      "I used LanguageLab daily and recently landed an international job opportunity!",
  },
   {
    name: "Sarah Johnson",
    role: "English Learner",
    review:
      "The AI tutor helped me improve my English speaking confidence in just a few weeks. It's incredibly natural to converse with.",
  },
  {
    name: "David Lee",
    role: "Student",
    review:
      "The pronunciation feedback is amazing. It feels like having a personal native speaker teacher sitting right next to you 24/7.",
  },
  {
    name: "Maria Garcia",
    role: "Professional",
    review:
      "I used LanguageLab daily and recently landed an international job opportunity!",
  },
   {
    name: "Sarah Johnson",
    role: "English Learner",
    review:
      "The AI tutor helped me improve my English speaking confidence in just a few weeks. It's incredibly natural to converse with.",
  },
  {
    name: "David Lee",
    role: "Student",
    review:
      "The pronunciation feedback is amazing. It feels like having a personal native speaker teacher sitting right next to you 24/7.",
  },
  {
    name: "Maria Garcia",
    role: "Professional",
    review:
      "I used LanguageLab daily and recently landed an international job opportunity!",
  },
   {
    name: "Sarah Johnson",
    role: "English Learner",
    review:
      "The AI tutor helped me improve my English speaking confidence in just a few weeks. It's incredibly natural to converse with.",
  },
  {
    name: "David Lee",
    role: "Student",
    review:
      "The pronunciation feedback is amazing. It feels like having a personal native speaker teacher sitting right next to you 24/7.",
  },
  {
    name: "Maria Garcia",
    role: "Professional",
    review:
      "I used LanguageLab daily and recently landed an international job opportunity!",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-slate-50">

      {/* ================= 3D BACKGROUND ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">

        {/* Floating Orb 1 */}
        <motion.div
          animate={{ y: [0, -40, 0], x: [0, 25, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-44 h-44 rounded-full bg-gradient-to-br from-amber-300/20 to-orange-400/10 blur-3xl"
        />

        {/* Floating Orb 2 */}
        <motion.div
          animate={{ y: [0, 50, 0], x: [0, -30, 0], rotate: [360, 180, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-400/10 blur-3xl"
        />

        {/* Center Ring */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] border border-amber-200/20 rounded-full"
        />

        {/* Soft Light Glow */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-gradient-to-r from-white/30 via-amber-100/10 to-transparent blur-[120px]"
        />

      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-slate-900">
            What Our Students{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-emerald-600">
              Say
            </span>
          </h2>

          <p className="mt-4 text-slate-500 font-medium">
            Real feedback from learners improving their English with AI.
          </p>
        </div>

        {/* ================= CAROUSEL ================= */}
        <Swiper
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={5000}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((item, index) => (
            <SwiperSlide key={index}>
              <TestimonialCard {...item} index={index} />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}