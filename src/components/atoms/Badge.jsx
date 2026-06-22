import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function Badge({
  children,
  variant = "default",
}) {
  const variants = {
    success:
      "bg-emerald-100 text-emerald-700 border border-emerald-200",

    danger:
      "bg-red-100 text-red-700 border border-red-200",

    warning:
      "bg-amber-100 text-amber-700 border border-amber-200",

    info:
      "bg-blue-100 text-blue-700 border border-blue-200",

    default:
      "bg-slate-100 text-slate-700 border border-slate-200",
  };

  const icons = {
    success: (
      <CheckCircle
        size={14}
        className="fill-current"
      />
    ),
    danger: (
      <XCircle
        size={14}
        className="fill-current"
      />
    ),
    warning: (
      <AlertTriangle
        size={14}
        className="fill-current"
      />
    ),
    info: (
      <Info
        size={14}
        className="fill-current"
      />
    ),
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-3
        py-1
        rounded-full
        text-xs
        font-medium
        ${variants[variant]}
      `}
    >
      {icons[variant]}
      {children}
    </span>
  );
}