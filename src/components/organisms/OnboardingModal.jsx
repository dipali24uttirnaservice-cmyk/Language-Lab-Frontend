"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";


export default function OnboardingModal({ onContinue }) {

      const router = useRouter();

  const handleContinue = () => {
    router.push("/dashboard");
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          w-full max-w-3xl
          rounded-3xl
          bg-white
          p-8
          shadow-2xl
        "
      >
        <h2 className="text-3xl font-black text-slate-900">
          Personalize Your English Journey
        </h2>

        <p className="mt-2 text-slate-500">
          We'll create a learning path just for you.
        </p>

        <div className="mt-8">
          <h3 className="font-bold text-slate-800 mb-3">
            What is your English level?
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <button className="rounded-xl border p-4 hover:border-orange-500">
              🌱 Beginner
            </button>

            <button className="rounded-xl border p-4 hover:border-orange-500">
              📘 Intermediate
            </button>

            <button className="rounded-xl border p-4 hover:border-orange-500">
              🚀 Advanced
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-3">
            How do you prefer learning?
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl border p-4">
              🎥 Video Lessons
            </button>

            <button className="rounded-xl border p-4">
              🎧 Audio Lessons
            </button>

            <button className="rounded-xl border p-4">
              📖 Reading Lessons
            </button>

            <button className="rounded-xl border p-4">
              🤖 AI Conversations
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-3">
            What is your goal?
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-xl border p-4">
              🎯 Speak Fluently
            </button>

            <button className="rounded-xl border p-4">
              💼 Interview English
            </button>

            <button className="rounded-xl border p-4">
              🎓 institute & Exams
            </button>

            <button className="rounded-xl border p-4">
              ✈️ Travel English
            </button>
          </div>
        </div>

        <button
   onClick={handleContinue}     
        className="
            mt-8
            w-full
            rounded-2xl
            bg-orange-500
            py-4
            text-white
            font-bold
            hover:bg-orange-600
          "
          
        >
          Create My Learning Plan
        </button>
      </motion.div>
    </div>
  );
}