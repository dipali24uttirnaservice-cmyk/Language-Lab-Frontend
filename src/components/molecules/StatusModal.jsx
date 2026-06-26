"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";

export default function StatusModal({
  open,
  type = "success",
  title,
  message,
  onClose,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
            }}
            className="fixed left-1/2 top-1/2 z-[1000000] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-8 shadow-2xl"
          >
           

            <div className="flex flex-col items-center text-center">
              {type === "success" ? (
                <CheckCircle2
                  size={70}
                  className="text-green-500"
                />
              ) : (
                <XCircle
                  size={70}
                  className="text-red-500"
                />
              )}

              <h3 className="mt-4 text-2xl font-bold">
                {title}
              </h3>

              <p className="mt-2 text-slate-600">
                {typeof message === "object" ? message.message : message}
              </p>

               <button
  onClick={onClose}
  className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
>
  OK
</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}