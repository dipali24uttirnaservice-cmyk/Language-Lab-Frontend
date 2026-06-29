"use client";

import { Search, Plus, Upload } from "lucide-react";
export default function TableToolbar({   title,
  
  search,
  setSearch,
  onAdd,
  onBulkUpload,
    sampleExcel="/sample-students.xlsx"

}) {
  return (
    <div className="p-6 border-b bg-white">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">Manage all records efficiently</p>
      </div>

      {/* Search + Filter + Add Button */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-80 group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>


     

        <div className="flex-1" />

        {/* Add Button */}
        <button
          onClick={onAdd}
          className="h-11 px-5 rounded-xl bg-slate-900 text-white font-semibold flex items-center gap-2 shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Plus size={18} />
          Add New
        </button>
      </div>
    </div>
  );
}