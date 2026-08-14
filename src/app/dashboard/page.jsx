"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

import DashboardStats from "@/components/organisms/DashboardStats";
import RecentActivity from "@/components/organisms/RecentActivity";
import OverallScoreGauge from "@/components/organisms/OverallScoreGauge";

// These render recharts (a heavy dependency), so code-split them out of the
// initial dashboard bundle instead of loading the charting library up front.
const ChartSkeleton = () => (
  <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-100" />
);
const SkillRadarChart = dynamic(() => import("@/components/organisms/SkillRadarChart"), {
  loading: ChartSkeleton,
  ssr: false,
});
const WeeklyConsistency = dynamic(() => import("@/components/organisms/WeeklyConsistency"), {
  loading: ChartSkeleton,
  ssr: false,
});
const RecommendationHub = dynamic(() => import("@/components/organisms/RecommendationHub"), {
  loading: ChartSkeleton,
  ssr: false,
});
const AttendanceWidget = dynamic(() => import("@/components/organisms/AttendanceWidget"), {
  loading: ChartSkeleton,
  ssr: false,
});

import { progressApi } from "@/services/progress/progressApi";
import { activityApi } from "@/services/activity/activityApi";
import { attendanceApi } from "@/services/attendance/attendanceApi";
import { aiApi } from "@/services/ai/aiApi";
import { studentApi } from "@/services/student/studentApi";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [progress, setProgress] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attendance, setAttendance] = useState({
    summary: { total_days: 0, present: 0, absent: 0 },
    records: [],
  });
  const [aiHistory, setAiHistory] = useState([]);
  const [statsData, setStatsData] = useState({
    enrolledCourses: 0,
    aiInteractions: 0,
    attendanceRate: 0,
    streakDays: 0,
    pendingModules: 0,
    totalLessons: 0,
    completedLessons: 0,
    incompleteLessons: 0,
    inProgressLessons: 0,
    notStartedLessons: 0,
    moduleBreakdown: {
      video: { completed: 0, total: 0 },
      audio: { completed: 0, total: 0 },
      text: { completed: 0, total: 0 },
      exercise: { completed: 0, total: 0 },
      vocabulary: { completed: 0, total: 0 },
    },
  });

  // 1. Fetch live database records from backend APIs
  useEffect(() => {
    async function fetchAllData() {
      // Only fetch if we are NOT in demo mock mode
      if (isDemoMode) return;

      try {
        setLoading(true);

        const [
          progressRes,
          activityRes,
          attendanceRes,
          aiRes,
          coursesRes,
          kpiRes,
        ] = await Promise.allSettled([
          progressApi.getMyProgress(),
          activityApi.getMyActivity(),
          attendanceApi.getMyAttendance(),
          aiApi.getHistory(),
          studentApi.getEnrolledCourses(),
          progressApi.getDashboardKPI(),
        ]);

        let progressList = [];
        if (progressRes.status === "fulfilled" && progressRes.value?.data?.data) {
          progressList = progressRes.value.data.data;
          setProgress(progressList);
        }

        let activityList = [];
        if (activityRes.status === "fulfilled" && activityRes.value?.data?.data) {
          activityList = activityRes.value.data.data;
          setActivities(activityList);
        }

        let attendanceData = {
          summary: { total_days: 0, present: 0, absent: 0 },
          records: [],
        };
        if (attendanceRes.status === "fulfilled" && attendanceRes.value?.data?.data) {
          attendanceData = attendanceRes.value.data.data;
          setAttendance(attendanceData);
        }

        let aiData = [];
        if (aiRes.status === "fulfilled" && aiRes.value?.data?.data) {
          aiData = aiRes.value.data.data;
          setAiHistory(aiData);
        }

        let coursesCount = 0;
        if (coursesRes.status === "fulfilled" && coursesRes.value?.data?.data) {
          const cData = coursesRes.value.data.data;
          if (Array.isArray(cData)) {
            coursesCount = cData.length;
          } else if (cData.purchased_courses?.courses) {
            coursesCount = cData.purchased_courses.courses.length;
          } else {
            coursesCount = cData.courses?.length || 0;
          }
        }

        let kpiData = {
          totalLessons: 0,
          completedLessons: 0,
          incompleteLessons: 0,
          inProgressLessons: 0,
          notStartedLessons: 0,
          totalModules: 0,
          completedModules: 0,
          pendingModules: 0,
          moduleBreakdown: {
            video: { completed: 0, total: 0 },
            audio: { completed: 0, total: 0 },
            text: { completed: 0, total: 0 },
            exercise: { completed: 0, total: 0 },
            vocabulary: { completed: 0, total: 0 },
          },
        };
        if (kpiRes.status === "fulfilled" && kpiRes.value?.data?.data) {
          kpiData = kpiRes.value.data.data;
        }

        // Calculate attendance rate
        const totalDays = attendanceData.summary?.total_days || 0;
        const presentDays = attendanceData.summary?.present || 0;
        const attendanceRate =
          totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

        // Calculate learning streak from attendance records
        let streak = 0;
        const presentDates = new Set(
          (attendanceData.records || [])
            .filter((r) => r.status === "present")
            .map((r) => new Date(r.date).toDateString())
        );

        let checkDate = new Date();
        checkDate.setHours(0, 0, 0, 0);
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

        setStatsData({
          // Previously "|| 1" here forced the card to read at least "1"
          // even when the student had 0 enrolled courses / 0-day streak,
          // faking data that didn't exist. Show the real counts instead.
          enrolledCourses: coursesCount,
          aiInteractions: aiData.length,
          attendanceRate,
          streakDays: streak,
          pendingModules: kpiData.pendingModules,
          totalLessons: kpiData.totalLessons,
          completedLessons: kpiData.completedLessons,
          incompleteLessons: kpiData.incompleteLessons,
          inProgressLessons: kpiData.inProgressLessons,
          notStartedLessons: kpiData.notStartedLessons,
          moduleBreakdown: kpiData.moduleBreakdown,
        });

      } catch (err) {
        console.error("Error loading student dashboard details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [isDemoMode, reloadTrigger]);

  // 2. Load Rich Mockup/Dummy Dataset
  const loadDummyData = () => {
    setLoading(true);
    setTimeout(() => {
      const dummyProgress = [
        { module_type: "audio", is_completed: true, score: 85, progress_percentage: 100, subtopic: { title: "Daily Greeting Dialogues" }, subtopic_id: "dummy1" },
        { module_type: "audio", is_completed: true, score: 90, progress_percentage: 100, subtopic: { title: "Asking for Directions" }, subtopic_id: "dummy2" },
        { module_type: "audio", is_completed: true, score: 80, progress_percentage: 100, subtopic: { title: "Restaurant Ordering" }, subtopic_id: "dummy3" },
        { module_type: "audio", is_completed: false, score: 0, progress_percentage: 45, subtopic: { title: "Job Interview Practice" }, subtopic_id: "dummy4" },
        { module_type: "video", is_completed: true, score: 95, progress_percentage: 100, subtopic: { title: "Introduction to English Phonetics" }, subtopic_id: "dummy5" },
        { module_type: "video", is_completed: true, score: 90, progress_percentage: 100, subtopic: { title: "Understanding Accents" }, subtopic_id: "dummy6" },
        { module_type: "video", is_completed: false, score: 0, progress_percentage: 60, subtopic: { title: "Formal Presentation Basics" }, subtopic_id: "dummy7" },
        { module_type: "text", is_completed: true, score: 80, progress_percentage: 100, subtopic: { title: "Reading: Business Emails" }, subtopic_id: "dummy8" },
        { module_type: "text", is_completed: true, score: 85, progress_percentage: 100, subtopic: { title: "Reading: News Articles" }, subtopic_id: "dummy9" },
        { module_type: "exercise", is_completed: true, score: 75, progress_percentage: 100, subtopic: { title: "Quiz: Present Perfect Tense" }, subtopic_id: "dummy10" },
        { module_type: "exercise", is_completed: false, score: 0, progress_percentage: 20, subtopic: { title: "Quiz: Conditional Sentences" }, subtopic_id: "dummy11" },
        { module_type: "vocabulary", is_completed: true, score: 82, progress_percentage: 100, subtopic: { title: "Vocab: Business Terms" }, subtopic_id: "dummy12" },
        { module_type: "vocabulary", is_completed: true, score: 88, progress_percentage: 100, subtopic: { title: "Vocab: Travel Terms" }, subtopic_id: "dummy13" },
        { module_type: "vocabulary", is_completed: false, score: 0, progress_percentage: 10, subtopic: { title: "Vocab: Academic Phrases" }, subtopic_id: "dummy14" },
      ];

      const dummyActivities = [
        { activity_type: "ai_query", module_type: "audio", time_spent_sec: 120, logged_at: new Date().toISOString() },
        { activity_type: "audio_complete", module_type: "audio", time_spent_sec: 340, logged_at: new Date().toISOString() },
        { activity_type: "attendance_marked", time_spent_sec: 0, logged_at: new Date().toISOString() },
        { activity_type: "video_complete", module_type: "video", time_spent_sec: 600, logged_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
        { activity_type: "ai_query", module_type: "text", time_spent_sec: 80, logged_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
        { activity_type: "exercise_complete", module_type: "exercise", time_spent_sec: 450, logged_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
        { activity_type: "attendance_marked", time_spent_sec: 0, logged_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
        { activity_type: "vocabulary_complete", module_type: "vocabulary", time_spent_sec: 200, logged_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
        { activity_type: "attendance_marked", time_spent_sec: 0, logged_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
        { activity_type: "audio_complete", module_type: "audio", time_spent_sec: 400, logged_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
        { activity_type: "attendance_marked", time_spent_sec: 0, logged_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString() },
      ];

      const dummyAttendance = {
        summary: { total_days: 15, present: 14, absent: 1 },
        records: [
          { date: new Date().toISOString(), status: "present" },
          { date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), status: "present" },
          { date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), status: "present" },
          { date: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), status: "present" },
          { date: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), status: "present" },
          { date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), status: "absent" },
          { date: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), status: "present" },
          { date: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), status: "present" },
        ]
      };

      setProgress(dummyProgress);
      setActivities(dummyActivities);
      setAttendance(dummyAttendance);
      setStatsData({
        enrolledCourses: 3,
        aiInteractions: 42,
        attendanceRate: 93,
        streakDays: 5,
        pendingModules: dummyProgress.filter(p => !p.is_completed).length,
        totalLessons: 14,
        completedLessons: 10,
        incompleteLessons: 4,
        inProgressLessons: 3,
        notStartedLessons: 1,
        moduleBreakdown: {
          video: { completed: 2, total: 3 },
          audio: { completed: 3, total: 3 },
          text: { completed: 2, total: 2 },
          exercise: { completed: 2, total: 3 },
          vocabulary: { completed: 1, total: 3 },
        },
      });
      setLoading(false);
    }, 400);
  };

  // 3. Toggle Demo Mode button click
  const toggleDemoMode = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setReloadTrigger(prev => prev + 1); // trigger reload fetch from live API
    } else {
      setIsDemoMode(true);
      loadDummyData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-base font-bold text-slate-500 animate-pulse">
          {isDemoMode ? "Generating Demo Records..." : "Syncing Learning Records..."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900 overflow-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:32px_32px] opacity-80" />

        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-300/10 via-orange-200/10 to-transparent blur-[100px]"
        />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 -left-20 h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-emerald-300/10 via-teal-200/10 to-transparent blur-[90px]"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-10">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-sm font-bold uppercase tracking-widest text-slate-400 shadow-sm mb-2">
              ✦ English Learning Dashboard
            </span>

            <h1 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
              Welcome Back,
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
                {" "}Language Learner 👋
              </span>
            </h1>

            <p className="mt-1 text-base font-medium text-slate-500">
              Check your visual stats and take smart study actions below.
            </p>
          </div>

          {/* Action Row containing Demo toggle and Coach status */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Demo/dummy data toggle disabled — page always shows the
                learner's real (original/live) dashboard data now.
            <button
              onClick={toggleDemoMode}
              className={`rounded-2xl px-4 py-2 text-sm font-black transition-all duration-200 shadow-sm border cursor-pointer ${isDemoMode
                ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                }`}
            >
              {isDemoMode ? "⚡ Restore Live Data" : "📊 Fill Demo Data"}
            </button>
            */}
            {/*
            <div className="flex items-center gap-2 rounded-2xl border border-white bg-white/80 p-2.5 shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-black text-slate-600 uppercase tracking-wide">
                AI Coach Connected
              </span>
            </div> */}
          </div>
        </div>

        {/* Dynamic Counter Statistics Card Row */}
        <DashboardStats statsData={statsData} />

        {/* Dynamic Charts Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Main Visual: Study Time Analysis */}
          <div className="lg:col-span-2 h-full">
            <WeeklyConsistency activities={activities} attendance={attendance} />
          </div>

          {/* Side Widget: Attendance Donut Ring */}
          <div className="lg:col-span-1 h-full">
            <AttendanceWidget attendance={attendance} />
          </div>

        </div>

        {/* Skill Radar Map and Recommendation Hub */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Skill Radar Chart */}
          <div className="lg:col-span-1 h-full">
            <SkillRadarChart progress={progress} />
          </div>

          {/* AI Decision Recommendations & Weak Spot Revise Hub */}
          <div className="lg:col-span-2 h-full">
            <RecommendationHub progress={progress} moduleBreakdown={statsData.moduleBreakdown} />
          </div>

        </div>

        {/* Recent timeline logs and goal settings */}
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Real activity logger */}
          <div className="lg:col-span-2 h-full">
            <RecentActivity activitiesData={activities} />
          </div>

          {/* Overall Score Gauge Widget */}
          <div className="lg:col-span-1 h-full">
            <OverallScoreGauge progress={progress} />
          </div>

        </div>

      </div>
    </div>
  );
}