"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Input from "@/components/atoms/Input";
import AnimatedBackground from "@/components/organisms/RegisterBackground";
import StatusModal from "@/components/molecules/StatusModal";

import { studentLogin } from "@/services/auth/loginApi";
import { publicInstituteApi } from "@/services/institute/publicInstituteApi";
import { ArrowLeft } from "lucide-react";
import { studentLoginSchema } from "@/app/schemas/student.schema";
import { useAuth } from "@/context/AuthContext";
import { secureCookieOptions } from "@/utils/cookie";

export default function StudentLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [institutes, setInstitutes] = useState([]);
  const [institutesLoading, setInstitutesLoading] = useState(true);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(studentLoginSchema),
    defaultValues: {
      instituteId: "",
      licenseCode: "",
      enrollmentNo: "",
      password: "",
    },
  });

  const instituteId = watch("instituteId");
  const fieldsDisabled = !instituteId;

  // One option per license code across every institute (same shape the
  // dropdown below builds) — when there's exactly one in the whole system,
  // there's nothing to choose, so skip the dropdown and select it directly.
  const licenseOptions = institutes.flatMap((inst) =>
    (inst.license_codes || []).map((code) => ({
      instituteId: inst._id,
      code,
    })),
  );
  const onlyLicenseOption =
    licenseOptions.length === 1 ? licenseOptions[0] : null;

  useEffect(() => {
    if (!onlyLicenseOption) return;
    setValue("instituteId", onlyLicenseOption.instituteId, {
      shouldValidate: true,
    });
    setValue("licenseCode", onlyLicenseOption.code, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyLicenseOption?.instituteId, onlyLicenseOption?.code]);

  useEffect(() => {
    const token = Cookies.get("token");
    const role = Cookies.get("role");

    if (!token) return;

    if (role === "student") {
      router.replace("/dashboard");
    }
  }, [router]);

  // Populates the institute dropdown — only institutes with an active
  // license are returned, so every option here is one a student could
  // actually log into.
  useEffect(() => {
    publicInstituteApi
      .getPublicList()
      .then((res) => {
        const list = res?.data?.data ?? [];
        setInstitutes(Array.isArray(list) ? list : []);
      })
      .catch(() => setInstitutes([]))
      .finally(() => setInstitutesLoading(false));
  }, []);

  const onSubmit = async ({
    instituteId,
    licenseCode,
    enrollmentNo,
    password,
  }) => {
    try {
      const response = await studentLogin({
        institute_id: instituteId,
        license_code: licenseCode,
        enrollment_no: enrollmentNo,
        password,
      });

      const apiResponse = response.data;

      const token = apiResponse?.data?.token;

      if (!token) {
        throw new Error("Token not found in response");
      }

      Cookies.set("role", "student", secureCookieOptions());

      Cookies.set("token", token, secureCookieOptions());

      // Store in AuthContext instead of cookie
      login(apiResponse.data.student);

      router.push("/dashboard");
    } catch (error) {
      const backendMessage = error?.response?.data?.message;

      // Only log unexpected failures (network errors, 5xx, no message from
      // backend) — a 4xx like wrong password or no free seats is normal
      // business logic, not a bug, so it shouldn't spam the console/dev overlay.
      if (!backendMessage) {
        console.error(error);
      }

      const seatsFull = backendMessage
        ?.toLowerCase()
        .includes("no free seats available");

      setModal({
        open: true,
        type: "error",
        title: seatsFull ? "No Free Seats Available" : "Login Failed",
        message:
          backendMessage || "Invalid institute, enrollment number, or password",
      });
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

        <h1 className="text-3xl font-black text-slate-900">Student Login</h1>

        <p className="mt-2 text-slate-500">
          Select your license code, then sign in with your enrollment number and
          password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              License Code
            </label>
            {onlyLicenseOption ? (
              // Only one license code exists at all — nothing to pick, so show
              // it as a plain read-only value instead of a single-item dropdown.
              <div
                className="
                  w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3
                  text-slate-900 font-medium
                "
              >
                {onlyLicenseOption.code}
              </div>
            ) : (
              <select
                value={
                  watch("instituteId") && watch("licenseCode")
                    ? `${watch("instituteId")}::${watch("licenseCode")}`
                    : ""
                }
                onChange={(e) => {
                  const [selectedInstituteId, selectedLicenseCode] =
                    e.target.value.split("::");
                  setValue("instituteId", selectedInstituteId || "", {
                    shouldValidate: true,
                  });
                  setValue("licenseCode", selectedLicenseCode || "", {
                    shouldValidate: true,
                  });
                }}
                disabled={institutesLoading}
                className={`
                  w-full rounded-xl border bg-white px-4 py-3 text-slate-900
                  outline-none transition-all focus:ring-4 disabled:opacity-60
                  ${
                    errors.instituteId || errors.licenseCode
                      ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"
                  }
                `}
              >
                <option value="" disabled>
                  {institutesLoading
                    ? "Loading institutes..."
                    : "Select your license code"}
                </option>
                {licenseOptions.map(({ instituteId: instId, code }) => (
                  // One option per license code, each carrying its own institute
                  // id + code. Seats are checked against this exact license only
                  // — a full license does not silently fall back to another one.
                  <option
                    key={`${instId}-${code}`}
                    value={`${instId}::${code}`}
                  >
                    {code}
                  </option>
                ))}
              </select>
            )}
            {(errors.instituteId || errors.licenseCode) && (
              <div className="mt-1 text-sm text-red-500 font-medium">
                {errors.instituteId?.message || errors.licenseCode?.message}
              </div>
            )}
          </div>

          <Input
            label="Enrollment Number"
            placeholder="EN2024001"
            disabled={fieldsDisabled}
            error={errors.enrollmentNo?.message}
            {...register("enrollmentNo")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            disabled={fieldsDisabled}
            error={errors.password?.message}
            {...register("password")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
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
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </motion.div>

      <StatusModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={handleModalClose}
        showIcon={false}
      />
    </main>
  );
}
