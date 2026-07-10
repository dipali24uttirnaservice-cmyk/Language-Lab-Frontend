"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { FaUserCheck, FaCalendarAlt, FaExclamationCircle } from "react-icons/fa";

export default function AttendanceWidget({ attendance = {} }) {
  const summary = attendance.summary || { total_days: 0, present: 0, absent: 0 };
  const { total_days = 0, present = 0, absent = 0 } = summary;

  const percent = total_days > 0 ? Math.round((present / total_days) * 100) : 100;

  // Chart data: present vs absent
  const chartData = [
    { name: "Present", value: present || (total_days === 0 ? 1 : 0), color: "#10b981" }, // emerald
    { name: "Absent", value: absent, color: "#f43f5e" }, // rose
  ];

  // If there's no attendance records yet, show grey full circle
  const isEmpty = total_days === 0;
  if (isEmpty) {
    chartData[0] = { name: "No Records", value: 1, color: "#e2e8f0" }; // slate
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FaUserCheck className="text-emerald-500 text-base" /> Attendance Record
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Attendance Summary
          </p>
        </div>
        {/* <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
          Officially Tracked
        </span> */}
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* Donut Chart */}
        <div className="relative w-[140px] h-[140px] flex items-center justify-center shrink-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={140} minHeight={140}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={65}
                paddingAngle={isEmpty ? 0 : 4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Percentage */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-800 leading-none">
              {isEmpty ? "—" : `${percent}%`}
            </span>
            {!isEmpty && (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Rate
              </span>
            )}
          </div>
        </div>

        {/* Text Legend and Mini Stats */}
        <div className="flex-1 space-y-3.5 w-full">
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <FaCalendarAlt className="text-slate-400" />
              Total Days
            </div>
            <span className="text-sm font-black text-slate-800">{total_days}</span>
          </div>

          <div className="flex items-center justify-between bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Present Days
            </div>
            <span className="text-sm font-black text-emerald-700">{present}</span>
          </div>

          <div className="flex items-center justify-between bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-500">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Absent Days
            </div>
            <span className="text-sm font-black text-rose-700">{absent}</span>
          </div>
        </div>
      </div>

      {/* Attendance Warnings */}
      {percent < 75 && !isEmpty && (
        <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2.5">
          <FaExclamationCircle className="text-amber-500 text-sm mt-0.5 shrink-0" />
          <p className="text-[10px] font-bold text-amber-700 leading-snug">
            Warning: Attendance is below 75%. Please log in daily and complete your lessons to maintain eligibility.
          </p>
        </div>
      )}
    </motion.div>
  );
}
