import Link from "next/link";
import { SearchX, Home } from "lucide-react";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4 bg-slate-50">
      <div className="h-16 w-16 rounded-3xl bg-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
        <SearchX size={32} />
      </div>

      <h2 className="text-2xl font-black text-slate-900">Page not found</h2>
      <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      >
        <Home size={16} />
        Back Home
      </Link>
    </div>
  );
}
