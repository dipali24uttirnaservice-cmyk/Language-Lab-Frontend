"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentModal({
  open,
  onClose,
  mode = "add",
  student = {},
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
  className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex justify-center items-start pt-24  overflow-y-auto"
        >
          <motion.div
            initial={{
              scale: 0.95,
              opacity: 0,
              y: 20,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
            }}
            exit={{
              scale: 0.95,
              opacity: 0,
              y: 20,
            }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">
                  {mode === "add"
                    ? "Add Student"
                    : "Edit Student"}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {mode === "add"
                    ? "Create a new student account"
                    : "Update student information"}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/20 transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    defaultValue={student?.full_name}
                    placeholder="Enter full name"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    defaultValue={student?.email}
                    placeholder="Enter email address"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder={
                      mode === "edit"
                        ? "Leave blank to keep current password"
                        : "Enter password"
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    defaultValue={student?.phone}
                    placeholder="Enter phone number"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value="student"
                    disabled
                    className="w-full border border-slate-300 bg-slate-100 text-slate-500 rounded-xl px-4 py-3"
                  />
                </div>

                {/* Profile Photo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Profile Photo URL
                  </label>
                  <input
                    type="text"
                    defaultValue={student?.profilePhoto}
                    placeholder="https://example.com/profile.jpg"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Profile Preview */}
                {student?.profilePhoto && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Photo Preview
                    </label>

                    <img
                      src={student.profilePhoto}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover border-4 border-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
<div className="flex justify-end items-center gap-3 px-6 py-3 border-t bg-slate-50">  {/* Cancel Button */}
  <button
    onClick={onClose}
    className="
      px-5 py-2.5
      rounded-xl
      bg-slate-200
      text-slate-700
      font-medium
      hover:bg-slate-300
      transition
    "
  >
    Cancel
  </button>

  {/* Create / Update Button */}
  <button
    className="
      px-5 py-2.5
      rounded-xl
      bg-amber-500
      text-white
      font-medium
      hover:bg-amber-600
      shadow-md
      transition
    "
  >
    {mode === "add"
      ? "Create Student"
      : "Update Student"}
  </button>
</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}