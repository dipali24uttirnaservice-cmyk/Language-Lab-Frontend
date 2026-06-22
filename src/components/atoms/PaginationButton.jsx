"use client";

export default function PaginationButton({
  children,
  active,
  ...props
}) {
  return (
    <button
      {...props}
      className={`
        w-10
        h-10
        rounded-xl
        font-semibold
        transition
        ${
          active
            ? "bg-indigo-600 text-white"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        }
      `}
    >
      {children}
    </button>
  );
}