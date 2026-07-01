"use client";

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
    <div className="bg-white border-b border-slate-200 p-6">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {title}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Manage all student records efficiently
          </p>
        </div>

       <button
  onClick={onAdd}
  className="
    inline-flex
    items-center
    gap-2
    rounded-xl
    bg-gradient-to-r
    from-orange-500
    to-orange-600
    px-5
    py-3
    text-white
    font-semibold
    shadow-lg
    hover:from-orange-600
    hover:to-orange-700
    hover:shadow-xl
    hover:scale-[1.02]
    active:scale-95
    transition-all
    duration-200
  "
>
  <Plus size={18} />
  Add Student
</button>

      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Search */}
        <div className="relative md:col-span-2">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, Roll No..."
            className="
              w-full
              h-12
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pl-11
              pr-4
              text-sm
              outline-none
              transition-all
              focus:bg-white
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
          />

        </div>

        {/* Segment */}
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="
            h-12
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            text-sm
            outline-none
            transition
            focus:border-indigo-500
            focus:ring-4
            focus:ring-indigo-100
          "
        >
          <option value="">All Segments</option>

          {segmentOptions.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        {/* Year */}
        <div className="flex gap-3">

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="
              flex-1
              h-12
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-sm
              outline-none
              transition
              focus:border-indigo-500
              focus:ring-4
              focus:ring-indigo-100
            "
          >
            <option value="">All Years</option>

            {yearOptions.map((item) => (
              <option
                key={item}
                value={item}
              >
                Year {item}
              </option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="
              h-12
              w-12
              rounded-xl
              border
              border-slate-200
              bg-white
              flex
              items-center
              justify-center
              hover:bg-slate-100
              transition
            "
          >
            <RotateCcw size={18} />
          </button>

        </div>

      </div>

    </div>
  );
}