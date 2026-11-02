"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Key,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { facultyApi } from "@/services/faculty/facultyApi";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

function RegisterFacultyPageContent() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = Boolean(editId);

  useEffect(() => {
    const role = Cookies.get("role");
    if (role === "faculty") {
      router.replace("/institute-dashboard");
    }
  }, [router]);

  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(isEditing);

  // Form State
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: `Teach@${Math.floor(1000 + Math.random() * 9000)}`,
    status: "active",
  });

  const [showPassword, setShowPassword] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [createdTeacher, setCreatedTeacher] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // If editing, load faculty details
  useEffect(() => {
    if (!editId) return;
    facultyApi
      .getTeachers()
      .then((res) => {
        const list = res?.data?.data || [];
        const found = list.find((t) => t._id === editId);
        if (found) {
          setFormData({
            full_name: found.full_name || "",
            email: found.email || "",
            phone: found.phone || "",
            password: found.password || "",
            status: found.status || "active",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load teacher for editing:", err);
      })
      .finally(() => {
        setFetchingDetails(false);
      });
  }, [editId]);

  // Generate strong random password
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "Fac@";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.full_name.trim()) {
      setErrorMsg("Faculty full name is required.");
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }
    if (!formData.password.trim()) {
      setErrorMsg("Login password is required.");
      return;
    }

    // Disallow using institute administrator email for a faculty account
    let currentInstituteEmail = user?.email;
    if (!currentInstituteEmail) {
      try {
        const raw = Cookies.get("userData");
        if (raw) {
          const parsed = JSON.parse(raw);
          currentInstituteEmail =
            parsed?.institute?.email || parsed?.user?.email;
        }
      } catch {}
    }

    if (
      currentInstituteEmail &&
      formData.email.trim().toLowerCase() === currentInstituteEmail.toLowerCase()
    ) {
      setErrorMsg(
        "Cannot use the institute administrator email for a faculty account."
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password.trim(),
        status: formData.status,
      };

      if (isEditing) {
        const response = await facultyApi.updateTeacher(editId, payload);
        if (response?.data?.success) {
          router.push("/institute-dashboard/teachers");
          return;
        }
      } else {
        const response = await facultyApi.registerTeacher(payload);
        if (response?.data?.success) {
          const created = response.data.data;
          created.password = payload.password; // Keep plain password for 1-click copying
          setCreatedTeacher(created);
          return;
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to save faculty details. Please check the information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Loading faculty details...
        </p>
      </div>
    );
  }

  // Success view after registering
  if (createdTeacher) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const loginUrl = `${origin}/login`;

    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Faculty Registered Successfully!</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Share these access credentials with the teacher to log in.
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Portal Login URL
              </span>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800 mt-1">
                <span className="font-mono text-xs">{loginUrl}</span>
                <button
                  onClick={() => copyToClipboard(loginUrl, "url")}
                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer ml-2"
                >
                  {copiedField === "url" ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Teacher Name
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{createdTeacher.full_name}</p>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Login Email
              </span>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800 mt-1">
                <span>{createdTeacher.email}</span>
                <button
                  onClick={() => copyToClipboard(createdTeacher.email, "email")}
                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer ml-2"
                >
                  {copiedField === "email" ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Password
              </span>
              <div className="flex items-center justify-between text-sm font-mono font-bold text-indigo-700 mt-1">
                <span>{createdTeacher.password}</span>
                <button
                  onClick={() => copyToClipboard(createdTeacher.password, "password")}
                  className="text-indigo-600 hover:text-indigo-800 cursor-pointer ml-2"
                >
                  {copiedField === "password" ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => {
                const payload = `🏫 Language Lab Faculty Credentials\nFaculty: ${createdTeacher.full_name}\nLogin URL: ${loginUrl}\nEmail: ${createdTeacher.email}\nPassword: ${createdTeacher.password}`;
                copyToClipboard(payload, "all");
              }}
              className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {copiedField === "all" ? (
                <>
                  <Check size={16} className="text-emerald-400" />
                  <span>Copied All to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy All Credentials</span>
                </>
              )}
            </button>

            <button
              onClick={() => router.push("/institute-dashboard/teachers")}
              className="px-6 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all cursor-pointer text-center"
            >
              Back to Faculty List
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* ── Top Header Navigation ───────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/institute-dashboard/teachers")}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isEditing ? "Edit Faculty Member" : "Register New Faculty Member"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Onboard teachers and generate access credentials for portal login.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Main Registration Form ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Personal & Contact Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal & Contact Details</h2>
              <p className="text-xs text-slate-400">Teacher identity and contact info</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Faculty Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Rajesh Sharma"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address (Login ID) *
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="teacher@institute.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Account Status
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: "active", label: "Active Account", color: "bg-emerald-600 text-white" },
                  { id: "inactive", label: "Inactive", color: "bg-slate-700 text-white" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s.id })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formData.status === s.id
                        ? `${s.color} shadow-sm`
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Security & Login Credentials */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Key size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Access Credentials</h2>
                <p className="text-xs text-slate-400">Plain text password for easy faculty sharing</p>
              </div>
            </div>

            <button
              type="button"
              onClick={generatePassword}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles size={13} />
              Auto-Generate Password
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Login Password *
            </label>
            <div className="relative max-w-md">
              <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-sm font-mono font-bold text-indigo-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              💡 Stored as clean plain text so Institute Admin can copy and provide it to the faculty member.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push("/institute-dashboard/teachers")}
            className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Faculty...</span>
              </>
            ) : (
              <span>{isEditing ? "Update Faculty Member" : "Register Faculty & Generate Access"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RegisterFacultyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <RegisterFacultyPageContent />
    </Suspense>
  );
}
