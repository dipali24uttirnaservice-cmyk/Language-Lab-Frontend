export default function StatusBadge({ status }) {
  // Logic to handle different states
  const isActive = status === "Active";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
        ${
          isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-slate-50 text-slate-600 border-slate-200"
        }
      `}
    >
      {/* The Status Indicator Dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}