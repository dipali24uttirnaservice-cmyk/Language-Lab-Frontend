"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaComments,
  FaPaperPlane,
  FaSearch,
  FaUserGraduate,
  FaCheckDouble,
  FaArrowLeft,
  FaCircle,
  FaLightbulb,
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

  // Selected student for chat aside
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Chat messages stored per partner student ID
  const [messagesByStudent, setMessagesByStudent] = useState({});
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const selectedStudentRef = useRef(null);
  const currentStudentIdRef = useRef(null);

  // Keep refs in sync for event handlers & timers
  useEffect(() => {
    selectedStudentRef.current = selectedStudent;
  }, [selectedStudent]);

  useEffect(() => {
    currentStudentIdRef.current = currentStudentId;
  }, [currentStudentId]);

  // Auto-scroll chat to bottom
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Helper to check if student was active within the last 15 minutes
  const isRecentlyActive = (lastSeen) => {
    if (!lastSeen) return false;
    const diff = Date.now() - new Date(lastSeen).getTime();
    return diff < 15 * 60 * 1000;
  };

  // Fetch messages with a given partner
  const fetchMessagesForPartner = useCallback(
    async (partnerId, silent = false) => {
      if (!partnerId) return;
      if (!silent) setLoadingChat(true);

      try {
        const res = await studentApi.getMessages(partnerId);
        if (res.data?.success) {
          const raw = res.data.data || [];
          const myId = currentStudentIdRef.current;

          const mapped = raw.map((m) => {
            const senderStr = String(m.sender_id?._id || m.sender_id || "");
            const myIdStr = String(myId || "");
            return {
              id: m._id,
              sender: senderStr,
              text: m.message,
              time: new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isMe: senderStr === myIdStr,
              createdAt: m.createdAt,
            };
          });

          setMessagesByStudent((prev) => {
            const existing = prev[partnerId] || [];
            // Prevent redundant re-renders if nothing changed
            if (existing.length === mapped.length) {
              const lastExistingId = existing[existing.length - 1]?.id;
              const lastNewId = mapped[mapped.length - 1]?.id;
              if (lastExistingId === lastNewId) {
                return prev;
              }
            }
            return {
              ...prev,
              [partnerId]: mapped,
            };
          });
        }
      } catch (err) {
        if (!silent) {
          console.error("Failed to fetch partner messages:", err);
        }
      } finally {
        if (!silent) setLoadingChat(false);
      }
    },
    []
  );

  // Initialize batchmates & BroadcastChannel
  useEffect(() => {
    studentApi
      .getBatchmates()
      .then((res) => {
        if (res.data?.success) {
          const data = res.data.data;
          setBatchInfo(data.batch || {});
          const list = data.students || [];

          const myId = data.currentStudentId || null;
          setCurrentStudentId(myId);
          currentStudentIdRef.current = myId;

          // Resolve logged-in student name
          if (data.currentStudent?.full_name) {
            setCurrentStudentName(data.currentStudent.full_name);
          } else {
            const me = list.find((s) => String(s._id) === String(myId));
            if (me) setCurrentStudentName(me.full_name);
          }

          // Exclude logged-in student so they never appear in their own classmates list
          const peers = list.filter((s) => String(s._id) !== String(myId));
          setStudents(peers);

          // Auto-select first classmate
          if (peers.length > 0) {
            const firstPeer = peers[0];
            setSelectedStudent(firstPeer);
            selectedStudentRef.current = firstPeer;
            fetchMessagesForPartner(firstPeer._id, false);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch batch students:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Cross-tab broadcast channel for instantaneous zero-latency updates
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("conversation_lab_sync");
        channelRef.current = channel;

        channel.onmessage = (event) => {
          const payload = event.data;
          if (payload?.type === "NEW_MESSAGE") {
            const activePartner = selectedStudentRef.current;
            const myId = currentStudentIdRef.current;
            // If the incoming message relates to the active conversation
            if (
              activePartner &&
              (String(payload.sender_id) === String(activePartner._id) ||
                String(payload.receiver_id) === String(activePartner._id) ||
                String(payload.receiver_id) === String(myId))
            ) {
              fetchMessagesForPartner(activePartner._id, true);
            }
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel not supported or restricted:", e);
      }
    }

    return () => {
      channelRef.current?.close();
    };
  }, [fetchMessagesForPartner]);

  // Polling every 1.5 seconds for active partner conversation
  useEffect(() => {
    if (!selectedStudent?._id) return;

    fetchMessagesForPartner(selectedStudent._id, false);

    const interval = setInterval(() => {
      if (selectedStudentRef.current?._id) {
        fetchMessagesForPartner(selectedStudentRef.current._id, true);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedStudent?._id, fetchMessagesForPartner]);

  // Auto-scroll when messages change
  const currentMessages = selectedStudent
    ? messagesByStudent[selectedStudent._id] || []
    : [];

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages.length, selectedStudent]);

  // Handle student selection from list
  const handleSelectStudent = (st) => {
    if (String(st._id) === String(currentStudentId)) return;
    setSelectedStudent(st);
    selectedStudentRef.current = st;
    fetchMessagesForPartner(st._id, false);
  };

  // Send message handler
  const handleSendMessage = async (e, directText = null) => {
    e?.preventDefault();
    const textToSend = (directText !== null ? directText : inputValue).trim();
    if (!textToSend || !selectedStudent || isSending) return;

    const partnerId = selectedStudent._id;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

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

    setMessagesByStudent((prev) => ({
      ...prev,
      [partnerId]: [...(prev[partnerId] || []), optimisticMsg],
    }));

    if (directText === null) {
      setInputValue("");
    }
    setIsSending(true);

    try {
      const res = await studentApi.sendMessage(partnerId, textToSend);
      if (res.data?.success) {
        const saved = res.data.data;

        // Broadcast to other tabs on this machine
        channelRef.current?.postMessage({
          type: "NEW_MESSAGE",
          sender_id: currentStudentId,
          receiver_id: partnerId,
          messageId: saved._id,
        });

        // Replace optimistic msg with real db message
        setMessagesByStudent((prev) => ({
          ...prev,
          [partnerId]: (prev[partnerId] || []).map((m) =>
            m.id === tempId
              ? {
                  id: saved._id,
                  sender: saved.sender_id,
                  text: saved.message,
                  time: new Date(saved.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  isMe: true,
                  pending: false,
                }
              : m
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  // Filter classmates (strictly exclude own profile)
  const filteredStudents = students
    .filter((s) => String(s._id) !== String(currentStudentId))
    .filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.full_name?.toLowerCase().includes(q) ||
        s.roll_no?.toLowerCase().includes(q) ||
        s.enrollment_no?.toLowerCase().includes(q)
      );
    });

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
              Real-time conversational practice with your batchmates (
              {filteredStudents.length} {filteredStudents.length === 1 ? "classmate" : "classmates"})
            </p>
          </div>
        </div>

        {/* Current user badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">
            Logged in as: <span className="text-[#800020]">{currentStudentName}</span>
          </span>
        </div>
      </div>

      {/* ── Main Two-Column Container ─────────────────────────── */}
      <div className="h-[calc(100vh-190px)] min-h-[560px] flex bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* ── LEFT PANE: Students List ──────────────────────────── */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200 flex flex-col h-full bg-slate-50/60 ${
            selectedStudent ? "hidden md:flex" : "flex"
          }`}
        >
          {/* List Header & Search */}
          <div className="p-3.5 border-b border-slate-200 bg-white space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Classmates
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-[#800020]">
                {filteredStudents.length} Total
              </span>
            </div>

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search classmates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800020]/20 focus:border-[#800020] transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Scrollable Students List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-3 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-white border border-slate-100 animate-pulse flex items-center gap-3"
                  >
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-24 bg-slate-100 rounded" />
                      <div className="h-2.5 w-16 bg-slate-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FaUserGraduate className="mx-auto text-2xl mb-2 text-slate-300" />
                <p className="text-xs font-semibold">No classmates found</p>
              </div>
            ) : (
              filteredStudents.map((st) => {
                const isSelected = selectedStudent?._id === st._id;
                const online = isRecentlyActive(st.last_seen_at);
                const initial = st.full_name?.charAt(0)?.toUpperCase() || "S";

                return (
                  <button
                    key={st._id}
                    onClick={() => handleSelectStudent(st)}
                    className={`w-full text-left p-3.5 flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-rose-50/70 border-l-4 border-[#800020]"
                        : "hover:bg-white bg-transparent"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {st.profilePhoto ? (
                        <div className="relative h-10 w-10">
                          <Image
                            src={st.profilePhoto}
                            alt={st.full_name}
                            fill
                            className="rounded-2xl object-cover border border-slate-200"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl font-bold text-xs text-white shadow-sm ${
                            isSelected
                              ? "bg-gradient-to-br from-[#800020] to-[#500014]"
                              : "bg-slate-700"
                          }`}
                        >
                          {initial}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                          online ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-bold truncate ${
                            isSelected ? "text-[#800020]" : "text-slate-800"
                          }`}
                        >
                          {st.full_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                        {st.roll_no && <span>{st.roll_no}</span>}
                        {st.enrollment_no && (
                          <span className="text-slate-400 font-mono">
                            • {st.enrollment_no}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANE: Chat Aside ────────────────────────────── */}
        <div
          className={`flex-1 flex flex-col h-full bg-white ${
            selectedStudent ? "flex" : "hidden md:flex"
          }`}
        >
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 px-5 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  {/* Back button on mobile */}
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-xl"
                  >
                    <FaArrowLeft className="text-sm" />
                  </button>

                  <div className="relative">
                    {selectedStudent.profilePhoto ? (
                      <div className="relative h-10 w-10">
                        <Image
                          src={selectedStudent.profilePhoto}
                          alt={selectedStudent.full_name}
                          fill
                          className="rounded-2xl object-cover border border-slate-200"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#800020] to-[#500014] text-white font-bold text-sm shadow-sm">
                        {selectedStudent.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                        isRecentlyActive(selectedStudent.last_seen_at)
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {selectedStudent.full_name}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{selectedStudent.roll_no}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaCircle
                          className={`text-[6px] ${
                            isRecentlyActive(selectedStudent.last_seen_at)
                              ? "text-emerald-500"
                              : "text-slate-300"
                          }`}
                        />
                        {isRecentlyActive(selectedStudent.last_seen_at)
                          ? "Active now"
                          : "Offline"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-[#800020] border border-rose-200">
                    Language Partner
                  </span>
                </div>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
                <div className="text-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-full">
                    Conversation Session
                  </span>
                </div>

                {loadingChat && currentMessages.length === 0 ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#800020] border-t-transparent" />
                  </div>
                ) : currentMessages.length === 0 ? (
                  /* Empty Conversation Starter Box */
                  <div className="max-w-md mx-auto my-6 p-5 bg-white border border-rose-100 rounded-3xl shadow-sm text-center space-y-3">
                    <div className="h-12 w-12 rounded-2xl bg-rose-50 text-[#800020] flex items-center justify-center mx-auto">
                      <FaLightbulb className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Start a conversation with {selectedStudent.full_name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Practice oral fluency and dialogue responses together. Tap a suggested prompt to get started:
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2">
                      {SUGGESTED_PROMPTS.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(null, prompt)}
                          className="w-full text-left text-xs px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-[#800020] border border-slate-200/80 hover:border-rose-200 text-slate-700 font-medium transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <span className="truncate">{prompt}</span>
                          <FaPaperPlane className="text-[10px] text-slate-300 group-hover:text-[#800020] shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  currentMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${
                        msg.isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[78%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                          msg.isMe
                            ? "bg-gradient-to-r from-[#800020] to-[#5a0016] !text-white rounded-tr-sm"
                            : "bg-white !text-slate-800 border border-slate-200/80 rounded-tl-sm"
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
                            className={`text-[9px] ${
                              msg.pending ? "text-slate-300" : "text-[#800020]"
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
                className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Message ${selectedStudent.full_name}...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
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
            </>
          ) : (
            /* Empty State when no student selected */
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
              <div className="h-16 w-16 rounded-2xl bg-rose-50 text-[#800020] flex items-center justify-center mb-4 shadow-sm border border-rose-100">
                <FaComments className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Select a Classmate
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Choose a student from your batch on the left to start a conversational practice session.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
