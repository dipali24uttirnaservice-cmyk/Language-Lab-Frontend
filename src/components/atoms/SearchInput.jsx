"use client";

import { Search } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative w-full max-w-sm group">
      {/* Icon Wrapper: Explicitly set height and vertical centering */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <Search
          size={16}
          className="text-slate-400 group-focus-within:text-indigo-600 transition-colors"
        />
      </div>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          h-11
          pl-10
          pr-4
          rounded-xl
          border
          border-slate-200
          bg-white
          text-sm
          placeholder:text-slate-400
          focus:border-indigo-500
          focus:outline-none
          transition-all
          duration-200
        "
      />
    </div>
  );
}