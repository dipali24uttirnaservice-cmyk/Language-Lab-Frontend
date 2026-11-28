"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaBell, FaCheck, FaTrashAlt, FaCheckDouble } from "react-icons/fa";
import {
  FileSpreadsheet,
  ListTodo,
  Info,
  Loader2,
  Users,
  Award,
} from "lucide-react";
import { notificationApi } from "@/services/notification/notificationApi";

const CATEGORY_CONFIG = {
  task: {
    label: "Student Tasks",
    icon: ListTodo,
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md shadow-fuchsia-500/25",
  },
  practical_manual: {
    label: "Practical Manuals",
    icon: FileSpreadsheet,
    iconBg: "bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/25",
  },
  system: {
    label: "System Alerts",
    icon: Info,
    iconBg: "bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-md shadow-slate-600/25",
  },
  default: {
    label: "General",
    icon: Users,
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25",
  },
};

const PRIORITY_COLORS = {
  incomplete: "bg-amber-50 text-amber-700 border-amber-200",
  resubmit: "bg-rose-50 text-rose-700 border-rose-200",
  results: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

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

export default function InstituteNotificationsView() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const params = { limit: 50 };
      if (activeCategory !== "all") {
        params.category = activeCategory;
      }
      const res = await notificationApi.getNotifications(params);

      if (res.data?.success) {
        setNotifications(res.data.data?.notifications || []);
      }
    } catch (err) {
      console.error("Error fetching institute notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    let ignore = false;
    const params = { limit: 50 };
    if (activeCategory !== "all") {
      params.category = activeCategory;
    }

    notificationApi
      .getNotifications(params)
      .then((res) => {
        if (!ignore && res.data?.success) {
          setNotifications(res.data.data?.notifications || []);
        }
      })
      .catch((err) => {
        if (!ignore) console.error("Error fetching institute notifications:", err);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [activeCategory]);

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

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const categories = [
    { key: "all", label: "All Alerts" },
    { key: "task", label: "Tasks" },
    { key: "practical_manual", label: "Practical Manuals" },
    { key: "system", label: "System" },
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
                Institute Notifications & Alerts
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Lab submissions, grading alerts, and system notices for faculty.
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

      {/* ── Controls: Category Tabs ──────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Notifications List ─────────────────────────────────── */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-orange-500 mb-3" size={32} />
            <p className="text-xs font-bold text-slate-500">Loading alerts...</p>
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
                  No alerts right now
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {activeCategory === "all"
                    ? "Everything is running smoothly! Student submissions and alerts will appear here."
                    : `No notifications found under "${activeCategory}".`}
                </p>
              </motion.div>
            ) : (
              notifications.map((notif) => {
                const categoryConfig =
                  CATEGORY_CONFIG[notif.category] || CATEGORY_CONFIG.default;
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
                    {!notif.is_read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-orange-500" />
                    )}

                    <div
                      className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl ${categoryConfig.iconBg}`}
                    >
                      <IconComponent size={22} className="text-white" />
                    </div>

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

                      <div className="flex flex-wrap items-center gap-3 mt-3.5 pt-2 border-t border-slate-100">
                        {notif.action_url && (
                          <Link
                            href={notif.action_url}
                            onClick={() => !notif.is_read && handleMarkAsRead(notif._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-orange-600 rounded-xl transition-all shadow-sm"
                          >
                            {notif.action_label || "Review Now"}
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
                          title="Dismiss alert"
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
