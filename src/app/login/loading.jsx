export default function LoginLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm space-y-4 p-8 animate-pulse">
        <div className="h-10 w-10 rounded-xl bg-slate-200 mx-auto" />
        <div className="h-6 w-2/3 bg-slate-200 rounded-lg mx-auto" />
        <div className="h-11 w-full bg-slate-100 rounded-xl" />
        <div className="h-11 w-full bg-slate-100 rounded-xl" />
        <div className="h-11 w-full bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
