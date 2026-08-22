"use client";

import { motion } from "framer-motion";
import { Search, Plus, RotateCcw } from "lucide-react";

export default function TableToolbar({
  title,
  search,
  setSearch,
  onAdd,
  segment,
  setSegment,
  year,
  setYear,
  segmentOptions = [],
  yearOptions = [],
}) {
  const clearFilters = () => {
    setSearch("");
    setSegment("");
    setYear("");
  };

  return (
    <div className="bg-white border-b border-slate-200/60 p-6 shadow-sm">
      {/* Header Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          {/* Badge styled exactly like the screenshot */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            ✦ English Learning Dashboard
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {title}{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Records
            </span>
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage all student records efficiently
          </p>
        </div>

        {/* Primary CTA with the brand orange gradient */}
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/20 hover:opacity-95 transition self-start sm:self-auto"
        >
          <Plus size={16} strokeWidth={3} />
          Add Student
        </motion.button>
      </div>

      {/* Filters System Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input Container with Orange Highlight Focus */}
        <div className="relative md:col-span-2 group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Roll No..."
            className="w-full h-12 rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-sm outline-none transition duration-150 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>

        {/* Segment Selector */}
        <div className="relative">
       <select
  value={segment}
  onChange={(e) => setSegment(e.target.value)}
  className={`w-full h-12 rounded-xl border bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none appearance-none transition duration-150 cursor-pointer ${
    segment
      ? "border-orange-500 ring-4 ring-orange-500/10"
      : "border-slate-200 hover:border-slate-300"
  } focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10`}
>
  <option value="" disabled>
    Department/Branch
  </option>

  {segmentOptions
    .filter((item) => item !== "")
    .map((item) => (
      <option key={item} value={item}>
        {item}
      </option>
    ))}
</select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>

        {/* Year Selector + Reset Actions */}
        <div className="flex gap-3">
          <div className="relative flex-1">
       <select
  value={year}
  onChange={(e) => setYear(e.target.value)}
  className={`w-full h-12 rounded-xl border bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none appearance-none transition duration-150 cursor-pointer ${
    year
      ? "border-orange-500 ring-4 ring-orange-500/10"
      : "border-slate-200 hover:border-slate-300"
  } focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10`}
>
  <option value="" disabled>
    Year/Batch
  </option>

  {yearOptions
    .filter((item) => item !== "")
    .map((item) => (
      <option key={item} value={item}>
        Year {item}
      </option>
    ))}
</select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Clean Neutral Reset Button with Orange Hover Interaction */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="h-12 w-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 shadow-sm transition duration-150 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
            title="Reset Filters"
          >
            <RotateCcw size={16} strokeWidth={2.5} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}