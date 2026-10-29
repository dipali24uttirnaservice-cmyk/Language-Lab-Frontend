export default function InstituteLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Analytics Header Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="h-4 w-1/3 bg-slate-200 rounded-md" />
            <div className="h-8 w-1/2 bg-slate-300 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Table / Data Section Skeleton */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="h-6 w-48 bg-slate-200 rounded-md mb-6" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="h-4 w-1/4 bg-slate-200 rounded-md" />
            <div className="h-4 w-1/6 bg-slate-100 rounded-md" />
            <div className="h-4 w-1/8 bg-slate-200 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}