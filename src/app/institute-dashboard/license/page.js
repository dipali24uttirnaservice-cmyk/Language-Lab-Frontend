"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Ticket,
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading Portal Data...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F4F7FC] p-4 md:p-8 space-y-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* Blueprint Grid Background Pattern matching Screenshot 2026-06-27 143645.jpg */}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-200/60 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              + Institute Management Portal
            </div>
           
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">{summary.instituteName}</p>
          </div>
          <div className="bg-white border border-slate-100 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            SYSTEM OPERATIONAL
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={<ShieldCheck size={20} />}
            title="Enrolled Licenses"
            value={summary.totalLicenses}
            iconBg="bg-blue-600 shadow-blue-500/30"
            subtext="+0 Managed from Core"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            title="Active Licenses"
            value={summary.activeCount}
            iconBg="bg-amber-500 shadow-amber-500/30"
            subtext="Live system authorization"
          />
          <StatCard
            icon={<Users size={20} />}
            title="Free Seats Available"
            value={summary.freeSeatsCount}
            iconBg="bg-emerald-500 shadow-emerald-500/30"
            subtext="Ready to assign instantly"
          />
          <StatCard
            icon={<XCircle size={20} />}
            title="Expired Contracts"
            value={summary.expiredCount}
            iconBg="bg-rose-500 shadow-rose-500/30"
            subtext="Requires administrative review"
          />
        </div>

        {/* Table & Filtering Block */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white">
            <div className="flex items-center gap-2 w-full sm:max-w-xs">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search code or user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-xs font-medium placeholder:text-slate-400 text-slate-700"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg">
              Live Syncing
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 border-b border-slate-100 text-[10px] font-bold tracking-widest uppercase">
                  <th className="p-4 pl-6">Sr. No</th>
                  <th className="p-4">License Code</th>
                  <th className="p-4">Assigned Target</th>
                  <th className="p-4">System Status</th>
                  <th className="p-4">Seat Capacity</th>
                  <th className="p-4">Timeline Left</th>
                  <th className="p-4 pr-6">Expiry Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-bold uppercase tracking-wider">
                      <Ticket size={28} className="mx-auto mb-2 text-slate-300" />
                      No matching records found
                    </td>
                  </tr>
                ) : (
                  currentLicenses.map((license, index) => {
                    const total = license.total_seats || 1;
                    const active = license.active_sessions || 0;
                    const percentUsed = Math.min((active / total) * 100, 100);

                    return (
                      <tr key={license._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-400">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-4 font-black text-slate-800 tracking-tight">
                          <span className="font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded">
                            {license.license_code}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {license.user_id || <span className="text-slate-300 italic font-normal">Unassigned</span>}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            license.is_valid ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {license.is_valid ? "Active" : "Expired"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col w-32 gap-1">
                            <div className="flex justify-between font-bold text-slate-500 text-[10px]">
                              <span>Capacity</span>
                              <span className="text-blue-600">{Math.round(percentUsed)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              {/* Orange to Green Progress bar matching image aesthetic */}
                              <div 
                                className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500"
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
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-xl disabled:opacity-40 shadow-sm hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              
              <div className="hidden sm:flex space-x-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === i + 1 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 bg-white border border-slate-200 rounded-xl disabled:opacity-40 shadow-sm hover:bg-slate-50 transition-all"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Stat Card component mirroring standard layout objects from the screenshot reference */
const StatCard = ({ icon, title, value, iconBg, subtext }) => {
  return (
    <div className="relative bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
          {value}
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight pt-1">
          {subtext}
        </p>
      </div>

      <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-lg ${iconBg}`}>
        {icon}
      </div>
    </div>
  );
};