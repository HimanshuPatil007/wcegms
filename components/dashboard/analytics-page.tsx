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
  const fillHigh = bins.filter((bin) => bin.fillSeverity === "high").length;
  const fillMedium = bins.filter((bin) => bin.fillSeverity === "medium").length;
  const fillLow = bins.filter((bin) => bin.fillSeverity === "low").length;
  const gasHigh = bins.filter((bin) => bin.gasSeverity === "high").length;
  const gasMedium = bins.filter((bin) => bin.gasSeverity === "medium").length;
  const gasLow = bins.filter((bin) => bin.gasSeverity === "low").length;
  const averageFill =
    bins.length > 0
      ? bins.reduce((sum, bin) => sum + bin.fill, 0) / bins.length
      : 50;
  const history = buildHistorySeries(activeBin ? activeBin.fill : averageFill);

  return (
    <section className="rounded-[30px] border border-cyan-500/12 bg-[#0f1a30] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
            Analytics
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Fill and gas breakdown
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            This mirrors the original reference view with bar summaries,
            distribution panels, and a trend-style history selector.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm text-slate-300">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            History Focus
          </span>
          <select
            className="rounded-xl border border-cyan-500/15 bg-[#101b33] px-4 py-3 text-white outline-none"
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
            </svg>
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
