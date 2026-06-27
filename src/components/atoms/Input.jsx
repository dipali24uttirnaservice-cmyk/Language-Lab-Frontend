"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Input({
  label,
  type = "text",
  className = "",
  error,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          className={`
            w-full
            rounded-xl
            border
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-orange-400 focus:ring-orange-100"}
            bg-white
            px-4
            py-3
            text-slate-900
            placeholder:text-slate-400
            outline-none
            transition-all
            focus:ring-4
            ${isPassword ? "pr-12" : ""}
            ${className}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-500
              hover:text-orange-500
              transition-colors
            "
          >
            {showPassword ? (
              <FaEyeSlash size={18} />
            ) : (
              <FaEye size={18} />
            )}
          </button>
        )}
      </div>
      {error && <div className="mt-1 text-sm text-red-500 font-medium">{error}</div>}
    </div>
  );
}