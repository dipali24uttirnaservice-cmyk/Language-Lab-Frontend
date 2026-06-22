"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function LogoutModal({
  open,
  onClose,
  onConfirm,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
            }}
            className="fixed left-1/2 top-1/2 z-[60] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 shadow-2xl"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900">
                Logout
              </h3>

              <p className="mt-3 text-slate-600">
                Are you sure you want to logout?
              </p>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-slate-200 py-3 font-semibold"
                >
                  No
                </button>

                <button
                  onClick={onConfirm}
                  className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white hover:bg-red-600"
                >
                  Yes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}