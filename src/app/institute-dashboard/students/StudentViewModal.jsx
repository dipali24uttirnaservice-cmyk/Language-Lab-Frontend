"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Calendar,
  BadgeCheck,
} from "lucide-react";

export default function StudentViewModal({
  open,
  onClose,
  student,
}) {
  if (!student) return null;

  const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2 text-slate-600">
        <span className="text-indigo-500">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>

      <span className="text-sm font-semibold text-slate-800 text-right">
        {value || "-"}
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[999999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 mt-2">

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">

              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-white hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-lg">
                  {student.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-white">
                    {student.full_name}
                  </h2>

                  <span
                    className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      student.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-1">

              <DetailRow
                icon={<Mail size={16} />}
                label="Email"
                value={student.email}
              />

              <DetailRow
                icon={<Phone size={16} />}
                label="Phone"
                value={student.phone}
              />

              <DetailRow
                icon={<GraduationCap size={16} />}
                label="Course"
                value={student.course}
              />

              <DetailRow
                icon={<BadgeCheck size={16} />}
                label="Enrollment"
                value={student.enrollment_no}
              />

              <DetailRow
                icon={<GraduationCap size={16} />}
                label="Year"
                value={`Year ${student.year}`}
              />

              <DetailRow
                icon={<Calendar size={16} />}
                label="Batch"
                value={student.batch}
              />

              <DetailRow
                icon={<Building2 size={16} />}
                label="Institute"
                value={student.institute?.institute_name}
              />

              <DetailRow
                icon={<Calendar size={16} />}
                label="Last Login"
                value={
                  student.last_login
                    ? new Date(student.last_login).toLocaleDateString()
                    : "-"
                }
              />

            </div>

            {/* Footer */}
            <div className="border-t bg-slate-50 px-6 py-4 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-xl bg-orange-500 px-5 py-2 text-white font-semibold hover:bg-orange-600 transition"
              >
                Close
              </button>
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}