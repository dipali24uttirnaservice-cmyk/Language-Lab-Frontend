"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardApi } from "@/services/institute/dashboardApi";

const STATUS_COLORS = {
  active: "#4F46E5",
  inactive: "#E11D48",
  suspended: "#F59E0B",
};

const ACTIVITY_META = {
  student_registered: {
    title: "New Student Registered",
    icon: UserPlus,
    colorClass: "from-blue-500 to-indigo-600",
  },
  course_completed: {
    title: "Course Completed",
    icon: Award,
    colorClass: "from-rose-500 to-pink-600",
  },
};
const DEFAULT_ACTIVITY_META = {
  title: "Activity Update",
  icon: ShieldCheck,
  colorClass: "from-amber-400 to-orange-500",
};

function timeAgo(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);

  if (seconds < 60) return "Just Now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} Min${minutes > 1 ? "s" : ""} Ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} Hour${hours > 1 ? "s" : ""} Ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} Days Ago`;

  return new Date(timestamp).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function InstituteDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardApi.getDashboard();
        if (response.data.success) {
          setDashboard(response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-indigo-500 animate-spin" />
        <p className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Loading Dashboard...</p>
      </div>
    );
  }

  const enrolledStudents = dashboard?.enrolled_students ?? { total: 0, new_this_week: 0 };
  const coursesLicensed = dashboard?.courses_licensed ?? { total: 0, licensed_total: 0 };
  const licenseUsage = dashboard?.license_usage ?? { total_seats: 0, used_seats: 0, active_licenses: 0 };
  const completionRate = dashboard?.completion_rate ?? 0;
  const studentGrowth = dashboard?.student_growth ?? [];
  const statusBreakdown = dashboard?.student_status_breakdown ?? { active: 0, inactive: 0, suspended: 0, total: 0 };
  const recentActivity = dashboard?.recent_activity ?? [];
  const instituteName = dashboard?.institute_name || "Administrator";

  const statusData = [
    { name: "Active", value: statusBreakdown.active, color: STATUS_COLORS.active },
    { name: "Inactive", value: statusBreakdown.inactive, color: STATUS_COLORS.inactive },
    ...(statusBreakdown.suspended > 0
      ? [{ name: "Suspended", value: statusBreakdown.suspended, color: STATUS_COLORS.suspended }]
      : []),
  ];

  return (
<div className="relative h-screen bg-slate-50 p-6 md:p-8 text-slate-900 overflow-hidden font-sans flex flex-col"> {/* Background Floating Ambient Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-[15%] h-[450px] w-[450px] rounded-full bg-gradient-to-br from-indigo-400/10 via-purple-300/10 to-transparent blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, -20, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-10 left-[10%] h-[350px] w-[350px] rounded-full bg-gradient-to-br from-blue-400/10 via-indigo-200/5 to-transparent blur-[80px]"
        />
      </div>

<div className="relative z-10 max-w-7xl mx-auto w-full space-y-3 ">        {/* Header Section */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 shadow-sm mb-2">
              ✦ Institute Management Portal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight md:text-4xl">
              Welcome Back,{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                {instituteName} 👋
              </span>
            </h1>
          </div>
          <div className="flex flex-row items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-2 rounded-xl border border-white bg-white/80 px-4 py-2 shadow-sm backdrop-blur-md">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Operational
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 transition duration-150"
            >
              Download Report
            </motion.button>
          </div>
        </div>

        {/* KPI Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
         <StatCard
            title="Enrolled Students"
            value={enrolledStudents.total}
            icon={Users}
            color="from-blue-500 to-indigo-600"
            sub={`+${enrolledStudents.new_this_week} added this week`}
          />
          <StatCard
            title="Courses Licensed"
            value={coursesLicensed.total}
            icon={BookOpen}
            color="from-amber-400 to-orange-500"
            sub={`Downloaded, of ${coursesLicensed.licensed_total} licensed`}
          />
          <StatCard
            title="Seat Usage"
            value={`${licenseUsage.used_seats}/${licenseUsage.total_seats}`}
            icon={GraduationCap}
            color="from-emerald-400 to-emerald-600"
            sub="Seats currently in use"
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={TrendingUp}
            color="from-rose-500 to-pink-600"
            sub="Across all module progress"
          />
           <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between"
  >
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Breakdown</p>
        <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Student Status</h2>
      </div>
      <div className="space-y-1.5">
        {statusData.map((data) => (
          <div key={data.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-[11px] font-semibold text-slate-600">{data.name}: {data.value}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="relative h-[100px] w-[100px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={statusData} innerRadius={30} outerRadius={45} paddingAngle={5} dataKey="value">
            {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm font-black text-slate-900">{statusBreakdown.total}</span>
      </div>
    </div>
  </motion.div>
        </div>

        {/* Charts & Analytics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
        <div className="lg:col-span-2">
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    // Reduced padding from p-6 to p-5
    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Performance</p>
        <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Student Growth</h2>
      </div>
      {/* Optional: Add a simple time filter here to make it look professional */}
      <div className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
         <span className="text-[10px] font-bold text-slate-500">6 Months</span>
      </div>
    </div>

    {/* Reduced height from 240px to 180px */}
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={studentGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            className="text-[10px] font-medium fill-slate-400"
            dy={5}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            className="text-[10px] font-medium fill-slate-400"
            dx={-5}
          />
          <Tooltip
            cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          />
          <Area
            type="monotone"
            dataKey="students"
            stroke="#4F46E5"
            strokeWidth={2}
            fill="url(#studentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </motion.div>

</div>
          {/* Sidebar Components Column */}
         {/* Sidebar Components Column - Fixed for balance */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">



  {/* 2. Recent Activity Card (Fixed Height to match) */}
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col h-[280px]"
  >
    <div className="mb-4">
      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Updates</p>
      <h2 className="text-lg font-extrabold text-slate-900">Recent Activity</h2>
    </div>

    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
      <div className="space-y-1">
        {recentActivity.map((item, index) => (
          <ActivityRow
            key={index}
            icon={ACTIVITY_META[item.type]?.icon}
            text={ACTIVITY_META[item.type]?.title}
            sub={item.message}
            time={timeAgo(item.timestamp)}
            colorClass={ACTIVITY_META[item.type]?.colorClass}
          />
        ))}
      </div>
    </div>
  </motion.div>


</div>
        </div>

      </div>
    </div>
  );
}

// --- Reusable Interactive Presentation Components ---

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:border-indigo-100"
    >
      {/* Subtle hover background highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
            {title}
          </p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>

        {/* Elevated icon with glow */}
        <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${color} shadow-lg shadow-indigo-500/20 transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>

      <div className="relative z-10 mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{sub}</p>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          LIVE
        </span>
      </div>
    </motion.div>
  );
}

function ActivityRow({ icon: Icon, text, sub, time, colorClass }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
    >
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${colorClass}`}>
        <Icon size={14} />
      </div>

      <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
        <div className="truncate">
          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {text}
          </p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 shrink-0">
          {time}
        </span>
      </div>
    </motion.div>
  );
}
