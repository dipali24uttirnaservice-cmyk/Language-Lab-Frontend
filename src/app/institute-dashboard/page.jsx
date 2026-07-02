"use client";

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

// --- Mock Data ---
const studentGrowth = [
  { month: "Jan", students: 50 },
  { month: "Feb", students: 80 },
  { month: "Mar", students: 120 },
  { month: "Apr", students: 170 },
  { month: "May", students: 240 },
  { month: "Jun", students: 312 },
];

const statusData = [
  { name: "Active", value: 260 },
  { name: "Inactive", value: 52 },
];

const COLORS = ["#4F46E5", "#E11D48"];

const activities = [
  {
    title: "New Student Registered",
    description: "Rahul Sharma joined IELTS Course",
    time: "2 Mins Ago",
    icon: UserPlus,
    colorClass: "from-blue-500 to-indigo-600",
  },
  {
    title: "License Updated",
    description: "Student capacity increased to 500",
    time: "3 Hours Ago",
    icon: ShieldCheck,
    colorClass: "from-amber-400 to-orange-500",
  },
  {
    title: "Course Completed",
    description: "25 students completed Spoken English",
    time: "Yesterday",
    icon: Award,
    colorClass: "from-rose-500 to-pink-600",
  },
];

export default function InstituteDashboard() {
  return (
    <div className="relative min-h-screen bg-slate-50 p-6 md:p-8 text-slate-900 overflow-hidden font-sans flex flex-col justify-center">
      {/* Background Floating Ambient Orbs */}
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

      <div className="relative z-10 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 shadow-sm mb-2">
              ✦ Institute Management Portal
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight md:text-4xl">
              Welcome Back,{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Administrator 👋
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Enrolled Students"
            value="312"
            icon={Users}
            color="from-blue-500 to-indigo-600"
            sub="+12 added this week"
          />
          <StatCard
            title="Teachers"
            value="15"
            icon={GraduationCap}
            color="from-emerald-400 to-emerald-600"
            sub="Active Instructors"
          />
          <StatCard
            title="Courses Licensed"
            value="8"
            icon={BookOpen}
            color="from-amber-400 to-orange-500"
            sub="Top 5% in District"
          />
          <StatCard
            title="Completion Rate"
            value="92%"
            icon={TrendingUp}
            color="from-rose-500 to-pink-600"
            sub="Ready to export"
          />
        </div>

        {/* Charts & Analytics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-300 h-full flex flex-col justify-between"
            >
              <div className="mb-4">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Performance Metric</p>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">Student Growth</h2>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studentGrowth} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs font-semibold fill-slate-400" dy={8} />
                    <YAxis tickLine={false} axisLine={false} className="text-xs font-semibold fill-slate-400" dx={-4} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }} />
                    <Area type="monotone" dataKey="students" stroke="#4F46E5" strokeWidth={3} fill="url(#studentGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Components Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Student Distribution Pie Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between gap-4"
            >
              <div className="space-y-3 max-w-[50%]">
                <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Breakdown</p>
                  <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Student Status</h2>
                </div>
                <div className="space-y-1.5">
                  {statusData.map((data, idx) => (
                    <div key={data.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-sm font-semibold text-slate-600 truncate">{data.name}: {data.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-[120px] w-[120px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index]} className="cursor-pointer transition-opacity hover:opacity-80" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <h3 className="text-xl font-extrabold text-slate-900 leading-none">312</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Timeline Recent Activity Container */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
            >
              <div className="mb-4">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Live Updates</p>
                <h2 className="text-lg font-extrabold text-slate-900">Recent Activity</h2>
              </div>
              <div className="flex flex-col space-y-3.5">
                {activities.map((item, index) => (
                  <ActivityRow
                    key={index}
                    icon={item.icon}
                    text={item.title}
                    sub={item.description}
                    time={item.time}
                    colorClass={item.colorClass}
                  />
                ))}
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
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50/60 rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-lg hover:border-slate-300 transition duration-150 group cursor-pointer"
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition duration-150">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl text-white bg-gradient-to-br ${color} shadow-md shadow-slate-900/5 border border-white/10 transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between relative z-10">
        <p className="text-xs font-medium text-slate-500">{sub}</p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 tracking-normal group-hover:bg-indigo-50 group-hover:text-indigo-600 transition duration-150">Live</span>
      </div>
    </motion.div>
  );
}

function ActivityRow({ icon: Icon, text, sub, time, colorClass }) {
  return (
    <motion.div 
      whileHover={{ x: 3 }}
      className="flex items-center gap-3.5 group cursor-pointer"
    >
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm bg-gradient-to-br ${colorClass} transition-transform group-hover:scale-105`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0 flex justify-between items-center gap-2">
        <div className="truncate">
          <p className="text-sm font-bold text-slate-800 truncate leading-snug group-hover:text-indigo-600 transition duration-150">{text}</p>
          <p className="text-xs text-slate-500 truncate mt-0.5">{sub}</p>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{time}</p>
      </div>
    </motion.div>
  );
}