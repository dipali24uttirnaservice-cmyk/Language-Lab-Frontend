"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  AlertCircle,
  Loader2,
  ArrowLeft,
  BookOpen,
  Sparkles,
  CheckCircle,
} from "lucide-react";

import { subjectApi } from "@/services/subject/subjectApi";
import StatusModal from "@/components/molecules/StatusModal";

export default function SubjectFormPage() {
  const router = useRouter();
  const params = useParams();

  const routeId = params?.id;

  const subjectId =
    routeId && routeId !== "create"
      ? Array.isArray(routeId)
        ? routeId[0]
        : routeId
      : null;

  const isEditMode = Boolean(subjectId);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const [formErrors, setFormErrors] = useState({});

  const [statusData, setStatusData] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  // Fetch subject for edit
  useEffect(() => {
    if (!subjectId) return;

    const fetchSubjectDetail = async () => {
      try {
        setLoading(true);

        const response = await subjectApi.subjectDetail(subjectId);
        const responseData = response?.data;
        const subject = responseData?.data ?? responseData;

        setFormTitle(subject?.title || "");
        setFormDescription(subject?.description || "");
      } catch (error) {
        console.error("Fetch Subject Detail Error:", error);

        setStatusData({
          open: true,
          type: "error",
          title: "Failed",
          message:
            error?.response?.data?.message ||
            "Unable to fetch subject details.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetail();
  }, [subjectId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormErrors({});

    const errors = {};

    if (!formTitle.trim()) {
      errors.title = "Subject title is required.";
    }

    if (formTitle.trim().length > 100) {
      errors.title = "Subject title must not exceed 100 characters.";
    }

    if (formDescription.trim().length > 500) {
      errors.description = "Description must not exceed 500 characters.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      title: formTitle.trim(),
      description: formDescription.trim(),
    };

    try {
      setSubmitting(true);

      if (isEditMode) {
        await subjectApi.updateSubject(subjectId, payload);

        setStatusData({
          open: true,
          type: "success",
          title: "Updated Successfully",
          message: "Subject has been updated successfully.",
        });
      } else {
        await subjectApi.createSubject(payload);

        setStatusData({
          open: true,
          type: "success",
          title: "Created Successfully",
          message: "Subject has been created successfully.",
        });
      }
    } catch (error) {
      console.error(
        isEditMode ? "Update Subject Error:" : "Create Subject Error:",
        error
      );

      setStatusData({
        open: true,
        type: "error",
        title: isEditMode ? "Update Failed" : "Create Failed",
        message:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusClose = () => {
    const wasSuccess = statusData.type === "success";

    setStatusData((prev) => ({
      ...prev,
      open: false,
    }));

    if (wasSuccess) {
      router.push("/institute-dashboard/subject");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">
            Loading subject details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/institute-dashboard/subject")}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-100 text-slate-600 hover:text-orange-600 transition-colors shadow-xs cursor-pointer flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              Academic Resources
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {isEditMode ? "Update" : "Create"}{" "}
              <span className="text-orange-600">Subject</span>
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 shadow-inner">
          <Sparkles className="w-6 h-6" />
        </div>
      </div>

      {/* FORM CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              Subject Title
              <span className="text-rose-500 font-bold">*</span>
            </label>

            <div className="relative">
              <input
                type="text"
                value={formTitle}
                onChange={(event) => setFormTitle(event.target.value)}
                placeholder="e.g. Advanced Mathematics & Calculus"
                maxLength={100}
                className={`w-full rounded-2xl border bg-slate-50/50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 text-sm font-medium ${
                  formErrors.title
                    ? "border-rose-300 focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
                    : "border-slate-200 hover:border-orange-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500"
                }`}
              />
            </div>

            <div className="flex items-center justify-between px-1">
              {formErrors.title ? (
                <p className="text-xs flex items-center gap-1 font-semibold text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.title}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400 font-medium ml-auto">
                {formTitle.length}/100
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>

            <div className="relative">
              <textarea
                value={formDescription}
                onChange={(event) => setFormDescription(event.target.value)}
                placeholder="Briefly describe what this subject covers, syllabus highlights, or objectives..."
                rows={5}
                maxLength={500}
                className={`w-full rounded-2xl border bg-slate-50/50 px-4 py-3.5 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 text-sm font-medium resize-none ${
                  formErrors.description
                    ? "border-rose-300 focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
                    : "border-slate-200 hover:border-orange-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-500"
                }`}
              />
            </div>

            <div className="flex items-center justify-between px-1">
              {formErrors.description ? (
                <p className="text-xs flex items-center gap-1 font-semibold text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {formErrors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400 font-medium ml-auto">
                {formDescription.length}/500
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
            <button
              type="button"
              onClick={() => router.push("/institute-dashboard/subject")}
              disabled={submitting}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 bg-white font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Cancel
            </button>

            <motion.button
              type="submit"
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              disabled={submitting}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEditMode ? "Update Subject" : "Create Subject"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      <StatusModal
        open={statusData.open}
        type={statusData.type}
        title={statusData.title}
        message={statusData.message}
        onClose={handleStatusClose}
      />
    </div>
  );
}