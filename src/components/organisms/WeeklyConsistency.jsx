"use client";

import { motion } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaFire, FaClock, FaCalendarCheck } from "react-icons/fa";

export default function WeeklyConsistency({ activities = [], attendance = {} }) {
  // 1. Generate last 7 days labels (e.g. "Mon", "Tue")
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  // 2. Parse activities into daily aggregates
  const dailyData = last7Days.map((date) => {
    const dateStr = date.toDateString();
    let totalSec = 0;
    let completedCount = 0;

    activities.forEach((act) => {
      const actDate = new Date(act.logged_at || act.createdAt);
      if (actDate.toDateString() === dateStr) {
        totalSec += act.time_spent_sec || 0;
        if (act.activity_type && act.activity_type.endsWith("_complete")) {
          completedCount += 1;
        }
      }
    });

    return {
      day: dayNames[date.getDay()],
      fullDate: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      minutes: Math.max(Math.round(totalSec / 60), 0),
      lessons: completedCount,
    };
  });

  // Calculate stats
  const totalMinutes = dailyData.reduce((sum, item) => sum + item.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / 7) || 0;
  const totalCompleted = dailyData.reduce((sum, item) => sum + item.lessons, 0);

  // Calculate learning streak from attendance/activity records
  let streak = 0;
  const attendanceRecords = attendance.records || [];
  const presentDates = new Set(
    attendanceRecords
      .filter((r) => r.status === "present")
      .map((r) => new Date(r.date).toDateString())
  );

  // Go backwards day by day to count the continuous streak
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  // If today isn't marked present, let's see if yesterday was present to keep streak alive
  const todayStr = checkDate.toDateString();
  checkDate.setDate(checkDate.getDate() - 1);
  const yesterdayStr = checkDate.toDateString();

  const activeToday = presentDates.has(todayStr);
  const activeYesterday = presentDates.has(yesterdayStr);

  if (activeToday || activeYesterday) {
    let currentCheck = activeToday ? new Date() : checkDate;
    currentCheck.setHours(0, 0, 0, 0);

    while (true) {
      if (presentDates.has(currentCheck.toDateString())) {
        streak += 1;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-xl backdrop-blur-md">
          <p className="text-xs font-bold text-slate-400">{payload[0].payload.fullDate}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm font-black text-amber-600 flex items-center gap-1.5">
              <FaClock className="text-xs" /> {payload[0].value} Mins Studied
            </p>
            {payload[1] && (
              <p className="text-sm font-black text-indigo-600 flex items-center gap-1.5">
                <FaCalendarCheck className="text-xs" /> {payload[1].value} Lessons Completed
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Weekly Study Consistency
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Compare study time and lesson completion daily
          </p>
        </div>

        {/* Streak Fire Widget */}
        {/* <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white shadow-md shadow-orange-500/20">
          <FaFire className="text-xl animate-bounce" /> 
           <div>
            <p className="text-[9px] font-bold text-orange-100 uppercase tracking-widest leading-none">
              Daily Streak
            </p>
            <p className="text-sm font-black tracking-tight">{streak || 1} Days Active</p>
          </div>
        </div> */}
      </div>

      {/* Mini Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Time</p>
          <p className="text-base font-black text-slate-800 mt-0.5">{totalMinutes}m</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Avg</p>
          <p className="text-base font-black text-slate-800 mt-0.5">{avgMinutes}m</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-base font-black text-slate-800 mt-0.5">{totalCompleted} Lessons</p>
        </div>
      </div>

      {/* Recharts Core */}
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={dailyData} margin={{ top: 10, right: -5, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 9 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 9 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 10 }}
            />
            <Bar
              yAxisId="left"
              name="Study Minutes"
              dataKey="minutes"
              fill="url(#colorMinutes)"
              radius={[8, 8, 0, 0]}
              barSize={20}
            />
            <Line
              yAxisId="right"
              name="Lessons Completed"
              type="monotone"
              dataKey="lessons"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, stroke: "#6366f1", strokeWidth: 2, fill: "#fff" }}
              activeDot={{ r: 6 }}
            />
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
