"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import Input from "@/components/atoms/Input";
import AnimatedBackground from "@/components/organisms/RegisterBackground";
import StatusModal from "@/components/molecules/StatusModal";

import { studentLogin } from "@/services/auth/loginApi";
import { publicInstituteApi } from "@/services/institute/publicInstituteApi";
import { ArrowLeft } from "lucide-react";
import { studentLoginSchema } from "@/app/schemas/student.schema";
import { useAuth } from "@/context/AuthContext";

export default function StudentLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [institutes, setInstitutes] = useState([]);
  const [institutesLoading, setInstitutesLoading] = useState(true);
  const [instituteId, setInstituteId] = useState("");
  const [licenseCode, setLicenseCode] = useState("");
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [password, setPassword] = useState("");

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

  const validateField = async (field, value) => {
    if (!errors[field]) return;
    try {
      await studentLoginSchema.validateAt(field, {
        instituteId,
        licenseCode,
        enrollmentNo,
        password,
        [field]: value,
      });
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [field]: err.message }));
    }
  };

  // Dropdown option values are "<instituteId>::<licenseCode>" — a student
  // picks one specific license, and that license's seats are what get
  // checked at login (no falling back to a different license automatically).
  const handleInstituteChange = (value) => {
    const [selectedInstituteId, selectedLicenseCode] = value.split("::");
    setInstituteId(selectedInstituteId || "");
    setLicenseCode(selectedLicenseCode || "");
    validateField("instituteId", selectedInstituteId || "");
    validateField("licenseCode", selectedLicenseCode || "");
  };

  const handleEnrollmentNoChange = (value) => {
    setEnrollmentNo(value);
    validateField("enrollmentNo", value);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    validateField("password", value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await studentLoginSchema.validate(
        { instituteId, licenseCode, enrollmentNo, password },
        { abortEarly: false },
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
      const backendMessage = error?.response?.data?.message;

      // Only log unexpected failures (network errors, 5xx, no message from
      // backend) — a 4xx like wrong password or no free seats is normal
      // business logic, not a bug, so it shouldn't spam the console/dev overlay.
      if (!backendMessage) {
        console.error(error);
      }

      const seatsFull = backendMessage?.toLowerCase().includes("no free seats available");

      setModal({
        open: true,
        type: "error",
        title: seatsFull ? "No Free Seats Available" : "Login Failed",
        message:
          backendMessage ||
          "Invalid institute, enrollment number, or password",
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

  const fieldsDisabled = !instituteId;

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

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              License Code
            </label>
            <select
              value={instituteId && licenseCode ? `${instituteId}::${licenseCode}` : ""}
              onChange={(e) => handleInstituteChange(e.target.value)}
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
              {institutes.flatMap((inst) => {
                const codes = inst.license_codes || [];

                // One option per license code, each carrying its own institute
                // id + code. Seats are checked against this exact license only
                // — a full license does not silently fall back to another one.
                return codes.map((code) => (
                  <option key={`${inst._id}-${code}`} value={`${inst._id}::${code}`}>
                    {code}
                  </option>
                ));
              })}
            </select>
            {(errors.instituteId || errors.licenseCode) && (
              <div className="mt-1 text-sm text-red-500 font-medium">
                {errors.instituteId || errors.licenseCode}
              </div>
            )}
          </div>

          <Input
            label="Enrollment Number"
            placeholder="EN2024001"
            value={enrollmentNo}
            disabled={fieldsDisabled}
            onChange={(e) => handleEnrollmentNoChange(e.target.value)}
            error={errors.enrollmentNo}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            disabled={fieldsDisabled}
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
            {loading ? "Signing In..." : "Sign In"}
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
