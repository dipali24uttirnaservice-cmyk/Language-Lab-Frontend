export default function StudentLoading() {
  return (
    <div className="space-y-6 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-orange-100 rounded-xl" />
          <div className="h-4 w-32 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-12 w-12 rounded-2xl bg-orange-100" />
      </div>

      {/* Course / Topic Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 w-full bg-white/80 border border-orange-100 rounded-[28px] p-6 space-y-4 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-orange-100" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 bg-slate-200 rounded-md" />
              <div className="h-3 w-1/2 bg-slate-100 rounded-md" />
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}