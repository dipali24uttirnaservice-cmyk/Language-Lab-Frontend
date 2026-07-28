"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Input from "@/components/atoms/Input";
import AnimatedBackground from "@/components/organisms/RegisterBackground";
import StatusModal from "@/components/molecules/StatusModal";

import { studentLogin } from "@/services/auth/loginApi";
import { ArrowLeft } from "lucide-react";
import { studentLoginSchema } from "@/app/schemas/student.schema";
import { useAuth } from "@/context/AuthContext";

export default function StudentLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [licenseType, setLicenseType] = useState("standard");

  // Static license types dropdown options (ready to be replaced with backend API fetch later)
  const licenseOptions = [
    { label: "Standard License", value: "standard" },
    { label: "Premium Enterprise", value: "enterprise" },
    { label: "Trial / Academic", value: "academic" },
  ];

  const handleEnrollmentNoChange = async (value) => {
    setEnrollmentNo(value);

    if (errors.enrollmentNo) {
      try {
        await studentLoginSchema.validateAt("enrollmentNo", { enrollmentNo: value });
        setErrors((prev) => ({ ...prev, enrollmentNo: "" }));
      } catch (err) {
        setErrors((prev) => ({ ...prev, enrollmentNo: err.message }));
      }
    }
  };

  const handlePasswordChange = async (value) => {
    setPassword(value);

    if (errors.password) {
      try {
        await studentLoginSchema.validateAt("password", {
          password: value,
        });

        setErrors((prev) => ({
          ...prev,
          password: "",
        }));
      } catch (err) {
        setErrors((prev) => ({
          ...prev,
          password: err.message,
        }));
      }
    }
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

    if (role === "student") {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await studentLoginSchema.validate(
        {
          enrollmentNo,
          password,
        },
        {
          abortEarly: false,
        }
      );
      setErrors({});
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      }
      return;
    }

    try {
      setLoading(true);

      const response = await studentLogin({
        enrollment_no: enrollmentNo,
        password,
        license_type: licenseType, // Included in payload for backend alignment
      });

      const apiResponse = response.data;

      const token = apiResponse?.data?.token;

      if (!token) {
        throw new Error("Token not found in response");
      }
      Cookies.set("role", "student", {
        expires: 7,
      });

      Cookies.set("token", token, {
        expires: 7,
      });

      // Store in AuthContext instead of cookie
      login(apiResponse.data.student);

      router.push("/dashboard");

    } catch (error) {
      console.error(error);

      setModal({
        open: true,
        type: "error",
        title: "Login Failed",
        message:
          error?.response?.data?.message ||
          "Invalid Enrollment Number",
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
      router.push("/dashboard");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
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
            🤖 AI Learning Hub
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900">
          Student Login
        </h1>

        <p className="mt-2 text-slate-500">
          Enter your enrollment number to continue.
        </p>

        <form
          onSubmit={handleLogin}
          className="mt-8 space-y-5"
        >
          {/* License Type Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              License Type
            </label>
            <select
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
              className="w-full px-4 py-4 bg-white/80 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
            >
              {licenseOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Enrollment Number"
            placeholder="EN2024001"
            value={enrollmentNo}
            onChange={(e) =>
              handleEnrollmentNoChange(
                e.target.value
              )
            }
            error={errors.enrollmentNo}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={loading}
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
              disabled:opacity-50
            "
          >
            {loading
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