"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Play,
  Headphones,
  FileText,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { moduleApi } from "@/services/topic/topicApi";

const CONTENT_TYPES = [
  { id: "all", label: "All Content", icon: BookOpen },
  { id: "video", label: "Videos", icon: Play },
  { id: "audio", label: "Audios", icon: Headphones },
  { id: "exercise", label: "Exercises", icon: Award },
  { id: "text", label: "Readings", icon: FileText },
  { id: "vocabulary", label: "Vocab", icon: BookOpen },
];

export default function ModuleListPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = params?.type;
  const subtopicId = params?.subtopicId;

  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState(type || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    if (type) {
      setActiveTab(type);
    }
  }, [type]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const res = await moduleApi.getModulesBySubtopic(type, subtopicId);
        const fetchedData = res?.data?.data || res?.data || [];
        setModules(fetchedData);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [type, subtopicId]);

  const filteredModules = useMemo(() => {
    if (!Array.isArray(modules)) return [];
    return modules
      .filter((mod) => {
        if (!mod) return false;
        const actualType = mod.module_type || "";
        const matchesTab = activeTab === "all" || actualType === activeTab || type === actualType;
        const matchesSearch =
          mod.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mod.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "title" && a?.title && b?.title) {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [modules, activeTab, searchQuery, sortBy, type]);

  const videoModules = useMemo(() => {
    if (!Array.isArray(modules)) return [];
    return modules.filter((item) => item && (item.module_type || type) === "video");
  }, [modules, type]);

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 text-slate-800 p-4 md:p-6 font-sans antialiased overflow-x-hidden">
      
      {/* Soft Ambient Light Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400/10 blur-[150px] pointer-events-none" />

      <div className="max-w-[1700px] mx-auto space-y-8 relative z-10">
        
       {/* HEADER SECTION */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
  <div className="flex items-center gap-3.5">
    {selectedModule && (
      <button 
        onClick={() => setSelectedModule(null)}
        className="p-2 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm rounded-xl transition-all text-slate-600 active:scale-95"
      >
        <ArrowLeft size={18} />
      </button>
    )}
    <div className="flex items-center gap-3">
      <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
        {selectedModule ? "Now Playing" : "Explore Lessons"}
      </h1>
      
      {/* Integrated Journey Badge */}
      <div className="hidden md:flex items-center bg-orange-500/[0.04] backdrop-blur-xl px-3 py-1 rounded-full border border-orange-500/20 shadow-[inset_0_1px_12px_rgba(249,115,22,0.08)]">
        <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent text-[10px] font-black tracking-wider uppercase">
          Enjoy Your Learning Journey
        </span>
      </div>
    </div>
  </div>

  {/* Search Input Box */}
  <div className="relative w-full sm:w-72">
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
    <input
      type="text"
      placeholder="Search course content..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm"
    />
  </div>
</div>

        {/* ================================================= */}
        {/* CONDITION 1: THEATER VIEW LAYOUT */}
        {/* ================================================= */}
        {selectedModule && (selectedModule.module_type === "video" || type === "video") ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
            
            {/* LEFT COLUMN: Main Player Arena */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative shadow-xl shadow-slate-200 border border-slate-200">
                {selectedModule?.video?.url ? (
                  <video
                    key={selectedModule._id} 
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                    src={selectedModule.video.url}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                    No active media source URL available.
                  </div>
                )}
              </div>

              {/* Video Meta Frame */}
              <div className="pt-1">
                <h1 className="text-xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">
                  {selectedModule.title}
                </h1>
                
                <div className="mt-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-md shadow-slate-100/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-2.5">
                    <Clock size={14} className="animate-pulse" />
                    <span>
                      {selectedModule.video?.duration_sec 
                        ? `${Math.floor(selectedModule.video.duration_sec / 60)} minutes duration`
                        : "Video Module"}
                    </span>
                  </div>
                  <div 
                    className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap html-description"
                    dangerouslySetInnerHTML={{ __html: selectedModule.description || "No description available." }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: Queue List */}
            <div className="lg:col-span-4 bg-white/70 backdrop-blur-md border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px] lg:h-[680px] shadow-xl shadow-slate-100">
              <div className="p-4 border-b border-slate-200 bg-white/90 flex items-center justify-between backdrop-blur-sm">
                <h3 className="font-bold text-xs tracking-wider text-slate-700 uppercase flex items-center gap-2">
                  <Play size={14} className="text-orange-500 fill-orange-500 drop-shadow-[0_2px_4px_rgba(249,115,22,0.3)]" /> 
                  Dynamic Course Queue
                </h3>
                <span className="text-xs text-orange-600 font-bold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full shadow-sm">
                  {videoModules.length} lessons
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/40">
                {videoModules.map((item) => {
                  if (!item) return null;
                  const isPlaying = selectedModule?._id === item._id;
                  const thumbnailSource = item.video?.thumbnail_url || item.thumbnail || item.thumbnail_url;
                  
                  return (
                    <button
                      key={item._id}
                      onClick={() => {
                        setSelectedModule(item);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full p-2.5 rounded-xl flex gap-3 text-left transition-all duration-200 group/item ${
                        isPlaying 
                          ? "bg-gradient-to-r from-orange-500/5 to-transparent border border-orange-300 shadow-sm" 
                          : "hover:bg-white border border-transparent shadow-sm hover:shadow"
                      }`}
                    >
                      <div className="relative w-28 h-16 rounded-lg bg-slate-950 flex-shrink-0 overflow-hidden border border-slate-200/80 shadow-inner flex items-center justify-center">
                        {thumbnailSource ? (
                          <img 
                            src={thumbnailSource} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                          />
                        ) : item.video?.url ? (
                          <video 
                            src={`${item.video.url}#t=2`}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-60 pointer-events-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                            <Play size={16} className="text-slate-500 fill-slate-500" />
                          </div>
                        )}

                        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 bg-black/30 backdrop-blur-[1px] ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}>
                          <div className="h-7 w-7 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md transform scale-90 group-hover/item:scale-100 transition-transform">
                            <Play size={10} className="fill-white ml-0.5" />
                          </div>
                        </div>
                        
                        {item.video?.duration_sec && (
                          <span className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-sm text-[9px] font-mono px-1 py-0.5 rounded font-bold text-white z-10">
                            {Math.floor(item.video.duration_sec / 60)}m
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className={`font-bold text-xs leading-snug line-clamp-2 transition-colors duration-200 ${isPlaying ? "text-orange-600" : "text-slate-800 group-hover/item:text-orange-600"}`}>
                          {item.title}
                        </h4>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* ================================================= */
          /* CONDITION 2: OVERVIEW GRID VIEW (YOUTUBE LOOK) */
          /* ================================================= */
          <div className="space-y-6 animate-fade-in">
            {/* Category Filter Tabs */}
            {!type && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {CONTENT_TYPES.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                        isActive 
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white border-orange-400 shadow-md shadow-orange-500/10 transform -translate-y-0.5" 
                          : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-slate-200 shadow-sm"
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Modules Card Grid Layout */}
            {filteredModules.length === 0 ? (
              <div className="text-center py-20 bg-white/40 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 text-sm font-medium">No learning modules match your selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredModules.map((item) => {
                  if (!item) return null;
                  const isVideo = (item.module_type || type) === "video";
                  const thumbnailSource = item.video?.thumbnail_url || item.thumbnail || item.thumbnail_url;

                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        if (isVideo) {
                          setSelectedModule(item);
                        } else {
                          const nextParams = new URLSearchParams(searchParams?.toString() || "");
                          nextParams.set("lessonName", item.title || "");
                          router.push(`/dashboard/${item.module_type || type}/${item._id}?${nextParams.toString()}`);
                        }
                      }}
                      className="group cursor-pointer bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      {/* Video Thumbnail Screen - Fixed from Screenshot 2026-07-03 172629.jpg */}
                      <div className="aspect-video w-full bg-slate-950 relative overflow-hidden border-b border-slate-100 flex items-center justify-center">
                        {thumbnailSource ? (
                          <img
                            src={thumbnailSource}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : item.video?.url ? (
                          /* Fallback Live Video Stream Preview Frame if Thumbnail Image missing */
                          <video
                            src={`${item.video.url}#t=2`}
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                          />
                        ) : null}

                        {/* Centered Modern Play Button (Replaced the book icon completely) */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/30">
                          <div className="h-12 w-12 rounded-full bg-white/95 text-slate-900 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110">
                            <Play size={20} className="fill-current ml-0.5 transition-transform" />
                          </div>
                        </div>

                        {/* Duration Badge */}
                        {item.video?.duration_sec && (
                          <span className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-[10px] font-mono px-1.5 py-0.5 rounded font-bold text-white tracking-wide z-10">
                            {Math.floor(item.video.duration_sec / 60)}m
                          </span>
                        )}
                        
                        {/* Module Type Tag */}
                        <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm border border-slate-200 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md text-slate-700 shadow-sm z-10">
                          {item.module_type || type || "lesson"}
                        </span>
                      </div>

                      {/* Video Bottom Details Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors duration-200">
                            {item.title}
                          </h3>
                          <div
                            className="text-xs text-slate-500 line-clamp-2 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: item.description || "No description available." }}
                          />
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Available Now
                          </span>
                          <span className="text-orange-500 font-bold group-hover:underline flex items-center gap-0.5">
                            Start Lesson &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}