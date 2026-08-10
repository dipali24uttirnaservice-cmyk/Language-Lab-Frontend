"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ShieldCheck } from "lucide-react";

import Input from "@/components/atoms/Input";
import AnimatedBackground from "@/components/organisms/AnimatedBackground";
import StatusModal from "@/components/molecules/StatusModal";

import { sendInstituteOtp, verifyInstituteOtp } from "@/services/auth/loginApi";

// Standalone utility page — not linked from the sidebar/navbar.
// Flow: institute code -> email OTP -> /config/login (separate route) -> redirect to /institute-dashboard.
export default function ConfigPage() {
  const router = useRouter();
  const [step, setStep] = useState("code"); // "code" | "otp"

  const [instituteCode, setInstituteCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [modal, setModal] = useState({ open: false, type: "", title: "", message: "" });

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!instituteCode.trim()) {
      setCodeError("Institute code is required");
      return;
    }

    try {
      setCodeLoading(true);
      setCodeError("");
      await sendInstituteOtp(instituteCode.trim());
      setOtp("");
      setOtpError("");
      setStep("otp");
    } catch (error) {
      setCodeError(
        error?.response?.data?.message || "Invalid institute code",
      );
    } finally {
      setCodeLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError("Enter the 6-digit code");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");
      await verifyInstituteOtp(instituteCode.trim(), otp.trim());
      router.push(`/config/login?code=${encodeURIComponent(instituteCode.trim())}`);
    } catch (error) {
      setOtpError(error?.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      await sendInstituteOtp(instituteCode.trim());
      setOtp("");
      setOtpError("");
      setModal({
        open: true,
        type: "success",
        title: "OTP Resent",
        message: "A new code was sent to your registered email.",
      });
    } catch (error) {
      setModal({
        open: true,
        type: "error",
        title: "Failed to Resend",
        message: error?.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setResending(false);
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
        <AnimatePresence mode="wait">
          {step === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 mb-6">
                <KeyRound size={16} /> Institute Access
              </div>

              <h2 className="text-3xl font-black text-slate-900">Institute Code</h2>
              <p className="mt-2 text-slate-500">Enter your institute code to continue.</p>

              <form onSubmit={handleCodeSubmit} className="mt-8 space-y-5">
                <Input
                  label="Institute Code"
                  type="text"
                  placeholder="e.g. ABC123"
                  value={instituteCode}
                  onChange={(e) => {
                    setInstituteCode(e.target.value);
                    if (codeError) setCodeError("");
                  }}
                  error={codeError}
                />

                <button
                  type="submit"
                  disabled={codeLoading}
                  className="w-full rounded-2xl bg-orange-500 py-4 text-white font-bold transition-all hover:bg-orange-600 hover:scale-[1.02] shadow-lg disabled:opacity-50"
                >
                  {codeLoading ? "Sending OTP..." : "Next"}
                </button>
              </form>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600 mb-6">
                <ShieldCheck size={16} /> {instituteCode}
              </div>

              <h2 className="text-3xl font-black text-slate-900">Verify OTP</h2>
              <p className="mt-2 text-slate-500">
                A 6-digit code has been sent to your registered email.
              </p>

              <form onSubmit={handleOtpSubmit} className="mt-8 space-y-5">
                <Input
                  label="OTP Code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    if (otpError) setOtpError("");
                  }}
                  error={otpError}
                />

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full rounded-2xl bg-orange-500 py-4 text-white font-bold transition-all hover:bg-orange-600 hover:scale-[1.02] shadow-lg disabled:opacity-50"
                >
                  {otpLoading ? "Verifying..." : "Verify"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="w-full text-center text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50"
                >
                  {resending ? "Resending..." : "Resend OTP"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
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
