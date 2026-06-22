"use client";

import { motion } from "framer-motion";
import Input from "@/components/atoms/Input";
import AnimatedBackground from "@/components/organisms/RegisterBackground";

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          relative z-10
          w-full max-w-md
          rounded-[32px]
          border border-white/60
          bg-white/40
          backdrop-blur-2xl
          p-10
          shadow-[0_20px_80px_rgba(249,115,22,0.15)]
        "
      >
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
          🚀 Join LanguageLab Today
        </div>

        <h1 className="text-3xl font-black text-slate-900">
          Create Account
        </h1>

        <p className="mt-2 text-slate-500">
          Start your English learning journey with AI.
        </p>

        <form className="mt-8 space-y-5">
          <Input
            label="Full Name"
            placeholder="Enter your name"
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create password"
          />

          <button
            className="
              w-full
              rounded-2xl
              bg-orange-500
              py-4
              font-bold
              text-white
              transition-all
              hover:bg-orange-600
              hover:scale-[1.02]
            "
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-bold text-orange-500 hover:underline"
          >
            Sign In
          </a>
        </div>
      </motion.div>
    </main>
  );
}