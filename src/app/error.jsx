"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RootError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
      <div className="h-16 w-16 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600 mb-4 shadow-inner">
        <AlertTriangle size={32} />
      </div>

      <h2 className="text-2xl font-black text-slate-900">Something went wrong!</h2>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
        We encountered an unexpected error. You can try again or head back to the homepage.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <RotateCcw size={16} />
          Try Again
        </button>

        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <Home size={16} />
          Home
        </button>
      </div>
    </div>
  );
}
