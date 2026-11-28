"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaComments,
  FaPaperPlane,
  FaSearch,
  FaUserGraduate,
  FaCheckDouble,
  FaCircle,
  FaLightbulb,
  FaSignOutAlt,
  FaExclamationTriangle,
  FaArrowRight,
  FaTimes,
  FaLock,
  FaUserFriends,
} from "react-icons/fa";
import { studentApi } from "@/services/student/studentApi";

const SUGGESTED_PROMPTS = [
  "👋 Hello! Ready to practice today's conversation dialogue?",
  "Hi! How was your pronunciation score on the last speaking task?",
  "Let's practice the oral fluency exercise together!",
  "Are you preparing for the English module assessment?",
];

export default function ConversationLabView() {
  const [loading, setLoading] = useState(true);
  const [batchInfo, setBatchInfo] = useState({ segment: "", year: null });
  const [students, setStudents] = useState([]);
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [currentStudentName, setCurrentStudentName] = useState("You");
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'available' | 'busy' | 'offline'

  // Active exclusive 1-on-1 session: null when in directory, object when in chat
  // shape: { sessionId, partner: { _id, full_name, roll_no, enrollment_no, profilePhoto, last_seen_at }, startedAt }
  const [activeSession, setActiveSession] = useState(null);

  // Chat messages for current active session
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modals & alerts
  const [showEndModal, setShowEndModal] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [partnerEndedNotice, setPartnerEndedNotice] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const activeSessionRef = useRef(null);
  const currentStudentIdRef = useRef(null);
  const chatInputRef = useRef(null);

  // Keep refs synced for timers & event listeners
  useEffect(() => {
    activeSessionRef.current = activeSession;
    if (activeSession) {
      chatInputRef.current?.focus();
    }
  }, [activeSession]);

  useEffect(() => {
    currentStudentIdRef.current = currentStudentId;
  }, [currentStudentId]);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Helper to format timestamps
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Fetch batchmates & check active session ─────────────────────────────────
  const fetchBatchmates = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await studentApi.getBatchmates();
      if (res.data?.success) {
        const data = res.data.data;
        setBatchInfo(data.batch || {});
        const list = data.students || [];

        const myId = data.currentStudentId || null;
        setCurrentStudentId(myId);
        currentStudentIdRef.current = myId;

        if (data.currentStudent?.full_name) {
          setCurrentStudentName(data.currentStudent.full_name);
        }

        // Exclude current student
        const peers = list.filter((s) => String(s._id) !== String(myId));
        setStudents(peers);

        // If server reported an active session for the current student
        if (data.myActiveSession && data.myActiveSession.partner) {
          const s = data.myActiveSession;
          setActiveSession({
            sessionId: s.sessionId,
            partner: s.partner,
            initiatorId: s.initiatorId,
            startedAt: s.startedAt,
          });
        } else if (!data.myActiveSession && activeSessionRef.current) {
          // Partner logged out or session ended remotely
          setPartnerEndedNotice(
            activeSessionRef.current.partner?.full_name || "Your partner"
          );
          setActiveSession(null);
          setMessages([]);
        }
      }
    } catch (err) {
      if (!silent) {
        console.error("Failed to fetch batch students:", err);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ── Fetch messages for current active session ───────────────────────────────
  const fetchSessionMessages = useCallback(async (partnerId, sessionId, silent = false) => {
    if (!partnerId) return;
    if (!silent) setLoadingChat(true);

    try {
      const res = await studentApi.getMessages(partnerId, sessionId);
      if (res.data?.success) {
        const payload = res.data.data;
        const rawMsgs = payload.messages || [];
        const sessionMeta = payload.session || null;

        // Check if session was ended remotely
        if (sessionMeta && sessionMeta.status === "ended") {
          const endedByPartner =
            String(sessionMeta.ended_by) !== String(currentStudentIdRef.current);
          if (endedByPartner && activeSessionRef.current) {
            setPartnerEndedNotice(
              activeSessionRef.current.partner?.full_name || "Your partner"
            );
          }
          setActiveSession(null);
          setMessages([]);
          fetchBatchmates(true);
          return;
        }

        const myId = currentStudentIdRef.current;
        const mapped = rawMsgs.map((m) => {
          const senderStr = String(m.sender_id?._id || m.sender_id || "");
          const myIdStr = String(myId || "");
          return {
            id: m._id,
            sender: senderStr,
            text: m.message,
            time: formatTime(m.createdAt),
            isMe: senderStr === myIdStr,
            createdAt: m.createdAt,
          };
        });

        setMessages((prev) => {
          if (prev.length === mapped.length) {
            const lastExistingId = prev[prev.length - 1]?.id;
            const lastNewId = mapped[mapped.length - 1]?.id;
            if (lastExistingId === lastNewId) {
              return prev;
            }
          }
          return mapped;
        });
      }
    } catch (err) {
      if (!silent) {
        console.error("Failed to fetch session messages:", err);
      }
    } finally {
      if (!silent) setLoadingChat(false);
    }
  }, [fetchBatchmates]);

  // ── Initial load & BroadcastChannel ─────────────────────────────────────────
  useEffect(() => {
    fetchBatchmates(false);

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("conversation_lab_sync");
        channelRef.current = channel;

        channel.onmessage = (event) => {
          const payload = event.data;
          if (payload?.type === "SESSION_ENDED") {
            const current = activeSessionRef.current;
            if (current && String(current.sessionId) === String(payload.sessionId)) {
              if (String(payload.ended_by) !== String(currentStudentIdRef.current)) {
                setPartnerEndedNotice(current.partner?.full_name || "Your partner");
              }
              setActiveSession(null);
              setMessages([]);
              fetchBatchmates(true);
            } else {
              // Refresh batchmates directory statuses
              fetchBatchmates(true);
            }
          } else if (payload?.type === "NEW_MESSAGE") {
            const current = activeSessionRef.current;
            if (
              current &&
              String(current.sessionId) === String(payload.sessionId)
            ) {
              fetchSessionMessages(current.partner._id, current.sessionId, true);
            }
          } else if (payload?.type === "SESSION_STARTED") {
            // Someone started a session; update directory statuses
            fetchBatchmates(true);
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel restricted or not supported:", e);
      }
    }

    return () => {
      channelRef.current?.close();
    };
  }, [fetchBatchmates, fetchSessionMessages]);

  // ── Polling loops ────────────────────────────────────────────────────────────
  // When in Directory view: poll batchmates every 4 seconds to reflect dynamic availability
  useEffect(() => {
    if (activeSession) return;
    const interval = setInterval(() => {
      fetchBatchmates(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeSession, fetchBatchmates]);

  // When in Active Session view: poll messages & session status every 1.5 seconds
  useEffect(() => {
    if (!activeSession?.partner?._id) return;

    fetchSessionMessages(activeSession.partner._id, activeSession.sessionId, false);

    const interval = setInterval(() => {
      if (activeSessionRef.current?.partner?._id) {
        fetchSessionMessages(
          activeSessionRef.current.partner._id,
          activeSessionRef.current.sessionId,
          true
        );
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeSession?.partner?._id, activeSession?.sessionId, fetchSessionMessages]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // ── Start Conversation Session ──────────────────────────────────────────────
  const handleStartSession = async (partner) => {
    setErrorMessage(null);
    setActionLoadingId(partner._id);

    try {
      const res = await studentApi.startConversationSession(partner._id);
      if (res.data?.success) {
        const session = res.data.data.session;
        setActiveSession({
          sessionId: session._id,
          partner: session.partner || partner,
          initiatorId: session.initiator_id,
          startedAt: session.startedAt,
        });
        setMessages([]);

        // Notify other open tabs/peers
        channelRef.current?.postMessage({
          type: "SESSION_STARTED",
          sessionId: session._id,
          partner_id: partner._id,
        });

        // Immediately fetch existing chat history for this partner
        fetchSessionMessages(partner._id, session._id, false);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not start conversation session. Please try again.";
      setErrorMessage(msg);
      // Refresh directory to reflect latest statuses
      fetchBatchmates(true);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── End Conversation Session ────────────────────────────────────────────────
  const handleEndSession = async () => {
    if (!activeSession) return;
    setIsEndingSession(true);

    try {
      const sessionId = activeSession.sessionId;
      const res = await studentApi.endConversationSession(sessionId);

      if (res.data?.success) {
        // Broadcast session end so partner sees notification immediately
        channelRef.current?.postMessage({
          type: "SESSION_ENDED",
          sessionId,
          ended_by: currentStudentId,
        });

        setActiveSession(null);
        setMessages([]);
        setShowEndModal(false);
        fetchBatchmates(true);
      }
    } catch (err) {
      console.error("Failed to end session:", err);
      // Fallback: exit locally anyway
      setActiveSession(null);
      setMessages([]);
      setShowEndModal(false);
      fetchBatchmates(true);
    } finally {
      setIsEndingSession(false);
    }
  };

  // ── Send Message ────────────────────────────────────────────────────────────
  const handleSendMessage = async (e, directText = null) => {
    e?.preventDefault();
    const textToSend = (directText !== null ? directText : inputValue).trim();
    if (!textToSend || !activeSession || isSending) return;

    const partnerId = activeSession.partner._id;
    const sessionId = activeSession.sessionId;
    const now = formatTime(new Date());

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sender: currentStudentId,
      text: textToSend,
      time: now,
      isMe: true,
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    if (directText === null) {
      setInputValue("");
    }
    chatInputRef.current?.focus();
    setIsSending(true);

    try {
      const res = await studentApi.sendMessage(partnerId, textToSend, sessionId);
      if (res.data?.success) {
        const saved = res.data.data;

        channelRef.current?.postMessage({
          type: "NEW_MESSAGE",
          sessionId,
          sender_id: currentStudentId,
          receiver_id: partnerId,
          messageId: saved._id,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                id: saved._id,
                sender: saved.sender_id,
                text: saved.message,
                time: formatTime(saved.createdAt),
                isMe: true,
                pending: false,
              }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove failed optimistic msg or show alert
      const errMsg = err.response?.data?.message || "Failed to send message";
      if (err.response?.status === 400 && errMsg.includes("ended")) {
        setPartnerEndedNotice(activeSession.partner.full_name);
        setActiveSession(null);
        setMessages([]);
        fetchBatchmates(true);
      }
    } finally {
      setIsSending(false);
      scrollToBottom();
      chatInputRef.current?.focus();
    }
  };

  // ── Filtered & Sorted Students List ──────────────────────────────────────────
  // Priority: available (online) first, then busy (in conversation), then offline
  const STATUS_PRIORITY = {
    available: 1,
    busy: 2,
    offline: 3,
  };

  const filteredStudents = students
    .filter((s) => {
      // Search query match
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          s.full_name?.toLowerCase().includes(q) ||
          s.roll_no?.toLowerCase().includes(q) ||
          s.enrollment_no?.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Tab filter
      if (filterTab === "all") return true;
      if (filterTab === "available") return s.chatStatus === "available";
      if (filterTab === "busy") return s.chatStatus === "busy";
      if (filterTab === "offline") return s.chatStatus === "offline";
      return true;
    })
    .sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.chatStatus] || 99;
      const priorityB = STATUS_PRIORITY[b.chatStatus] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // Secondary sort: alphabetical by full name
      return (a.full_name || "").localeCompare(b.full_name || "");
    });

  const availableCount = students.filter((s) => s.chatStatus === "available").length;
  const busyCount = students.filter((s) => s.chatStatus === "busy").length;
  const offlineCount = students.filter((s) => s.chatStatus === "offline").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* ── Top Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#800020] to-[#500014] text-white shadow-md shadow-[#800020]/25">
            <FaComments className="text-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Conversation Lab
              </h1>
              {batchInfo.segment && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#800020] border border-rose-200">
                  {batchInfo.segment}{" "}
                  {batchInfo.year ? `• Year ${batchInfo.year}` : ""}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              1-on-1 English dialogue practice with your classmates
            </p>
          </div>
        </div>

        {/* Current user badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">
            Logged in as:{" "}
            <span className="text-[#800020]">{currentStudentName}</span>
          </span>
        </div>
      </div>

      {/* ── Error Banner (if any) ─────────────────────────────────── */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-[#800020] font-medium">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-rose-600 text-sm shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-100 rounded-lg transition-all"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── VIEW 1: ACTIVE SINGLE-CHAT ROOM ────────────────────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      {activeSession ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-210px)] min-h-[580px]">
          {/* Active Chat Header */}
          <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-white to-slate-50/40">
            <div className="flex items-center gap-3">
              {/* Partner Avatar */}
              <div className="relative">
                {activeSession.partner.profilePhoto ? (
                  <div className="relative h-11 w-11">
                    <Image
                      src={activeSession.partner.profilePhoto}
                      alt={activeSession.partner.full_name}
                      fill
                      className="rounded-2xl object-cover border border-slate-200"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#800020] to-[#500014] text-white font-bold text-base shadow-sm">
                    {activeSession.partner.full_name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white bg-emerald-500" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {activeSession.partner.full_name}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Session
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  {activeSession.partner.roll_no && (
                    <span>Roll: {activeSession.partner.roll_no}</span>
                  )}
                  {activeSession.partner.enrollment_no && (
                    <span className="font-mono text-slate-400">
                      • {activeSession.partner.enrollment_no}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* End Conversation Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEndModal(true)}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-[#800020] border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <FaSignOutAlt className="text-xs" />
                <span>End Conversation</span>
              </button>
            </div>
          </div>

          {/* Active Chat Messages Timeline */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
            <div className="text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 py-1 bg-white border border-slate-200 rounded-full shadow-2xs">
                1-on-1 Practice Session • {formatTime(activeSession.startedAt)}
              </span>
            </div>

            {loadingChat && messages.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#800020] border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              /* Starter prompts box when session just began */
              <div className="max-w-md mx-auto my-6 p-6 bg-white border border-rose-100 rounded-3xl shadow-sm text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-[#800020] flex items-center justify-center mx-auto">
                  <FaLightbulb className="text-xl" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Start speaking with {activeSession.partner.full_name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Send a dialogue opener or tap a suggested prompt to get started:
                  </p>
                </div>

                <div className="space-y-1.5 pt-2">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(null, prompt)}
                      className="w-full text-left text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-[#800020] border border-slate-200/80 hover:border-rose-200 text-slate-700 font-medium transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span className="truncate">{prompt}</span>
                      <FaPaperPlane className="text-[10px] text-slate-300 group-hover:text-[#800020] shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"
                    }`}
                >
                  <div
                    className={`max-w-[78%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${msg.isMe
                      ? "bg-gradient-to-r from-[#800020] to-[#5a0016] !text-white rounded-tr-sm"
                      : "bg-white !text-slate-800 border border-slate-200/90 rounded-tl-sm"
                      }`}
                  >
                    <p
                      className={
                        msg.isMe
                          ? "!text-white font-medium"
                          : "!text-slate-800"
                      }
                    >
                      {msg.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">
                      {msg.time}
                    </span>
                    {msg.isMe && (
                      <FaCheckDouble
                        className={`text-[9px] ${msg.pending ? "text-slate-300" : "text-[#800020]"
                          }`}
                      />
                    )}
                  </div>
                </motion.div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => handleSendMessage(e)}
            className="p-3.5 px-5 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={chatInputRef}
              type="text"
              placeholder={`Message ${activeSession.partner.full_name}...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all text-slate-800 placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isSending}
              className="h-10 w-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#800020] to-[#500014] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md hover:shadow-[#800020]/25 transition-all cursor-pointer"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────── */
        /* ── VIEW 2: AVAILABLE CLASSMATES DIRECTORY ───────────────── */
        /* ──────────────────────────────────────────────────────────── */
        <div className="space-y-4">
          {/* Controls Bar: Search & Status Filter Tabs */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search classmates by name or roll no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setFilterTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === "all"
                  ? "bg-[#800020] text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                All ({students.length})
              </button>

              <button
                onClick={() => setFilterTab("available")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterTab === "available"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                  }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Available ({availableCount})
              </button>

              <button
                onClick={() => setFilterTab("busy")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterTab === "busy"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                  }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                In Conversation ({busyCount})
              </button>

              <button
                onClick={() => setFilterTab("offline")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${filterTab === "offline"
                  ? "bg-slate-700 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Offline ({offlineCount})
              </button>
            </div>
          </div>

          {/* Students Directory Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="p-5 rounded-3xl bg-white border border-slate-200 animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-slate-100 rounded" />
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="h-9 w-full bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-rose-50 text-[#800020] flex items-center justify-center mx-auto">
                <FaUserFriends className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No classmates found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search
                  ? "Try adjusting your search criteria to find batchmates."
                  : "No students matching this filter category."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((st) => {
                const isAvailable = st.chatStatus === "available";
                const isBusy = st.chatStatus === "busy";
                const isOffline = st.chatStatus === "offline";
                const isActionLoading = actionLoadingId === st._id;

                return (
                  <div
                    key={st._id}
                    className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Student Info Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {st.profilePhoto ? (
                            <div className="relative h-12 w-12">
                              <Image
                                src={st.profilePhoto}
                                alt={st.full_name}
                                fill
                                className="rounded-2xl object-cover border border-slate-200"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#800020] to-[#500014] text-white font-bold text-base shadow-sm">
                              {st.full_name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                          )}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white ${isAvailable
                              ? "bg-emerald-500 animate-pulse"
                              : isBusy
                                ? "bg-amber-500"
                                : "bg-slate-300"
                              }`}
                          />
                        </div>

                        {/* Name & Details */}
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {st.full_name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Roll:{" "}
                            <span className="font-semibold text-slate-700">
                              {st.roll_no || "N/A"}
                            </span>
                          </p>
                          {st.enrollment_no && (
                            <p className="text-[10px] text-slate-400 font-mono truncate">
                              {st.enrollment_no}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isAvailable && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Available
                          </span>
                        )}
                        {isBusy && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            In Conversation
                          </span>
                        )}
                        {isOffline && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1 shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Offline
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      {isAvailable ? (
                        <button
                          onClick={() => handleStartSession(st)}
                          disabled={isActionLoading}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#800020] to-[#600018] hover:from-[#900024] hover:to-[#70001c] text-white font-bold text-xs shadow-sm hover:shadow-md hover:shadow-[#800020]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isActionLoading ? (
                            <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : (
                            <>
                              <FaComments className="text-xs" />
                              <span>Start Conversation</span>
                              <FaArrowRight className="text-[10px] ml-0.5" />
                            </>
                          )}
                        </button>
                      ) : isBusy ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                        >
                          <FaLock className="text-[10px]" />
                          <span>Currently in Conversation</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <FaCircle className="text-[6px] text-slate-300" />
                          <span>Offline</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── MODAL: CONFIRM END CONVERSATION ──────────────────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEndModal && activeSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-xl space-y-4 text-center"
            >
              <div className="h-14 w-14 rounded-2xl bg-rose-50 text-[#800020] flex items-center justify-center mx-auto">
                <FaSignOutAlt className="text-2xl" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  End Conversation?
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Are you sure you want to end your conversation with{" "}
                  <strong className="text-slate-800">
                    {activeSession.partner.full_name}
                  </strong>
                  ? Once ended, both of you will return to the available
                  classmates list and can chat with someone else.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEndModal(false)}
                  disabled={isEndingSession}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleEndSession}
                  disabled={isEndingSession}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#800020] to-[#500014] hover:from-[#900024] hover:to-[#600018] text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-[#800020]/25 flex items-center justify-center gap-2"
                >
                  {isEndingSession ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <span>Yes, End Session</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* ── MODAL: PARTNER ENDED SESSION NOTICE ───────────────────── */}
      {/* ──────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {partnerEndedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-xl space-y-4 text-center"
            >
              <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <FaExclamationTriangle className="text-2xl" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Session Ended
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  <strong className="text-slate-800">{partnerEndedNotice}</strong>{" "}
                  has ended the conversation session. You are now free to start a
                  conversation with another classmate.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setPartnerEndedNotice(null)}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-[#800020] to-[#500014] text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md shadow-[#800020]/25"
                >
                  Return to Classmates
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
