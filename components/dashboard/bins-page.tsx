"use client";

import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

function getCardClasses(severity: "low" | "medium" | "high") {
  if (severity === "high") {
    return "border-rose-500/28 bg-rose-500/8";
  }

  if (severity === "medium") {
    return "border-amber-400/25 bg-amber-400/8";
  }

  return "border-emerald-400/18 bg-emerald-400/7";
}

function getProgressClasses(severity: "low" | "medium" | "high") {
  if (severity === "high") {
    return "bg-[linear-gradient(90deg,#ff3b3b,#ff6b6b)]";
  }

  if (severity === "medium") {
    return "bg-[linear-gradient(90deg,#ff9500,#ffb340)]";
  }

  return "bg-[linear-gradient(90deg,#34c759,#5dde7e)]";
}

export function BinsPage() {
  const { bins } = useCampusMonitoring();

  return (
    <section className="rounded-[30px] border border-cyan-500/12 bg-[#0f1a30] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
          All Bins
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Campus bin grid
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          The cards below follow the same fill and gas emphasis as the attached
          HTML dashboard, including live status for the first five bins and
          dependent simulation for the rest.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {bins.map((bin, index) => (
          <article
            key={bin.id}
            className={`surface-hover rounded-[24px] border p-5 ${getCardClasses(
              bin.overallSeverity,
            )}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Bin #{String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {bin.name}
                </h2>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                  {bin.id}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                {bin.isLive ? "Live" : "Sim"}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] bg-black/20 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                  <span>Fill Level</span>
                  <span>{bin.fillLabel}</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {bin.fill.toFixed(1)}%
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${getProgressClasses(bin.fillSeverity)}`}
                    style={{ width: `${bin.fill}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[18px] bg-black/20 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                  <span>Gas Level</span>
                  <span>{bin.gasLabel}</span>
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {bin.gas.toFixed(1)}%
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${getProgressClasses(bin.gasSeverity)}`}
                    style={{ width: `${bin.gas}%` }}
                  />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
