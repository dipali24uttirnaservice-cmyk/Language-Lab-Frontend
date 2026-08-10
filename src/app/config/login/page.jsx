"use client";

import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, Suspense } from "react";

import Input from "@/components/atoms/Input";
import AnimatedBackground from "@/components/organisms/AnimatedBackground";
import StatusModal from "@/components/molecules/StatusModal";

import { instituteConfigLogin } from "@/services/auth/loginApi";
import { instituteLoginSchema } from "@/app/schemas/institute.schema";
import { secureCookieOptions } from "@/utils/cookie";

// Final step of the /config wizard (institute code -> OTP -> here). Reached
// only via router.push from /config after OTP verification, which passes the
// institute code along as a query param just to show it in the badge below —
// instituteConfigLogin itself matches by email, not institute_code.
function ConfigLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const instituteCode = searchParams.get("code") || "";

  const [modal, setModal] = useState({ open: false, type: "", title: "", message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(instituteLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (formData) => {
    try {
      const response = await instituteConfigLogin(formData);
      const apiResponse = response.data;
      const token = apiResponse?.data?.token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      Cookies.set("role", "institute", secureCookieOptions());
      Cookies.set("token", token, secureCookieOptions());

      const institute = apiResponse?.data?.institute;
      Cookies.set("userData", JSON.stringify({ institute }), secureCookieOptions());

      router.replace("/institute-dashboard/settings");
    } catch (error) {
      console.error("Login Error:", error);
      setModal({
        open: true,
        type: "error",
        title: "Login Failed",
        message: error?.response?.data?.message || "Invalid Email or Password",
      });
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-[32px] border border-white/60 bg-white/40 backdrop-blur-2xl p-10 shadow-[0_20px_80px_rgba(249,115,22,0.15)]"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 mb-6">
          <LogIn size={16} /> {instituteCode}
        </div>

        <h2 className="text-3xl font-black text-slate-900">Institute Login</h2>
        <p className="mt-2 text-slate-500">Sign in with your institute email and password.</p>

        <form onSubmit={handleSubmit(handleLogin)} className="mt-8 space-y-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-orange-500 py-4 text-white font-bold transition-all hover:bg-orange-600 hover:scale-[1.02] shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </motion.div>

      <StatusModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, open: false }))}
      />
    </main>
  );
}

// useSearchParams() requires a Suspense boundary in the app router.
export default function ConfigLoginPage() {
  return (
    <Suspense fallback={null}>
      <ConfigLoginForm />
    </Suspense>
  );
}
