"use client";

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
LineChart,
Line,
} from "recharts";

const studentGrowth = [
{ month: "Jan", students: 50 },
{ month: "Feb", students: 80 },
{ month: "Mar", students: 120 },
{ month: "Apr", students: 170 },
{ month: "May", students: 240 },
{ month: "Jun", students: 312 },
];

const teacherGrowth = [
{ month: "Jan", teachers: 3 },
{ month: "Feb", teachers: 5 },
{ month: "Mar", teachers: 7 },
{ month: "Apr", teachers: 10 },
{ month: "May", teachers: 12 },
{ month: "Jun", teachers: 15 },
];

const statusData = [
{ name: "Active", value: 260 },
{ name: "Inactive", value: 52 },
];

const COLORS = ["#4F46E5", "#E11D48"];

const stats = [
{
title: "Students",
value: "312",
icon: Users,
gradient: "from-indigo-500 to-violet-500",
},
{
title: "Teachers",
value: "15",
icon: GraduationCap,
gradient: "from-emerald-500 to-green-500",
},
{
title: "Courses",
value: "8",
icon: BookOpen,
gradient: "from-orange-500 to-amber-500",
},
{
title: "Completion Rate",
value: "92%",
icon: TrendingUp,
gradient: "from-pink-500 to-rose-500",
},
];

const activities = [
{
title: "New Student Registered",
description: "Rahul Sharma joined IELTS Course",
icon: UserPlus,
},
{
title: "Teacher Added",
description: "John Smith joined English Department",
icon: GraduationCap,
},
{
title: "License Updated",
description: "Student capacity increased to 500",
icon: ShieldCheck,
},
{
title: "Course Completed",
description: "25 students completed Spoken English",
icon: Award,
},
];

export default function AnalyticsPage() {
return ( <div className="min-h-screen bg-slate-50 p-6 space-y-8">
{/* Header */}

```
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="text-4xl font-bold text-slate-900">
        Analytics Dashboard
      </h1>

      <p className="text-slate-500 mt-2">
        Monitor language lab performance and growth
      </p>
    </div>

    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-medium transition">
      Download Report
    </button>
  </div>

  {/* KPI Cards */}

  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
    {stats.map((item) => {
      const Icon = item.icon;

      return (
        <div
          key={item.title}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm">
                {item.title}
              </p>

              <h2 className="text-4xl font-bold mt-2 text-slate-900">
                {item.value}
              </h2>
            </div>

            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${item.gradient} flex items-center justify-center text-white`}
            >
              <Icon size={26} />
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* Student Growth */}

  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
    <h2 className="text-xl font-bold mb-6">
      Student Growth
    </h2>

    <div className="h-[380px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={studentGrowth}>
          <defs>
            <linearGradient
              id="studentGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#4F46E5"
                stopOpacity={0.4}
              />
              <stop
                offset="95%"
                stopColor="#4F46E5"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Area
            type="monotone"
            dataKey="students"
            stroke="#4F46E5"
            strokeWidth={3}
            fill="url(#studentGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Charts */}

  <div className="grid lg:grid-cols-2 gap-6">
    {/* Teacher Growth */}

    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">
        Teacher Growth
      </h2>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={teacherGrowth}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="teachers"
              stroke="#10B981"
              strokeWidth={4}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Student Status */}

    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-6">
        Student Status
      </h2>

      <div className="relative h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={110}
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <h3 className="text-4xl font-bold">
              312
            </h3>

            <p className="text-slate-500">
              Students
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Activity Section */}

  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
    <h2 className="text-xl font-bold mb-6">
      Recent Activity
    </h2>

    <div className="space-y-5">
      {activities.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="flex gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Icon
                size={20}
                className="text-indigo-600"
              />
            </div>

            <div className="flex-1 bg-slate-50 rounded-2xl p-4">
              <h3 className="font-semibold text-slate-800">
                {item.title}
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>


);
}
