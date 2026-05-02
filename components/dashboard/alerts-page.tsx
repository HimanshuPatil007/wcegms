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
    const firstScore =
      firstBin.fill * 0.45 +
      firstBin.gas * 0.3 +
      firstBin.weightPercent * 0.25;
    const secondScore =
      secondBin.fill * 0.45 +
      secondBin.gas * 0.3 +
      secondBin.weightPercent * 0.25;

    return secondScore - firstScore;
  });

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div className="mb-6">
        <p className="text-base font-semibold uppercase tracking-[0.3em] text-amber-200 xl:text-lg">
          Alerts
        </p>
      </div>

      <div className="space-y-3">
        {rankedBins.map((bin, index) => (
          <article
            key={bin.id}
            className={`rounded-[20px] border border-cyan-500/10 border-l-4 bg-[#101b33] px-4 py-3.5 xl:px-5 xl:py-4 ${getSeverityAccent(
              bin.overallSeverity,
            )}`}
          >
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="w-12 text-[1.7rem] font-semibold tracking-tight text-slate-500 xl:text-[1.9rem]">
                #{index + 1}
              </div>
              <div className="flex-1">
                <p className="text-[1.25rem] font-semibold text-white xl:text-[1.35rem]">
                  {bin.name}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  {bin.id} | Fill {bin.fillLabel} | Gas {bin.gasLabel} | Weight{" "}
                  {bin.weightLabel}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="min-w-20 rounded-[14px] bg-black/20 px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Fill
                  </p>
                  <p className="mt-1.5 text-[1.35rem] font-semibold text-white xl:text-[1.45rem]">
                    {bin.fill.toFixed(0)}%
                  </p>
                </div>
                <div className="min-w-20 rounded-[14px] bg-black/20 px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Gas
                  </p>
                  <p className="mt-1.5 text-[1.35rem] font-semibold text-white xl:text-[1.45rem]">
                    {bin.gas.toFixed(0)}%
                  </p>
                </div>
                <div className="min-w-20 rounded-[14px] bg-black/20 px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    Weight
                  </p>
                  <p className="mt-1.5 text-[1.35rem] font-semibold text-white xl:text-[1.45rem]">
                    {bin.weightPercent.toFixed(0)}%
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
