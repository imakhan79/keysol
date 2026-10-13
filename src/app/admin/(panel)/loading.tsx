export default function Loading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-[77px] border-b border-slate-200 bg-white" />
      <div className="space-y-4 p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200/60" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-slate-200/60" />
      </div>
    </div>
  );
}
