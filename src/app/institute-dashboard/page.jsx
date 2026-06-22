"use client";

import { motion } from "framer-motion";
import { Users, GraduationCap, ShieldCheck, Activity, CheckCircle2 } from "lucide-react";

export default function instituteDashboard() {
  return (
<div className="relative min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900 overflow-hidden font-sans">      
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] opacity-80" />
        <motion.div 
           animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }} 
           transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
           className="absolute -top-20 right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-300/15 via-blue-200/10 to-transparent blur-[100px]" 
        />
      </div>

<div className="relative z-10 max-w-7xl mx-auto space-y-10">        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400 shadow-sm mb-2">
              ✦ institute Management Portal
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
              Welcome Back, 
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"> Administrator 👋</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/80 p-2 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Operational</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Enrolled Students" value="482" icon={GraduationCap} color="from-blue-500 to-indigo-600" sub="+12 added this week" />
          <StatCard title="Active Teachers" value="24" icon={Users} color="from-amber-400 to-orange-500" sub="Top 5% in District" />
          <StatCard title="Certificates" value="5" icon={CheckCircle2} color="from-emerald-400 to-emerald-600" sub="Ready to export" />
          <StatCard title="License Status" value="Active" icon={ShieldCheck} color="from-rose-500 to-pink-600" sub="Expires in 6 months" />
        </div>

        {/* Main Layout */}
       {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Recent Activity Log */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" /> Recent Activity Log
              </h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Live Syncing</span>
            </div>
            
            <div className="space-y-0"> {/* Removed space-y-1 for tighter control */}
              <ActivityRow icon={CheckCircle2} text="New student enrollment request approved" time="10 MINS AGO" colorClass="from-emerald-400 to-emerald-600" />
              <ActivityRow icon={Users} text="Teacher profile updated by Administration" time="2 HOURS AGO" colorClass="from-blue-400 to-blue-600" />
              <ActivityRow icon={GraduationCap} text="Course syllabus verified for semester" time="YESTERDAY" colorClass="from-amber-400 to-orange-500" />
              <ActivityRow icon={ShieldCheck} text="Security credentials renewed" time="3 DAYS AGO" colorClass="from-rose-400 to-rose-600" />
            </div>
          </div>

          {/* Campus Goal Card - UPDATED PROGRESS BAR */}
          <motion.div whileHover={{ y: -4 }} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
             <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 mb-4">🏆 Campus Goal</h3>
             <p className="mb-4 text-xs font-medium text-slate-400">Reach Full Enrollment Capacity</p>
             <div className="space-y-2">
                <div className="flex justify-between text-xs font-black">
                  <span>Progress</span>
                  <span className="text-indigo-600">74%</span>
                </div>
                {/* Updated Gradient: matches your screenshot's orange-to-green transition */}
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                   <div className="h-full w-[74%] bg-gradient-to-r from-orange-400 via-amber-400 to-emerald-500" />
                </div>
             </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
     


function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex justify-between items-start">
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{value}</p>
         </div>
         <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${color} shadow-lg shadow-indigo-500/20`}>
            <Icon size={20} />
         </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 mt-6 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function ActivityRow({ icon: Icon, text, time, colorClass }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="flex flex-col items-center">
        {/* Dynamic Gradient Icon */}
        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white shadow-md bg-gradient-to-br ${colorClass}`}>
          <Icon size={18} />
        </div>
        {/* The timeline connector line */}
        <div className="w-px h-8 bg-slate-200 mt-2 group-last:hidden" />
      </div>
      <div className="flex-1 flex justify-between items-start pt-1 pb-8">
        <p className="text-sm font-bold text-slate-700">{text}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 shrink-0">{time}</p>
      </div>
    </div>
  );
}