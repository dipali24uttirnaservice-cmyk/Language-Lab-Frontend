"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { courseApi } from "@/services/course/courseApi";
import {
  ArrowLeft,
  Video,
  Headphones,
  FileText,
  ClipboardCheck,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function LearningModules({ courseId, courseName }) {
  const router = useRouter();
  const canvasRef = useRef(null);
  const [moduleCounts, setModuleCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    const fetchCounts = async () => {
      try {
        const res = await courseApi.getModuleCount(courseId);
        // API → { success: true, data: { module_counts: { video, audio, text, vocabulary, exercise } } }
        const counts = res.data?.data?.module_counts || {};
        setModuleCounts(counts);
      } catch (err) {
        console.error("[ModuleCount] Failed:", err?.response?.status);
      } finally {
        setCountsLoading(false);
      }
    };
    fetchCounts();
  }, [courseId]);

  // 3D Floating Network Mesh Canvas Background Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 45;
    const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6", "#ec4899"];

    let mouse = { x: -1000, y: -1000 };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 300 + 100, // Depth metric
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1.5,
        color: colors[i % colors.length],
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Loop through nodes to process deep math projections
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Boundaries bounce
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interactive mouse gravity pull
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          p.x += (dx / dist) * 0.4;
          p.y += (dy / dist) * 0.4;
        }

        // Projecting pseudo 3D sizing using depth logic
        const scale = 200 / p.z;
        const finalRadius = p.radius * scale;

        ctx.beginPath();
        ctx.arc(p.x, p.y, finalRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, scale * 0.4);
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Connect proximal nodes to generate structural 3D web geometry
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(226, 232, 240, ${0.15 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const modules = [
    {
      title: "Video",
      type: "video",
      icon: Video,
      color: "from-blue-500 to-indigo-600",
      shadowColor: "rgba(59, 130, 246, 0.25)",
      description: "Watch interactive video lessons",
    },
    {
      title: "Audio",
      type: "audio",
      icon: Headphones,
      color: "from-green-500 to-emerald-600",
      shadowColor: "rgba(16, 185, 129, 0.25)",
      description: "Improve listening skills",
    },
    {
      title: "Text",
      type: "text",
      icon: FileText,
      color: "from-orange-500 to-amber-600",
      shadowColor: "rgba(249, 115, 22, 0.25)",
      description: "Read learning materials",
    },
    {
      title: "Exercise",
      type: "exercise",
      icon: ClipboardCheck,
      color: "from-purple-500 to-violet-600",
      shadowColor: "rgba(139, 92, 246, 0.25)",
      description: "Practice exercises",
    },
    {
      title: "Vocabulary",
      type: "vocabulary",
      icon: BookOpen,
      color: "from-pink-500 to-rose-600",
      shadowColor: "rgba(236, 72, 153, 0.25)",
      description: "Learn new words",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-50 text-slate-800 font-sans antialiased">
      {/* 3D Render Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Decorative Blur Background Points */}
      <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-orange-400/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-400/10 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-12">

        {/* INTERACTIVE HEADER: Fills out empty top space beautifully */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/50"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-11 w-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-orange-500 hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5 transition-all group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
                <Sparkles size={12} className="animate-pulse" />
                <span>Active Learning Matrix</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-0.5 tracking-tight">
                {courseName || "Course Modules Workspace"}
              </h1>
            </div>
          </div>
          <div className="hidden md:flex items-center bg-slate-950/80 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
            <span className="bg-gradient-to-r from-orange-400 via-amber-200 to-white bg-clip-text text-transparent text-xs font-black tracking-wide uppercase">
              Enjoy Your Learning Journey
            </span>
          </div>
        </motion.div>

        {/* CARDS GRID SYSTEM */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 }
            }
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <motion.div
                key={module.type}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                }}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  boxShadow: `0 20px 30px -10px ${module.shadowColor}, 0 1px 3px 0 rgba(0,0,0,0.05)`
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (courseId) params.set("courseId", courseId);
                  if (courseName) params.set("courseName", courseName);
                  params.set("type", module.type);
                  router.push(`/dashboard/topics?${params.toString()}`);
                }}
                className="cursor-pointer rounded-3xl bg-white/80 backdrop-blur-md p-6 border border-slate-200/80 shadow-lg shadow-slate-100 transition-all group flex flex-col justify-between min-h-[250px]"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${module.color} text-white flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300`}
                    >
                      <Icon size={24} />
                    </div>
                    {/* Module count badge */}
                    {countsLoading ? (
                      <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
                    ) : moduleCounts[module.type] !== undefined ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-gradient-to-br ${module.color} text-white shadow-sm`}
                      >
                        {moduleCounts[module.type]}
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-6 text-lg font-black tracking-tight text-slate-800 group-hover:text-slate-900 transition-colors">
                    {module.title}
                  </h3>

                  <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="mt-6 flex justify-end">
                  <div className={`h-8 w-8 rounded-full bg-slate-50 group-hover:bg-gradient-to-br ${module.color} flex items-center justify-center text-slate-400 group-hover:text-white border border-slate-100 transition-all duration-300 shadow-sm`}>
                    <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
}