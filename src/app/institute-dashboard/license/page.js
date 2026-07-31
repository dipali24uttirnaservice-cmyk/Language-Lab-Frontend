"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Users,
  UserCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Search,
  Ticket,
  X,
} from "lucide-react";
import { licenseApi } from "@/services/license/licenseApi";

export default function LicensePage() {
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const response = await licenseApi.getInstituteLicenses();
      const data = response.data.data;

      const activeCount = data.licenses.filter((l) => l.is_valid).length;
      const expiredCount = data.licenses.filter((l) => !l.is_valid).length;
      const freeSeatsCount = data.licenses.filter((l) => l.has_free_seat).length;

      setSummary({
        instituteName: data.institute_name,
        totalLicenses: data.license_count,
        activeCount,
        expiredCount,
        freeSeatsCount,
        totalSeats: data.total_seats,
        usedSeats: data.used_seats,
        expiryDate: data.expiry_date,
      });

      setLicenses(data.licenses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Search Filter
  const filteredLicenses = licenses.filter((license) => 
    license.license_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    license.user_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Logic for Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLicenses = filteredLicenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-orange-500 animate-spin" />
        <p className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Loading Portal Data...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F4F7FC] p-4 md:p-8 space-y-6 max-w-7xl mx-auto overflow-hidden">
      
      {/* Blueprint Grid Background Pattern matching visual reference */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.45]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #E2E8F0 1px, transparent 1px),
            linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              ✦ English Learning Dashboard
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              License{" "}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{summary?.instituteName}</p>
          </div>
          <div className="bg-white border border-slate-100 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            SYSTEM OPERATIONAL
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={<ShieldCheck size={20} />}
            title="Enrolled Licenses"
            value={summary?.totalLicenses}
            iconBg="from-orange-500 to-amber-500 shadow-orange-500/20"
            subtext="+0 Managed from Core"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            title="Active Licenses"
            value={summary?.activeCount}
            iconBg="from-amber-400 to-amber-500 shadow-amber-500/20"
            subtext="Live system authorization"
          />
          <StatCard
            icon={<Users size={20} />}
            title="Free Seats Available"
            value={summary?.freeSeatsCount}
            iconBg="from-emerald-400 to-emerald-500 shadow-emerald-500/20"
            subtext="Ready to assign instantly"
          />
          <StatCard
            icon={<XCircle size={20} />}
            title="Expired Contracts"
            value={summary?.expiredCount}
            iconBg="from-rose-500 to-pink-500 shadow-rose-500/20"
            subtext="Requires administrative review"
          />
          <StatCard
            icon={<Users size={20} />}
            title="Total Seats"
            value={summary?.totalSeats ?? 0}
            iconBg="from-blue-500 to-indigo-500 shadow-blue-500/20"
            subtext="Across all license keys"
          />
          <StatCard
            icon={<UserCheck size={20} />}
            title="Currently In Use Seats"
            value={summary?.usedSeats ?? 0}
            iconBg="from-violet-500 to-purple-500 shadow-violet-500/20"
            subtext="Live student sessions now"
          />
          <StatCard
            icon={<CalendarClock size={20} />}
            title="Expiry Date"
            value={
              summary?.expiryDate
                ? new Date(summary.expiryDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"
            }
            iconBg="from-sky-500 to-cyan-500 shadow-sky-500/20"
            subtext="Nearest upcoming renewal"
            valueClassName="text-xl"
          />
        </div>

        {/* Table & Filtering Block */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200/60 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
            <div className="flex items-center gap-2 w-full sm:max-w-xs">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-orange-500" size={16} />
                <input
                  type="text"
                  placeholder="Search code or user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-xs font-semibold placeholder:text-slate-400 text-slate-700"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Live Syncing
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 border-b border-slate-200/60 text-[10px] font-black tracking-wider uppercase">
                  <th className="p-4 pl-6">Sr. No</th>
                  <th className="p-4">License Code</th>
                  <th className="p-4">Assigned Target</th>
                  <th className="p-4">System Status</th>
                  <th className="p-4">Seat Capacity</th>
                  <th className="p-4">Timeline Left</th>
                  <th className="p-4 pr-6">Expiry Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                <AnimatePresence mode="popLayout">
                  {currentLicenses.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={7} className="text-center py-16 text-slate-400 font-extrabold uppercase tracking-wider bg-slate-50/20">
                        <Ticket size={32} className="mx-auto mb-2 text-slate-300" />
                        No matching records found
                      </td>
                    </motion.tr>
                  ) : (
                    currentLicenses.map((license, index) => {
                      const total = license.total_seats || 1;
                      const active = license.active_sessions || 0;
                      const percentUsed = Math.min((active / total) * 100, 100);

                      return (
                        <motion.tr 
                          key={license._id} 
                          layout
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          <td className="p-4 pl-6 font-bold text-slate-400 group-hover:text-orange-500 transition-colors">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-4 font-black text-slate-800 tracking-tight">
                            <span className="font-mono bg-slate-100 border border-slate-200/50 text-slate-700 px-2 py-1 rounded-lg text-[11px]">
                              {license.license_code}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            {license.user_id || <span className="text-slate-300 italic font-medium">Unassigned</span>}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                              license.is_valid ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {license.is_valid ? "Active" : "Expired"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col w-36 gap-1.5">
                              <div className="flex justify-between font-bold text-slate-400 text-[10px]">
                                <span>Capacity</span>
                                <span className="text-orange-600 font-extrabold">{Math.round(percentUsed)}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                                <div 
                                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 rounded-full"
                                  style={{ width: `${percentUsed}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-slate-600 font-mono">
                            {license.days_remaining}d
                          </td>
                          <td className="p-4 pr-6 font-bold text-slate-400">
                            {new Date(license.expiry_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination System */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Showing <span className="text-slate-700">{indexOfFirstItem + 1}</span> to{" "}
                <span className="text-slate-700">{Math.min(indexOfLastItem, filteredLicenses.length)}</span> of{" "}
                <span className="text-slate-700">{filteredLicenses.length}</span> Records
              </p>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-xl disabled:opacity-40 shadow-sm hover:bg-slate-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} strokeWidth={2.5} /> Prev
                </motion.button>
                
                <div className="hidden sm:flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        currentPage === i + 1 
                          ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10 border border-white/10" 
                          : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-xl disabled:opacity-40 shadow-sm hover:bg-slate-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={14} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Premium Stat Card matching screen layout identities */
const StatCard = ({ icon, title, value, iconBg, subtext, valueClassName = "text-3xl" }) => {
  return (
    <div className="relative bg-gradient-to-b from-white to-slate-50/50 border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between group">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-orange-500 transition-colors">
          {title}
        </p>
        <h2 className={`font-black text-slate-900 tracking-tight ${valueClassName}`}>
          {value}
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight pt-1">
          {subtext}
        </p>
      </div>

      <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br border border-white/10 group-hover:scale-105 transition-transform duration-200 ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
};