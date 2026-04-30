"use client";

import Link from "next/link";

import { CampusMap } from "@/components/dashboard/campus-map";
import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

function getSeverityClasses(severity: "low" | "medium" | "high") {
  if (severity === "high") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-100";
  }

  if (severity === "medium") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-50";
  }

  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-50";
}

function MiniDonut({
  high,
  medium,
  low,
  label,
}: {
  high: number;
  medium: number;
  low: number;
  label: string;
}) {
  const total = Math.max(high + medium + low, 1);
  const highDegrees = (high / total) * 360;
  const mediumDegrees = (medium / total) * 360;

  return (
    <div className="rounded-[24px] border border-cyan-500/10 bg-[#0f1a30] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="h-20 w-20 rounded-full"
          style={{
            background: `conic-gradient(#ff3b3b 0deg ${highDegrees}deg, #ff9500 ${highDegrees}deg ${highDegrees + mediumDegrees}deg, #34c759 ${highDegrees + mediumDegrees}deg 360deg)`,
          }}
        >
          <div className="m-4 h-12 w-12 rounded-full bg-[#091121]" />
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <p>High: {high}</p>
          <p>Medium: {medium}</p>
          <p>Low: {low}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const { bins, criticalBins, errorMessage, connectionState } =
    useCampusMonitoring();

  const highCount = bins.filter((bin) => bin.overallSeverity === "high").length;
  const mediumCount = bins.filter(
    (bin) => bin.overallSeverity === "medium",
  ).length;
  const lowCount = bins.filter((bin) => bin.overallSeverity === "low").length;
  const averageFill =
    bins.length > 0
      ? Math.round(bins.reduce((sum, bin) => sum + bin.fill, 0) / bins.length)
      : 0;
  const averageGas =
    bins.length > 0
      ? Math.round(bins.reduce((sum, bin) => sum + bin.gas, 0) / bins.length)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      {criticalBins.length > 0 ? (
        <section className="rounded-[30px] border border-rose-500/25 bg-[linear-gradient(135deg,rgba(127,29,29,0.42),rgba(15,23,42,0.9))] px-6 py-5 text-rose-50 shadow-[0_18px_50px_rgba(127,29,29,0.22)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-200">
            Critical Alert
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {criticalBins.length} bin{criticalBins.length === 1 ? "" : "s"} need
            immediate review.
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-8 text-rose-100/90">
            Priority locations: {criticalBins.slice(0, 5).map((bin) => bin.name).join(", ")}.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {[
          { label: "Total Bins", value: bins.length, tone: "cyan" },
          { label: "High Alert", value: highCount, tone: "rose" },
          { label: "Medium Level", value: mediumCount, tone: "amber" },
          { label: "Low Level", value: lowCount, tone: "emerald" },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[28px] border border-cyan-500/12 bg-[#0f1a30] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
              {item.value}
            </p>
            <div
              className={`mt-5 h-2 rounded-full ${
                item.tone === "rose"
                  ? "bg-rose-500/80"
                  : item.tone === "amber"
                    ? "bg-amber-400/80"
                    : item.tone === "emerald"
                      ? "bg-emerald-400/80"
                      : "bg-cyan-400/80"
              }`}
            />
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[30px] border border-cyan-500/12 bg-[#0f1a30] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Mini Map
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Campus deployment view
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                The first five locations follow live Firebase readings. The rest
                mirror the original HTML behavior with dependent simulation.
              </p>
            </div>
            <Link
              className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/15"
              href="/dashboard/map"
            >
              Open full map
            </Link>
          </div>
          <div className="mt-6 overflow-hidden rounded-[24px] border border-cyan-500/10">
            <CampusMap bins={bins} interactive={false} zoom={16} />
          </div>
        </article>

        <article className="rounded-[30px] border border-cyan-500/12 bg-[#0f1a30] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            High Alerts
          </p>
          <div className="mt-5 space-y-3">
            {criticalBins.length === 0 ? (
              <div className="rounded-[22px] border border-emerald-400/15 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
                No high alerts at the moment.
              </div>
            ) : (
              criticalBins.slice(0, 5).map((bin) => (
                <div
                  key={bin.id}
                  className="rounded-[22px] border border-rose-500/18 bg-rose-500/8 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{bin.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {bin.id}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className={`rounded-full border px-3 py-1 ${getSeverityClasses(bin.fillSeverity)}`}>
                        Fill {bin.fill.toFixed(0)}%
                      </span>
                      <span className={`rounded-full border px-3 py-1 ${getSeverityClasses(bin.gasSeverity)}`}>
                        Gas {bin.gas.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <MiniDonut
          high={highCount}
          low={lowCount}
          medium={mediumCount}
          label="Overall Severity"
        />
        <article className="rounded-[24px] border border-cyan-500/10 bg-[#0f1a30] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Live Averages
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Average fill</span>
                <span>{averageFill}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#00d4ff,#00ff88)]"
                  style={{ width: `${averageFill}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Average gas</span>
                <span>{averageGas}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,#ff9500,#ff3b3b)]"
                  style={{ width: `${averageGas}%` }}
                />
              </div>
            </div>
          </div>
        </article>
        <article className="rounded-[24px] border border-cyan-500/10 bg-[#0f1a30] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Monitor Notes
          </p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <p>Fill and gas use the original `high / medium / low` thresholds of 80 and 50.</p>
            <p>Locations 1 to 5 are treated as the live sensor cluster.</p>
            <p>
              Status: {connectionState === "live" ? "Firebase connected" : "running with simulated support"}.
            </p>
          </div>
        </article>
      </section>

      {errorMessage ? (
        <section className="rounded-[24px] border border-rose-500/18 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          {errorMessage}
        </section>
      ) : null}
    </div>
  );
}
