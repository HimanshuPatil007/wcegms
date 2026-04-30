"use client";

import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

function getSeverityAccent(severity: "low" | "medium" | "high") {
  if (severity === "high") {
    return "border-l-rose-500";
  }

  if (severity === "medium") {
    return "border-l-amber-400";
  }

  return "border-l-emerald-400";
}

export function AlertsPage() {
  const { bins } = useCampusMonitoring();

  const rankedBins = [...bins].sort((firstBin, secondBin) => {
    const firstScore = firstBin.fill * 0.6 + firstBin.gas * 0.4;
    const secondScore = secondBin.fill * 0.6 + secondBin.gas * 0.4;

    return secondScore - firstScore;
  });

  return (
    <section className="rounded-[30px] border border-cyan-500/12 bg-[#0f1a30] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
          Alerts
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Ranked operations queue
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Bins are ordered using the original weighted alert score of `fill *
          0.6 + gas * 0.4`.
        </p>
      </div>

      <div className="space-y-3">
        {rankedBins.map((bin, index) => (
          <article
            key={bin.id}
            className={`rounded-[22px] border border-cyan-500/10 border-l-4 bg-[#101b33] px-5 py-4 ${getSeverityAccent(
              bin.overallSeverity,
            )}`}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="w-14 text-3xl font-semibold tracking-tight text-slate-500">
                #{index + 1}
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-white">{bin.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {bin.id} · Fill {bin.fillLabel} · Gas {bin.gasLabel}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="min-w-24 rounded-[16px] bg-black/20 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Fill
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {bin.fill.toFixed(0)}%
                  </p>
                </div>
                <div className="min-w-24 rounded-[16px] bg-black/20 px-4 py-3 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Gas
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {bin.gas.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
