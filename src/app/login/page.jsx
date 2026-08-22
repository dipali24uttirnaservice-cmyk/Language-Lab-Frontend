"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "@/components/atoms/Input";
import AnimatedBackground from "@/components/organisms/AnimatedBackground";
import StatusModal from "@/components/molecules/StatusModal";
import { useAuth } from "@/context/AuthContext";

import { instituteLogin } from "@/services/auth/loginApi";
import { instituteLoginSchema } from "@/app/schemas/institute.schema";
import { secureCookieOptions } from "@/utils/cookie";
import { profileApi } from "@/services/institute/profileApi";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(instituteLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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

  const onSubmit = async (formData) => {
    try {
      const response = await instituteLogin(formData);

      const apiResponse = response.data;

      const token = apiResponse?.data?.token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      Cookies.set("role", "institute", secureCookieOptions());

      Cookies.set("token", token, secureCookieOptions());

      const institute = apiResponse?.data?.institute;

      Cookies.set("userData", JSON.stringify({ institute }), secureCookieOptions());

      login(institute);

      // The login response's `institute` object is missing fields like
      // logo/local_logo_url (only /institute/me returns the full record),
      // so the sidebar/navbar logo stayed blank until a refresh re-fetched
      // it. Fetch the full profile right away so it shows immediately.
      profileApi
        .getProfile()
        .then((res) => {
          if (res.data.success) login(res.data.data);
        })
        .catch((error) => {
          console.error("Failed to refresh institute profile:", error);
        });

      router.replace("/institute-dashboard");
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

    <div className="flex items-center gap-3 mb-6">
  <button
    type="button"
    onClick={() => router.push("/")}
    className="
      h-10 w-10
      flex items-center justify-center
      rounded-xl
      border border-orange-200
      bg-white
      text-orange-500
      shadow-sm
      hover:bg-orange-50
      hover:border-orange-300
      hover:shadow-md
      transition-all duration-300
    "
  >
    <ArrowLeft size={18} />
  </button>

  <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
     🏫 Institute Management Hub
  </div>
</div>

        <h2 className="text-3xl font-black text-slate-900">
         Institute Login
        </h2>

        <p className="mt-2 text-slate-500">
          Continue your English
          learning journey.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
        >
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
            {isSubmitting
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>


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
