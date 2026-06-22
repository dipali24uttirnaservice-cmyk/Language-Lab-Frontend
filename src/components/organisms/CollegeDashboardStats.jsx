import { motion } from "framer-motion";
import { Users, GraduationCap, ShieldCheck, Building2 } from "lucide-react";

const stats = [
  {
    title: "TOTAL STUDENTS",
    value: "482",
    sub: "+12 added this week",
    icon: GraduationCap,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "ACTIVE TEACHERS",
    value: "24",
    sub: "Top 5% in district",
    icon: Users,
    color: "from-amber-400 to-orange-500",
  },
  {
    title: "TOTAL COURSES",
    value: "15",
    sub: "Ready to publish",
    icon: Building2,
    color: "from-emerald-400 to-teal-500",
  },
  {
    title: "LICENSE STATUS",
    value: "Active",
    sub: "Expires in 6 months",
    icon: ShieldCheck,
    color: "from-pink-500 to-rose-500",
  },
];

export default function instituteDashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {stat.title}
                </p>
                <p className="text-3xl font-black text-slate-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg shadow-indigo-500/20`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-wide">
              {stat.sub}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}