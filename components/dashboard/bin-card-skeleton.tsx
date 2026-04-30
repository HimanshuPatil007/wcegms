export function BinCardSkeleton() {
  return (
    <article className="animate-rise-in rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="animate-soft-pulse h-3 w-16 rounded-full bg-slate-200" />
          <div className="animate-soft-pulse h-8 w-32 rounded-full bg-slate-200" />
        </div>
        <div className="animate-soft-pulse h-8 w-16 rounded-full bg-slate-200" />
      </div>

      <div className="mt-6">
        <div className="flex justify-between">
          <div className="animate-soft-pulse h-3 w-20 rounded-full bg-slate-200" />
          <div className="animate-soft-pulse h-3 w-10 rounded-full bg-slate-200" />
        </div>
        <div className="animate-soft-pulse mt-3 h-3 rounded-full bg-slate-200" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4">
          <div className="animate-soft-pulse h-3 w-18 rounded-full bg-slate-200" />
          <div className="animate-soft-pulse mt-3 h-8 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4">
          <div className="animate-soft-pulse h-3 w-18 rounded-full bg-slate-200" />
          <div className="animate-soft-pulse mt-3 h-8 w-24 rounded-full bg-slate-200" />
          <div className="animate-soft-pulse mt-2 h-3 w-16 rounded-full bg-slate-200" />
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/90 p-4">
        <div className="animate-soft-pulse h-3 w-16 rounded-full bg-slate-200" />
        <div className="animate-soft-pulse mt-3 h-3 w-36 rounded-full bg-slate-200" />
        <div className="animate-soft-pulse mt-2 h-3 w-40 rounded-full bg-slate-200" />
      </div>
    </article>
  );
}
