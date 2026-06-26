"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ChevronRight, 
  Search, 
  SlidersHorizontal, 
  Play, 
  Headphones, 
  FileText, 
  BookOpen, 
  Award, 
  Clock,
  Sparkles
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
  const { type, subtopicId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState(type || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    fetchModules();
  }, [type, subtopicId]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await moduleApi.getModulesBySubtopic(type, subtopicId);
      
      // FIX: Handles both raw payload or nested Axios responses reliably
      const fetchedData = res?.data?.data || res?.data || [];
      setModules(fetchedData);
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    } finally {
      setLoading(false);
    }
  };

  // Processing client filter routines using correct API keys
  const filteredModules = useMemo(() => {
    return modules
      .filter((mod) => {
        // FIX: Replaced mod.type with mod.module_type matching your API payload
        const actualType = mod.module_type || "";
        const matchesTab = activeTab === "all" || actualType === activeTab || type === actualType;
        
        const matchesSearch = mod.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (mod.description && mod.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        return 0;
      });
  }, [modules, activeTab, searchQuery, sortBy, type]);

  const handleModuleClick = (moduleId, moduleType) => {
    router.push(`/dashboard/${moduleType || type}/${moduleId}`);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] p-4 md:p-8 overflow-hidden">
      
      {/* 3D Moving Ambient Background Layer */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-orange-200/40 to-amber-100/30 blur-[120px] animate-pulse [animation-duration:8s]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-emerald-100/40 to-teal-50/20 blur-[100px] animate-pulse [animation-duration:12s]" />
        <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-purple-100/30 blur-[90px] animate-bounce [animation-duration:18s]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Dynamic Theme Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center h-12 w-12 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-[11px] font-bold text-orange-600 tracking-wider uppercase mb-1.5 shadow-sm">
                <Sparkles size={12} className="text-orange-500 animate-spin [animation-duration:6s]" />
                Language Lab
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0B1A30] capitalize tracking-tight">
                {type === "all" || !type ? "Learning" : type} Modules
              </h1>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-5 py-3 rounded-2xl text-sm font-bold self-start md:self-auto flex items-center gap-2.5 shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {filteredModules.length} Lessons Loaded
          </div>
        </div>

        {/* Filters and Inputs */}
        <div className="space-y-4">
          {!type && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
              {CONTENT_TYPES.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold snap-start transition-all ${
                      isActive 
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-102" 
                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60 shadow-sm"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search topics, practices, modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-400 text-sm shadow-sm"
              />
            </div>
            <div className="relative min-w-[160px]">
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 text-sm font-bold text-slate-700 shadow-sm"
              >
                <option value="default">Sort: Default</option>
                <option value="title">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Container Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-4 animate-pulse shadow-sm">
                <div className="h-14 w-14 bg-slate-100 rounded-2xl" />
                <div className="h-6 bg-slate-100 rounded-lg w-2/3" />
                <div className="h-4 bg-slate-100 rounded-lg w-full" />
                <div className="h-12 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200 p-8 shadow-sm">
            <BookOpen className="mx-auto text-slate-300 mb-4" size={40} />
            <h2 className="text-xl font-bold text-slate-800">No Content Matches Found</h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xs mx-auto">Try altering your search inputs or filter criteria above.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module) => {
              // FIX: Fallback to dynamic type identifier from data layer payload
              const currentModuleType = module.module_type || type;

              return (
                <div
                  key={module._id}
                  onClick={() => handleModuleClick(module._id, currentModuleType)}
                  className="group relative flex flex-col justify-between overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(255,138,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                >
                  
                  {/* VIDEO MODULE CORNER */}
                  {currentModuleType === "video" && (
                    <>
                      <div className="relative overflow-hidden aspect-video bg-slate-900">
                        <video
                          className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                          src={module.video?.url}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-14 w-14 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-orange-600 transition-all">
                            <Play size={20} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-[#0B1A30] group-hover:text-orange-500 transition-colors line-clamp-1">{module.title}</h3>
                          <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">{module.description || "Video Lab Lesson"}</p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
                            <Clock size={13} />
                            {module.video?.duration_sec ? `${Math.floor(module.video.duration_sec / 60)} min` : "Video Lesson"}
                          </span>
                          <span className="text-orange-500 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            Explore <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* AUDIO MODULE CORNER */}
                  {currentModuleType === "audio" && (
                    <div className="p-6 flex flex-col justify-between h-full bg-gradient-to-b from-[#112240] to-[#0A192F] text-white">
                      <div>
                        <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                          <Headphones size={22} />
                        </div>
                        <h3 className="mt-5 text-xl font-bold line-clamp-1">{module.title}</h3>
                        <p className="mt-2 text-sm text-slate-400 line-clamp-2">{module.description || "Listening Session"}</p>
                      </div>
                      <div className="mt-8">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleModuleClick(module._id, currentModuleType); }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3.5 font-bold text-sm shadow-md transition-all"
                        >
                          PLAY LAB AUDIO <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* EXERCISE MODULE CORNER */}
                  {currentModuleType === "exercise" && (
                    <div className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-orange-50/30 to-transparent">
                      <div>
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                          <Award size={22} />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-[#0B1A30] line-clamp-1">{module.title}</h3>
                        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">{module.description || "Language Proficiency Task"}</p>
                        <div className="mt-4 flex gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600">{module.total_marks || 0} Marks</span>
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700">Active</span>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleModuleClick(module._id, currentModuleType); }}
                          className="w-full flex items-center justify-center gap-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3.5 font-bold text-sm shadow-md transition"
                        >
                          Explore <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TEXT READING MODULE CORNER */}
                  {currentModuleType === "text" && (
                    <div className="p-6 flex flex-col justify-between h-full">
                      <div>
                        <div className="h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg">
                          <FileText size={22} />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-[#0B1A30] group-hover:text-orange-500 transition-colors line-clamp-1">{module.title}</h3>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-3 leading-relaxed">
                          {module.content?.body || module.description || "Reading Comprehension"}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400">
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md uppercase tracking-wider text-[10px]">
                          {module.content?.level || "Beginner"}
                        </span>
                        <span className="text-orange-500 flex items-center gap-0.5">
                          Read Lesson <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* VOCABULARY MODULE CORNER */}
                  {currentModuleType === "vocabulary" && (
                    <div className="p-6 flex flex-col justify-between h-full bg-gradient-to-br from-amber-50/40 via-white to-transparent">
                      <div>
                        <div className="h-12 w-12 rounded-2xl bg-[#0B1A30] flex items-center justify-center text-white shadow-lg">
                          <BookOpen size={22} />
                        </div>
                        <h3 className="mt-5 text-lg font-bold text-[#0B1A30] line-clamp-1">{module.title}</h3>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{module.description || "Vocabulary Cards"}</p>
                      </div>
                      <div className="mt-6">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleModuleClick(module._id, currentModuleType); }}
                          className="w-full flex items-center justify-center gap-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white py-3.5 font-bold text-sm shadow-md transition"
                        >
                          Explore <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}