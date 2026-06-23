"use client";

import { useState, useEffect } from "react";import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Input from "@/components/atoms/Input";
import AnimatedBackground from "@/components/organisms/AnimatedBackground";
import StatusModal from "@/components/molecules/StatusModal";

import { instituteLogin } from "@/services/auth/loginApi";

export default function LoginPage() {
const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (
    field,
    value
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const [modal, setModal] = useState({
  open: false,
  type: "",
  title: "",
  message: "",
});

useEffect(() => {
  const token = Cookies.get("token");
  const role = Cookies.get("role");

  if (!token) return;

  if (role === "institute") {
    router.replace("/institute-dashboard");
  }
}, [router]);

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const response = await instituteLogin(formData);

    const apiResponse = response.data;

    const token = apiResponse?.data?.token;

    if (!token) {
      throw new Error("Token not found in response");
    }

    Cookies.set("role", "institute", {
      expires: 7,
    });

    Cookies.set("token", token, {
      expires: 7,
    });

    Cookies.set(
      "userData",
      JSON.stringify(apiResponse.data),
      {
        expires: 7,
      }
    );

    const institute = apiResponse?.data?.institute;

    setModal({
      open: true,
      type: "success",
      title: "Institute Login Successfully",
      message: `Welcome ${
        institute?.institute_name || ""
      }`,
    });
  } catch (error) {
    console.error("Login Error:", error);

    setModal({
      open: true,
      type: "error",
      title: "Login Failed",
      message:
        error?.response?.data?.message ||
        "Invalid Email or Password",
    });
  } finally {
    setLoading(false);
  }
};

const handleModalClose = () => {
  setModal((prev) => ({
    ...prev,
    open: false,
  }));

  if (modal.type === "success") {
    router.push("/institute-dashboard");
  }
};

 

  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      <AnimatedBackground />

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
        }}
        className="relative z-10 w-full max-w-md rounded-[32px] border border-white/60 bg-white/40 backdrop-blur-2xl p-10 shadow-[0_20px_80px_rgba(249,115,22,0.15)]"
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
          🎓 Learn English with AI
        </div>

        <h2 className="text-3xl font-black text-slate-900">
          Welcome Back
        </h2>

        <p className="mt-2 text-slate-500">
          Continue your English
          learning journey.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) =>
              handleChange(
                "email",
                e.target.value
              )
            }
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) =>
              handleChange(
                "password",
                e.target.value
              )
            }
          />

          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 py-4 text-white font-bold transition-all hover:bg-orange-600 hover:scale-[1.02] shadow-lg disabled:opacity-50"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-bold text-orange-500 hover:text-orange-600 hover:underline"
          >
            Create Account
          </a>
        </div>
      </motion.div>

      <StatusModal
  open={modal.open}
  type={modal.type}
  title={modal.title}
  message={modal.message}
  onClose={handleModalClose}
/>
    </main>

    
  );
}