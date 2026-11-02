"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaBell } from "react-icons/fa";
import {
  Video,
  Headphones,
  FileText,
  ClipboardCheck,
  BookOpen,
  FileSpreadsheet,
  ListTodo,
} from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Speaking Exercises: Everyday English Conversation",
    description:
      "4 practice exercises pending in Everyday English Conversation. Practice interactive speaking, vowel pronunciation, and dialogue drills.",
    category: "exercise",
    type: "Exercise",
    timestamp: "10 minutes ago",
    isRead: false,
    priority: "Incomplete",
    priorityColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: ClipboardCheck,
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/25",
    actionUrl: "/dashboard/topics?courseId=6a82c9fd35745e2e52e70622&courseName=Everyday%20English%20Conversation&type=exercise",
    actionLabel: "Practice Exercises",
  },
  {
    id: "notif-2",
    title: "AI Fluency & Evaluation Results: Exercise 01",
    description:
      "Your automated AI pronunciation and intonation scoring for Everyday English Conversation has been published. Overall accuracy: 94% (CEFR B2+).",
    category: "exercise",
    type: "Exercise",
    timestamp: "45 minutes ago",
    isRead: false,
    priority: "Results",
    priorityColor: "bg-violet-50 text-violet-700 border-violet-200",
    icon: ClipboardCheck,
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/25",
    actionUrl: "/dashboard/topics?courseId=6a82c9fd35745e2e52e70622&courseName=Everyday%20English%20Conversation&type=exercise",
    actionLabel: "View Results",
  },
  {
    id: "notif-3",
    title: "Interactive Video Lesson: Greeting & Introduction",
    description:
      "1 interactive video lesson available in Everyday English Conversation. Watch situational dialogue examples and study conversational body language.",
    category: "video",
    type: "Video",
    timestamp: "2 hours ago",
    isRead: false,
    priority: "Incomplete",
    priorityColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Video,
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25",
    actionUrl: "/dashboard/topics?courseId=6a82c9fd35745e2e52e70622&courseName=Everyday%20English%20Conversation&type=video",
    actionLabel: "Watch Video",
  },
  {
    id: "notif-4",
    title: "Listening Comprehension: Native Speaker Audio",
    description:
      "1 listening practice session ready in Everyday English Conversation. Improve listening skills and master natural rhythm with native speech clips.",
    category: "audio",
    type: "Audio",
    timestamp: "4 hours ago",
    isRead: false,
    priority: "Incomplete",
    priorityColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Headphones,
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25",
    actionUrl: "/dashboard/topics?courseId=6a82c9fd35745e2e52e70622&courseName=Everyday%20English%20Conversation&type=audio",
    actionLabel: "Listen Audio",
  },
  {
    id: "notif-5",
    title: "Reading Materials: Everyday Expressions & Idioms",
    description:
      "Completed reading learning materials for Everyday English Conversation. Conversational phrases and grammar reference notes verified.",
    category: "text",
    type: "Text",
    timestamp: "Yesterday",
    isRead: true,
    priority: "Completed",
    priorityColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: FileText,
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25",
    actionUrl: "/dashboard/topics?courseId=6a82c9fd35745e2e52e70622&courseName=Everyday%20English%20Conversation&type=text",
    actionLabel: "Read Material",
  },
  {
    id: "notif-6",
    title: "Vocabulary Builder: Everyday Situations Flashcards",
    description:
      "1 vocabulary set ready in Everyday English Conversation. Learn new high-frequency words and build lexical resource with flashcards.",
    category: "vocabulary",
    type: "Vocabulary",
    timestamp: "Yesterday",
    isRead: true,
    priority: "Incomplete",
    priorityColor: "bg-amber-50 text-amber-700 border-amber-200",
    icon: BookOpen,
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25",
    actionUrl: "/dashboard/topics?courseId=6a82c9fd35745e2e52e70622&courseName=Everyday%20English%20Conversation&type=vocabulary",
    actionLabel: "Learn Words",
  },
  {
    id: "notif-7",
    title: "Institute Task: Casual Telephone Conversation Audio",
    description:
      "Instructor review: Excessive background noise flagged in question 2. Please re-record clean audio and resubmit your assignment.",
    category: "task",
    type: "Task",
    timestamp: "2 days ago",
    isRead: true,
    priority: "Resubmit",
    priorityColor: "bg-rose-50 text-rose-700 border-rose-200",
    icon: ListTodo,
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md shadow-fuchsia-500/25",
    actionUrl: "/dashboard/topics?courseId=6a82c9fd35745e2e52e70622&courseName=Everyday%20English%20Conversation&type=task",
    actionLabel: "Resubmit Task",
  },
  {
    id: "notif-8",
    title: "Practical Manual: Lab Experiment 01 - Speech Articulation",
    description:
      "Your hands-on practical lab guide submission for Everyday English Conversation has been approved and graded by your lab instructor.",
    category: "practical_manual",
    type: "Practical Manual",
    timestamp: "3 days ago",
    isRead: true,
    priority: "Completed",
    priorityColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: FileSpreadsheet,
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/25",
    actionUrl: "/dashboard/topics?courseId=6a82c9fd35745e2e52e70622&courseName=Everyday%20English%20Conversation&type=practical_manual",
    actionLabel: "View Manual",
  },
];

export default function StudentNotificationsView() {
  const [activeTab, setActiveTab] = useState("all");

  // Filter logic based on priority tabs
  const filteredNotifications = INITIAL_NOTIFICATIONS.filter((item) => {
    if (activeTab === "all") return true;
    return item.priority.toLowerCase() === activeTab.toLowerCase();
  });

  const tabs = [
    { key: "all", label: "All", count: INITIAL_NOTIFICATIONS.length },
    {
      key: "incomplete",
      label: "Incomplete",
      count: INITIAL_NOTIFICATIONS.filter(
        (n) => n.priority.toLowerCase() === "incomplete"
      ).length,
    },
    {
      key: "resubmit",
      label: "Resubmit",
      count: INITIAL_NOTIFICATIONS.filter(
        (n) => n.priority.toLowerCase() === "resubmit"
      ).length,
    },
    {
      key: "results",
      label: "Results",
      count: INITIAL_NOTIFICATIONS.filter(
        (n) => n.priority.toLowerCase() === "results"
      ).length,
    },
    {
      key: "completed",
      label: "Completed",
      count: INITIAL_NOTIFICATIONS.filter(
        (n) => n.priority.toLowerCase() === "completed"
      ).length,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
              <FaBell className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Notifications
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls: Priority Filter Tabs ──────────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Notifications List ─────────────────────────────────── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-16 text-center bg-white border border-dashed border-slate-200 rounded-3xl p-8"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <FaBell className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-slate-700">
                No notifications found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {`There are currently no "${activeTab}" notifications.`}
              </p>
              {activeTab !== "all" && (
                <button
                  onClick={() => setActiveTab("all")}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all cursor-pointer"
                >
                  View all notifications
                </button>
              )}
            </motion.div>
          ) : (
            filteredNotifications.map((notif) => {
              const IconComponent = notif.icon;
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                    notif.isRead
                      ? "bg-white border-slate-200/80 hover:border-slate-300"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  {/* Module Icon in Squircle Gradient Container */}
                  <div
                    className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl ${notif.iconBg}`}
                  >
                    <IconComponent size={22} className="text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${notif.priorityColor}`}
                      >
                        {notif.priority}
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        • {notif.type} • {notif.timestamp}
                      </span>
                    </div>

                    <h3
                      className={`text-sm font-bold ${
                        notif.isRead ? "text-slate-700" : "text-slate-900 "
                      }`}
                    >
                      {notif.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.description}
                    </p>

                    {/* Action buttons & links */}
                    <div className="flex flex-wrap items-center gap-3 mt-3.5 pt-2 border-t border-slate-100">
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-orange-600 rounded-xl transition-all shadow-sm"
                        >
                          {notif.actionLabel || "View Details"}
                          <span className="text-[10px]">→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
