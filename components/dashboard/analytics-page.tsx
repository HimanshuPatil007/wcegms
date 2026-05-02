"use client";

import { useState } from "react";

import { useCampusMonitoring, type MonitoringBin } from "@/hooks/use-campus-monitoring";

function buildHistorySeries(seed: number) {
  const labels = ["6h ago", "5h ago", "4h ago", "3h ago", "2h ago", "1h ago", "Now"];

  return labels.map((label, index) => {
    const drift = Math.sin(index * 0.85 + seed) * 9 + (index - 3) * 2.1;
    return {
      label,
      fill: Math.max(0, Math.min(100, seed + drift)),
      gas: Math.max(0, Math.min(100, seed - drift / 1.8)),
      weight: Math.max(0, Math.min(100, seed - drift / 2.4 + 6)),
    };
  });
}

function getBarColor(value: number) {
  if (value >= 80) {
    return "bg-rose-500/80";
  }

  if (value >= 50) {
    return "bg-amber-400/80";
  }

  return "bg-emerald-400/80";
}

function buildPolyline(values: number[]) {
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - value;
      return `${x},${y}`;
    })
    .join(" ");
}

function getActiveBin(bins: MonitoringBin[], selectedId: string) {
  if (selectedId === "all") {
    return null;
  }

  return bins.find((bin) => bin.id === selectedId) ?? null;
}

export function AnalyticsPage() {
  const { bins } = useCampusMonitoring();
  const [selectedId, setSelectedId] = useState("all");

  const activeBin = getActiveBin(bins, selectedId);
  const labels = bins.map((bin) =>
    bin.name.replace(" Department", "").replace(" Hostel", ""),
  );
  const fillValues = bins.map((bin) => Math.round(bin.fill));
  const gasValues = bins.map((bin) => Math.round(bin.gas));
  const weightValues = bins.map((bin) => Math.round(bin.weightPercent));
  const fillHigh = bins.filter((bin) => bin.fillSeverity === "high").length;
  const fillMedium = bins.filter((bin) => bin.fillSeverity === "medium").length;
  const fillLow = bins.filter((bin) => bin.fillSeverity === "low").length;
  const gasHigh = bins.filter((bin) => bin.gasSeverity === "high").length;
  const gasMedium = bins.filter((bin) => bin.gasSeverity === "medium").length;
  const gasLow = bins.filter((bin) => bin.gasSeverity === "low").length;
  const weightHigh = bins.filter((bin) => bin.weightSeverity === "high").length;
  const weightMedium = bins.filter((bin) => bin.weightSeverity === "medium").length;
  const weightLow = bins.filter((bin) => bin.weightSeverity === "low").length;
  const averageFill =
    bins.length > 0
      ? bins.reduce((sum, bin) => sum + bin.fill, 0) / bins.length
      : 50;
  const averageGas =
    bins.length > 0 ? bins.reduce((sum, bin) => sum + bin.gas, 0) / bins.length : 50;
  const averageWeight =
    bins.length > 0
      ? bins.reduce((sum, bin) => sum + bin.weightPercent, 0) / bins.length
      : 50;
  const historySeed = activeBin
    ? (activeBin.fill + activeBin.gas + activeBin.weightPercent) / 3
    : (averageFill + averageGas + averageWeight) / 3;
  const history = buildHistorySeries(historySeed);

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.3em] text-amber-200 xl:text-lg">
            Analytics
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm text-slate-300">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            History Focus
          </span>
          <select
            className="rounded-xl border border-white/10 bg-[#172337] px-4 py-3 text-white outline-none"
            onChange={(event) => setSelectedId(event.target.value)}
            value={selectedId}
          >
            <option value="all">All bins overview</option>
            {bins.map((bin) => (
              <option key={bin.id} value={bin.id}>
                {bin.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-cyan-500/10 bg-[#101b33] p-5">
          <p className="text-sm font-semibold text-white">Fill level by location</p>
          <div className="mt-5 space-y-3">
            {labels.map((label, index) => (
              <div key={`${label}-fill`}>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{label}</span>
                  <span>{fillValues[index]}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${getBarColor(fillValues[index])}`}
                    style={{ width: `${fillValues[index]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-cyan-500/10 bg-[#101b33] p-5">
          <p className="text-sm font-semibold text-white">Gas level by location</p>
          <div className="mt-5 space-y-3">
            {labels.map((label, index) => (
              <div key={`${label}-gas`}>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{label}</span>
                  <span>{gasValues[index]}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${getBarColor(gasValues[index])}`}
                    style={{ width: `${gasValues[index]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-cyan-500/10 bg-[#101b33] p-5">
          <p className="text-sm font-semibold text-white">Weight level by location</p>
          <div className="mt-5 space-y-3">
            {labels.map((label, index) => (
              <div key={`${label}-weight`}>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{label}</span>
                  <span>{weightValues[index]}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${getBarColor(weightValues[index])}`}
                    style={{ width: `${weightValues[index]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-cyan-500/10 bg-[#101b33] p-5">
          <p className="text-sm font-semibold text-white">Fill severity distribution</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "High", value: fillHigh, tone: "bg-rose-500/15 text-rose-100" },
              { label: "Medium", value: fillMedium, tone: "bg-amber-400/15 text-amber-100" },
              { label: "Low", value: fillLow, tone: "bg-emerald-400/15 text-emerald-100" },
            ].map((item) => (
              <div key={item.label} className={`rounded-[18px] px-4 py-5 ${item.tone}`}>
                <p className="text-xs uppercase tracking-[0.18em]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-cyan-500/10 bg-[#101b33] p-5">
          <p className="text-sm font-semibold text-white">Gas severity distribution</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "High", value: gasHigh, tone: "bg-rose-500/15 text-rose-100" },
              { label: "Medium", value: gasMedium, tone: "bg-amber-400/15 text-amber-100" },
              { label: "Low", value: gasLow, tone: "bg-emerald-400/15 text-emerald-100" },
            ].map((item) => (
              <div key={item.label} className={`rounded-[18px] px-4 py-5 ${item.tone}`}>
                <p className="text-xs uppercase tracking-[0.18em]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-cyan-500/10 bg-[#101b33] p-5">
          <p className="text-sm font-semibold text-white">Weight severity distribution</p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "High", value: weightHigh, tone: "bg-rose-500/15 text-rose-100" },
              { label: "Medium", value: weightMedium, tone: "bg-amber-400/15 text-amber-100" },
              { label: "Low", value: weightLow, tone: "bg-emerald-400/15 text-emerald-100" },
            ].map((item) => (
              <div key={item.label} className={`rounded-[18px] px-4 py-5 ${item.tone}`}>
                <p className="text-xs uppercase tracking-[0.18em]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-cyan-500/10 bg-[#101b33] p-5 xl:col-span-2">
          <p className="text-sm font-semibold text-white">History trend</p>
          <p className="mt-2 text-sm text-slate-400">
            {activeBin
              ? `Trend emphasis for ${activeBin.name}`
              : "Trend emphasis for the current network average"}
          </p>
          <div className="mt-5 rounded-[20px] border border-white/6 bg-[#091121] p-4">
            <svg className="h-64 w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polyline
                fill="none"
                points={buildPolyline(history.map((point) => point.fill))}
                stroke="#00d4ff"
                strokeWidth="2"
              />
              <polyline
                fill="none"
                points={buildPolyline(history.map((point) => point.gas))}
                stroke="#ff9500"
                strokeWidth="2"
              />
              <polyline
                fill="none"
                points={buildPolyline(history.map((point) => point.weight))}
                stroke="#8b5cf6"
                strokeWidth="2"
              />
            </svg>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00d4ff]" />
                Fill
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff9500]" />
                Gas
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6]" />
                Weight
              </span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2 text-center text-[11px] text-slate-500">
              {history.map((point) => (
                <span key={point.label}>{point.label}</span>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
