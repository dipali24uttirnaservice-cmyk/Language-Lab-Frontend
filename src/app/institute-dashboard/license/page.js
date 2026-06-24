"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { licenseApi } from "@/services/license/licenseApi";

export default function LicensePage() {
  const [loading, setLoading] = useState(true);
  const [licenses, setLicenses] = useState([]);
  const [summary, setSummary] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust this number as needed

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

  // Logic for Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLicenses = licenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(licenses.length / itemsPerPage);

  if (loading) {
    return <div className="p-10 text-center">Loading licenses...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">License Management</h1>
        <p className="text-slate-500">{summary.instituteName}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
  <StatCard
    icon={<ShieldCheck />}
    title="Total Licenses"
    value={summary.totalLicenses}
    gradient="bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-100"
  />

  <StatCard
    icon={<CheckCircle />}
    title="Active"
    value={summary.activeCount}
    gradient="bg-gradient-to-br from-emerald-50 via-green-50 to-lime-100"
  />

  <StatCard
    icon={<XCircle />}
    title="Expired"
    value={summary.expiredCount}
    gradient="bg-gradient-to-br from-rose-50 via-red-50 to-pink-100"
  />

  <StatCard
    icon={<Users />}
    title="Free Seats"
    value={summary.freeSeatsCount}
    gradient="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100"
  />
</div>
      {/* License Table */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">License List</h2>
          <span className="text-xs text-slate-400">Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, licenses.length)} of {licenses.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
  <tr>
    <th className="p-4 text-left">Sr. No</th>

    <th className="p-4 text-left">
      License Code
    </th>

    <th className="p-4 text-left">
      User ID
    </th>

    <th className="p-4 text-left">
      Status
    </th>

    <th className="p-4 text-left">
      Sessions
    </th>

    <th className="p-4 text-left">
      Days Left
    </th>

    <th className="p-4 text-left">
      Expiry
    </th>
  </tr>
</thead>
          <tbody>
  {currentLicenses.map((license, index) => {
    return (
      <tr
        key={license._id}
        className="
          border-t
          hover:bg-indigo-50
          transition-all
          duration-200
        "
      >
        <td className="p-4 font-semibold text-slate-500">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </td>

        <td className="p-4 font-medium text-indigo-600">
          {license.license_code}
        </td>

        <td className="p-4 text-slate-600">
          {license.user_id || "N/A"}
        </td>

        <td className="p-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              license.is_valid
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {license.is_valid ? "Active" : "Expired"}
          </span>
        </td>

        <td className="p-4">
          {license.active_sessions}/{license.total_seats}
        </td>

        <td className="p-4 font-mono">
          {license.days_remaining}d
        </td>

        <td className="p-4 text-slate-500">
          {new Date(license.expiry_date).toLocaleDateString("en-IN")}
        </td>
      </tr>
    );
  })}
</tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          <div className="hidden sm:flex space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                  currentPage === i + 1 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white border text-slate-600 hover:border-indigo-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-all"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  gradient,
  iconBg,
  iconColor,
}) {
  return (
    <div
      className={`
      relative overflow-hidden
      rounded-3xl
      p-6
      border-2 border-slate-200
      shadow-[0_10px_35px_rgba(0,0,0,0.08)]
      hover:-translate-y-1
      hover:border-slate-300
      transition-all duration-300
      ${gradient}
      `}
    >
      {/* Light Glow */}
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/40 blur-2xl" />

      {/* Stripe Effect */}
      <div
        className="
          absolute inset-0 opacity-[0.05]
          bg-[repeating-linear-gradient(135deg,#000_0px,#000_1px,transparent_1px,transparent_12px)]
        "
      />

      <div className="relative z-10">
        <div
          className={`
            h-14 w-14 rounded-2xl
            flex items-center justify-center
            shadow-md
            ${iconBg}
            ${iconColor}
          `}
        >
          {icon}
        </div>

        <p className="mt-4 text-sm font-medium text-slate-600">
          {title}
        </p>

        <h3 className="mt-2 text-3xl font-black text-slate-800">
          {value}
        </h3>
      </div>
    </div>
  );
}