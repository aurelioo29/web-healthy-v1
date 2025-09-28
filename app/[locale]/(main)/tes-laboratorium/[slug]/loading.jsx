export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-10 animate-pulse">
      <div className="h-[320px] bg-slate-200 rounded-2xl" />
      <div className="mt-6 h-10 bg-slate-200 rounded w-3/4" />
      <div className="mt-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded" />
        <div className="h-4 bg-slate-200 rounded w-5/6" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
      </div>
    </div>
  );
}
