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
  const sortedBins = [...bins].sort((firstBin, secondBin) => {
    const firstLocationNumber = Number(firstBin.id.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
    const secondLocationNumber = Number(
      secondBin.id.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER,
    );

    return firstLocationNumber - secondLocationNumber;
  });

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div className="mb-6">
        <p className="text-base font-semibold uppercase tracking-[0.3em] text-amber-200 xl:text-lg">
          All Bins
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {sortedBins.map((bin, index) => (
          <article
            key={bin.id}
            className={`surface-hover rounded-[24px] border p-4 xl:p-5 ${getCardClasses(
              bin.overallSeverity,
            )}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Bin #{String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2.5 text-[1.55rem] font-semibold tracking-tight text-white xl:text-[1.7rem]">
                  {bin.name}
                </h2>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {bin.id}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200">
                {bin.isLive ? "Live" : "Sim"}
              </span>
            </div>

            <div className="mt-3.5 grid gap-2 lg:grid-cols-3">
              <div className="rounded-[16px] bg-black/20 p-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                  <span>Fill Level</span>
                  <span>{bin.fillLabel}</span>
                </div>
                <p className="mt-2 text-[1.45rem] font-semibold text-white xl:text-[1.55rem]">
                  {bin.fill.toFixed(1)}%
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                  <div
                    className={`h-1.5 rounded-full ${getProgressClasses(bin.fillSeverity)}`}
                    style={{ width: `${bin.fill}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[16px] bg-black/20 p-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                  <span>Gas Level</span>
                  <span>{bin.gasLabel}</span>
                </div>
                <p className="mt-2 text-[1.45rem] font-semibold text-white xl:text-[1.55rem]">
                  {bin.gas.toFixed(1)}%
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                  <div
                    className={`h-1.5 rounded-full ${getProgressClasses(bin.gasSeverity)}`}
                    style={{ width: `${bin.gas}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[16px] bg-black/20 p-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
                  <span>Weight Level</span>
                  <span>{bin.weightLabel}</span>
                </div>
                <p className="mt-2 text-[1.45rem] font-semibold text-white xl:text-[1.55rem]">
                  {bin.weightPercent.toFixed(1)}%
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                  <div
                    className={`h-1.5 rounded-full ${getProgressClasses(bin.weightSeverity)}`}
                    style={{ width: `${bin.weightPercent}%` }}
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
