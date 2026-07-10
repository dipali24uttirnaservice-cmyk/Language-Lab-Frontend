"use client";

import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

export default function OverallScoreGauge({ progress = [] }) {
  // 1. Extract and calculate scores
  const scoreMetrics = {
    audio: { total: 0, count: 0 },
    video: { total: 0, count: 0 },
    text: { total: 0, count: 0 },
    exercise: { total: 0, count: 0 },
    vocabulary: { total: 0, count: 0 },
  };

  let totalSum = 0;
  let totalCount = 0;

  progress.forEach((item) => {
    const type = item.module_type;
    const score =
      type === "exercise"
        ? (item.score !== undefined && item.score !== null ? item.score : 0)
        : (item.progress_percentage || 0);
    
    if (item.is_completed || score > 0) {
      if (scoreMetrics[type] !== undefined) {
        scoreMetrics[type].total += score;
        scoreMetrics[type].count += 1;
      }
      totalSum += score;
      totalCount += 1;
    }
  });

  const overallScore = totalCount > 0 ? Math.round(totalSum / totalCount) : 0;

  // 2. Speedometer SVG Math Configuration
  const cx = 100;
  const cy = 100;
  const rGauge = 70;
  const rLabels = 50;

  // Polar to Cartesian conversion helper
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Helper to construct SVG arc path
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // 3. Define the segmented blocks (0 to 100%)
  // Sweep from 150 degrees (bottom-left) to 390 degrees (bottom-right) -> 240 degrees sweep
  const startSweep = 150;
  const totalSweep = 240;

  const segments = [
    { fromPct: 0, toPct: 20, color: "#2563eb" },   // Blue (0 - 20)
    { fromPct: 20, toPct: 40, color: "#3b82f6" },  // Blue (20 - 40)
    { fromPct: 40, toPct: 60, color: "#ea580c" },  // Orange (40 - 60)
    { fromPct: 60, toPct: 80, color: "#f97316" },  // Orange (60 - 80)
    { fromPct: 80, toPct: 100, color: "#fb923c" }, // Orange (80 - 100)
  ];

  // Calculate needle angle
  const needleAngle = startSweep + (overallScore / 100) * totalSweep;

  // Needle polygon calculation
  const rNeedleTip = 55;
  const rBase = 8;
  const tip = polarToCartesian(cx, cy, rNeedleTip, needleAngle);
  const baseLeft = polarToCartesian(cx, cy, rBase, needleAngle - 90);
  const baseRight = polarToCartesian(cx, cy, rBase, needleAngle + 90);
  const needlePoints = `${tip.x},${tip.y} ${baseLeft.x},${baseLeft.y} ${baseRight.x},${baseRight.y}`;

  // Internal ticks positions
  const ticks = [0, 20, 40, 60, 80, 100];

  const categories = [
    { key: "audio", label: "Speaking/Listening", color: "text-amber-500" },
    { key: "video", label: "Comprehension", color: "text-blue-500" },
    { key: "text", label: "Reading", color: "text-pink-500" },
    { key: "exercise", label: "Grammar/Quiz", color: "text-emerald-500" },
    { key: "vocabulary", label: "Vocabulary", color: "text-purple-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col h-full justify-between gap-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FaStar className="text-amber-400 text-base" /> Overall Learning Score
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Average score on all module challenges
          </p>
        </div>
        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Performance
        </span>
      </div>

      {/* Speedometer Gauge Visual Row */}
      <div className="flex flex-col items-center justify-center py-2 flex-1">
        <div className="relative w-48 h-40 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 200 160">
            {/* Draw background/colored track segments */}
            {segments.map((seg, idx) => {
              // Add a small gap between segments by subtracting 3 degrees from the end
              const startAngle = startSweep + (seg.fromPct / 100) * totalSweep;
              const endAngle = startSweep + (seg.toPct / 100) * totalSweep - 3;
              const path = describeArc(cx, cy, rGauge, startAngle, endAngle);
              return (
                <path
                  key={idx}
                  d={path}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Draw internal tick labels */}
            {ticks.map((val) => {
              const angle = startSweep + (val / 100) * totalSweep;
              // position label slightly inward
              const pos = polarToCartesian(cx, cy, rLabels, angle);
              return (
                <text
                  key={val}
                  x={pos.x}
                  y={pos.y + 4} // small alignment adjust
                  textAnchor="middle"
                  className="fill-slate-400 font-sans font-bold text-[9px]"
                >
                  {val}
                </text>
              );
            })}

            {/* Draw the needle */}
            <polygon
              points={needlePoints}
              className="fill-orange-600 stroke-orange-600 stroke-1"
            />

            {/* Needle center cap circle */}
            <circle
              cx={cx}
              cy={cy}
              r="8"
              className="fill-orange-600 stroke-white stroke-2"
            />
            {/* Inner cap dot */}
            <circle
              cx={cx}
              cy={cy}
              r="2.5"
              className="fill-white"
            />
          </svg>

          {/* Centered overall score text placed below the needle cap */}
          <div className="absolute bottom-2 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-slate-800 tracking-tighter leading-none">
              {overallScore}%
            </span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Average Score
            </span>
          </div>
        </div>
      </div>

      {/* Category Averages list */}
      <div className="border-t border-slate-100 pt-4 space-y-2.5">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          Skill-by-Skill Scores
        </h4>

        {categories.map((cat) => {
          const metric = scoreMetrics[cat.key];
          const avg = metric.count > 0 ? Math.round(metric.total / metric.count) : 0;
          return (
            <div key={cat.key} className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">{cat.label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${avg}%` }}
                  />
                </div>
                <span className="text-slate-800 font-mono w-8 text-right">{avg}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
