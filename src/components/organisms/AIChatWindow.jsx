"use client";

import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaMicrophone, FaStop, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";
import ChatBubble from "@/components/molecules/ChatBubble";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function AIChatWindow() {
  const bottomRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // 1. SPEECH RECOGNITION HOOKS
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // 2. STATE INITIALIZATION
  const [chatHistory, setChatHistory] = useState(() => {
    if (typeof window === "undefined") return { activeChatId: "1", chats: { "1": { id: "1", messages: [{ id: 1, sender: "assistant", message: "Hello! How can I help you learn today?" }] } } };
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : { activeChatId: "1", chats: { "1": { id: "1", messages: [{ id: 1, sender: "assistant", message: "Hello! How can I help you learn today?" }] } } };
  });

  const activeChat = chatHistory?.chats?.[chatHistory.activeChatId];
  const messages = activeChat?.messages || [];

  // Update input message when transcript changes
  useEffect(() => {
    if (transcript) setMessage(transcript);
  }, [transcript]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const finalMessage = listening ? transcript : message;
    if (!finalMessage.trim()) return;

    // Reset voice state
    if (listening) SpeechRecognition.stopListening();
    resetTranscript();

    const userMsg = { id: Date.now(), sender: "user", message: finalMessage };
    
    setChatHistory(prev => ({
      ...prev,
      chats: {
        ...prev.chats,
        [prev.activeChatId]: {
          ...prev.chats[prev.activeChatId],
          messages: [...prev.chats[prev.activeChatId].messages, userMsg]
        }
      }
    }));
    
    setMessage("");
    setIsTyping(true);
    
    setTimeout(() => {
      const aiMsg = { id: Date.now() + 1, sender: "assistant", message: "I heard you! Let's continue practicing." };
      setChatHistory(prev => ({
        ...prev,
        chats: {
          ...prev.chats,
          [prev.activeChatId]: {
            ...prev.chats[prev.activeChatId],
            messages: [...prev.chats[prev.activeChatId].messages, aiMsg]
          }
        }
      }));
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-2xl overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent" />

      {/* Header */}
      <div className="relative z-10 border-b border-white/20 px-8 py-6 flex items-center justify-between">
         {/* ... (Same Header Code) ... */}
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-8 scrollbar-hide">
        <div className="space-y-6">
          {messages.map((msg) => <ChatBubble key={msg.id} sender={msg.sender} message={msg.message} />)}
          {listening && (
            <motion.div className="flex justify-start px-4 text-xs font-bold text-red-500 animate-pulse">
              ● Listening... "{transcript}"
            </motion.div>
          )}
          {isTyping && <div className="text-xs font-bold text-slate-400 pl-4">AI Tutor is analyzing...</div>}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-6 bg-white/60 backdrop-blur-xl border-t border-white/20">
        <div className="flex gap-3 bg-white/80 p-2 rounded-2xl border border-white shadow-inner">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-900 font-medium"
            placeholder={listening ? "Speak now..." : "Ask your tutor..."}
          />
          
          {/* Voice Toggle */}
          {browserSupportsSpeechRecognition && (
            <button
              onClick={() => listening ? SpeechRecognition.stopListening() : SpeechRecognition.startListening({ continuous: true })}
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${
                listening ? "bg-red-500 text-white animate-pulse" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {listening ? <FaStop /> : <FaMicrophone />}
            </button>
          )}

          <button onClick={handleSend} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800">
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}