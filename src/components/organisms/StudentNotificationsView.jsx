"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaBell, FaCheck, FaTrashAlt, FaCheckDouble } from "react-icons/fa";
import {
  Video,
  Headphones,
  FileText,
  ClipboardCheck,
  BookOpen,
  FileSpreadsheet,
  ListTodo,
  Info,
  Loader2,
} from "lucide-react";
import { notificationApi } from "@/services/notification/notificationApi";

// Category configurations
const CATEGORY_CONFIG = {
  video: {
    icon: Video,
    iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25",
  },
  audio: {
    icon: Headphones,
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25",
  },
  text: {
    icon: FileText,
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25",
  },
  vocabulary: {
    icon: BookOpen,
    iconBg: "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25",
  },
  exercise: {
    icon: ClipboardCheck,
    iconBg: "bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/25",
  },
  task: {
    icon: ListTodo,
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md shadow-fuchsia-500/25",
  },
  practical_manual: {
    icon: FileSpreadsheet,
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/25",
  },
  system: {
    icon: Info,
    iconBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-md shadow-slate-600/25",
  },
};

// Priority badge colors
const PRIORITY_COLORS = {
  incomplete: "bg-amber-50 text-amber-700 border-amber-200",
  resubmit: "bg-rose-50 text-rose-700 border-rose-200",
  results: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

// Friendly relative time formatter
function formatTimeAgo(dateString) {
  if (!dateString) return "Recently";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSec = Math.floor((now - past) / 1000);

  if (diffInSec < 60) return "Just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHrs = Math.floor(diffInMin / 60);
  if (diffInHrs < 24) return `${diffInHrs}h ago`;
  const diffInDays = Math.floor(diffInHrs / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StudentNotificationsView() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    incomplete: 0,
    resubmit: 0,
    results: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch notifications from backend API
  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationApi.getNotifications({
        priority: activeTab,
        limit: 50,
      });

      if (res.data?.success) {
        setNotifications(res.data.data?.notifications || []);
        if (res.data.data?.tab_counts) {
          setTabCounts(res.data.data.tab_counts);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    let ignore = false;

    notificationApi
      .getNotifications({ priority: activeTab, limit: 50 })
      .then((res) => {
        if (!ignore && res.data?.success) {
          setNotifications(res.data.data?.notifications || []);
          if (res.data.data?.tab_counts) {
            setTabCounts(res.data.data.tab_counts);
          }
        }
      })
      .catch((err) => {
        if (!ignore) console.error("Error fetching notifications:", err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  // Mark a single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Dismiss / delete notification
  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      // Refresh tab counts
      loadNotifications();
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const tabs = [
    { key: "all", label: "All", count: tabCounts.all },
    { key: "incomplete", label: "Incomplete", count: tabCounts.incomplete },
    { key: "resubmit", label: "Resubmit", count: tabCounts.resubmit },
    { key: "results", label: "Results", count: tabCounts.results },
    { key: "completed", label: "Completed", count: tabCounts.completed },
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
              <p className="text-xs text-slate-500 mt-0.5">
                Stay updated with your latest assignments, teacher reviews, and learning activities.
              </p>
            </div>
          </div>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FaCheckDouble className="text-orange-500 text-xs" />
            <span>Mark all as read</span>
          </button>
        )}
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
        {loading ? (
          <div className="py-20 text-center bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-orange-500 mb-3" size={32} />
            <p className="text-xs font-bold text-slate-500">Loading notifications...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
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
                  {activeTab === "all"
                    ? "You are completely caught up! New updates will appear here."
                    : `There are currently no "${activeTab}" notifications.`}
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
              notifications.map((notif) => {
                const categoryConfig =
                  CATEGORY_CONFIG[notif.category] || CATEGORY_CONFIG.system;
                const IconComponent = categoryConfig.icon;
                const priorityColor =
                  PRIORITY_COLORS[notif.priority?.toLowerCase()] ||
                  PRIORITY_COLORS.info;

                return (
                  <motion.div
                    key={notif._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`group relative flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                      notif.is_read
                        ? "bg-white border-slate-200/80 hover:border-slate-300"
                        : "bg-orange-50/20 border-orange-200/70 shadow-sm hover:border-orange-300"
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!notif.is_read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-orange-500" />
                    )}

                    {/* Module Icon in Squircle Gradient Container */}
                    <div
                      className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl ${categoryConfig.iconBg}`}
                    >
                      <IconComponent size={22} className="text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${priorityColor}`}
                        >
                          {notif.priority}
                        </span>
                        <span className="text-xs font-medium text-slate-400">
                          • {notif.type} • {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-bold ${
                          notif.is_read ? "text-slate-700" : "text-slate-900"
                        }`}
                      >
                        {notif.title}
                      </h3>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.description}
                      </p>

                      {/* Action buttons & links */}
                      <div className="flex flex-wrap items-center gap-3 mt-3.5 pt-2 border-t border-slate-100">
                        {notif.action_url && (
                          <Link
                            href={notif.action_url}
                            onClick={() => !notif.is_read && handleMarkAsRead(notif._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-orange-600 rounded-xl transition-all shadow-sm"
                          >
                            {notif.action_label || "View Details"}
                            <span className="text-[10px]">→</span>
                          </Link>
                        )}

                        {!notif.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Mark as read"
                          >
                            <FaCheck className="text-[10px] text-emerald-600" />
                            <span>Mark read</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDeleteNotification(notif._id, e)}
                          className="ml-auto opacity-0 group-hover:opacity-100 inline-flex items-center p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Dismiss notification"
                        >
                          <FaTrashAlt size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
