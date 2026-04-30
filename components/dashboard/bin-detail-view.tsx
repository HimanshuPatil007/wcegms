"use client";

import Link from "next/link";

import { useBinDetail } from "@/hooks/use-bin-detail";
import {
  GAS_HAZARD_THRESHOLD,
  getFillStatus,
  getGasStatus,
  getStatusClasses,
  getStatusTone,
  isCriticalBin,
} from "@/lib/bin-status";

type BinDetailViewProps = {
  binId: string;
};

function clampPercentage(value: number) {
  return Math.max(0, Math.min(value, 100));
}

function formatWeight(weightInGrams: number) {
  if (weightInGrams >= 1000) {
    return `${(weightInGrams / 1000).toFixed(2)} kg`;
  }

  return `${weightInGrams.toFixed(0)} g`;
}

function getWeightScale(weightInGrams: number) {
  return Math.max(8, Math.min((weightInGrams / 20000) * 100, 100));
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "sky" | "rose";
}) {
  const styles = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
  } satisfies Record<"emerald" | "amber" | "sky" | "rose", string>;

  return (
    <div className={`rounded-full border px-4 py-2 text-sm font-semibold ${styles[tone]}`}>
      {label}: {value}
    </div>
  );
}

export function BinDetailView({ binId }: BinDetailViewProps) {
  const { bin, isLoading, errorMessage, notFound } = useBinDetail(binId);

  if (isLoading) {
    return (
      <div className="rounded-[34px] border border-white/70 bg-white/92 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
        <div className="animate-pulse space-y-5">
          <div className="h-4 w-28 rounded-full bg-slate-200" />
          <div className="h-10 w-56 rounded-full bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={`detail-skeleton-${index}`}
                className="h-28 rounded-[24px] bg-slate-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <section className="rounded-[32px] border border-rose-200 bg-rose-50 px-8 py-7 shadow-[0_16px_40px_rgba(244,63,94,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
          Bin Detail Error
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-rose-950">
          We could not load this bin right now.
        </h1>
        <p className="mt-3 text-sm leading-8 text-rose-800">{errorMessage}</p>
      </section>
    );
  }

  if (notFound || !bin) {
    return (
      <section className="rounded-[32px] border border-slate-200 bg-white/92 px-8 py-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Bin Not Found
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          No realtime record exists for {binId}.
        </h1>
        <p className="mt-3 text-sm leading-8 text-slate-600">
          Check the bin ID or add the corresponding record under the `bins`
          node in Firebase Realtime Database.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </section>
    );
  }

  const fillLevel = clampPercentage(bin.fillLevel);
  const gasLevel = clampPercentage(bin.gasLevel);
  const weightScale = getWeightScale(bin.weight);
  const fillStatus = getFillStatus(fillLevel);
  const gasStatus = getGasStatus(bin.gasLevel);
  const critical = isCriticalBin(bin);

  return (
    <div className="flex flex-col gap-6">
      <section
        className={`rounded-[34px] border bg-white/92 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 ${
          critical ? "border-rose-200 ring-2 ring-rose-100" : "border-white/70"
        }`}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Link
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              href="/dashboard"
            >
              Back to dashboard
            </Link>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Bin Detail View
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              {bin.binId}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
              Full sensor detail for this smart garbage bin, including live
              fill, gas, weight, coordinate data, and status-ready indicators.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatusPill label="Stream" tone="emerald" value="Live" />
            <StatusPill
              label="Fill"
              tone={getStatusTone(fillStatus)}
              value={fillStatus}
            />
            <StatusPill
              label="Gas"
              tone={getStatusTone(gasStatus)}
              value={gasStatus}
            />
            <StatusPill label="Coordinates" tone="sky" value="Available" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4">
        {[
          {
            label: "Fill Level",
            value: `${fillLevel.toFixed(0)}%`,
            description: "Current bin capacity usage from the realtime feed.",
          },
          {
            label: "Gas Level",
            value: `${bin.gasLevel.toFixed(0)}`,
            description: "Latest gas sensor reading reported by the bin.",
          },
          {
            label: "Weight",
            value: `${bin.weight.toFixed(0)} g`,
            description: `Approximate visual conversion: ${formatWeight(bin.weight)}`,
          },
          {
            label: "Location",
            value: `${bin.location.latitude.toFixed(4)}, ${bin.location.longitude.toFixed(4)}`,
            description: "Live latitude and longitude for map plotting and routing.",
          },
        ].map((metric) => (
          <article
            key={metric.label}
            className="rounded-[28px] border border-white/70 bg-white/92 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {metric.label}
            </p>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              {metric.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {metric.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[34px] border border-white/70 bg-white/92 p-7 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Status Snapshot
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Live metric visualization for this bin
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
            This trend-ready panel gives a quick visual scan of the current
            sensor readings while we build richer historical charts later.
          </p>

          <div className="mt-8 space-y-6">
            {[
              {
                label: "Fill level",
                value: fillLevel,
                valueText: `${fillLevel.toFixed(0)}%`,
                gradient:
                  fillStatus === "Full"
                    ? "from-amber-500 via-orange-400 to-rose-500"
                    : fillStatus === "Medium"
                      ? "from-lime-400 via-amber-400 to-orange-400"
                      : "from-emerald-500 via-lime-400 to-cyan-400",
              },
              {
                label: "Gas level",
                value: gasLevel,
                valueText: `${bin.gasLevel.toFixed(0)}`,
                gradient:
                  gasStatus === "Hazard"
                    ? "from-rose-500 via-orange-400 to-amber-300"
                    : gasStatus === "Elevated"
                      ? "from-amber-500 via-orange-400 to-yellow-300"
                      : "from-sky-500 via-cyan-400 to-emerald-400",
              },
              {
                label: "Weight load",
                value: weightScale,
                valueText: formatWeight(bin.weight),
                gradient: "from-fuchsia-500 via-rose-400 to-orange-400",
              },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{metric.label}</span>
                  <span>{metric.valueText}</span>
                </div>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${metric.gradient} transition-[width] duration-500`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[34px] border border-slate-900/8 bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Detail Notes
          </p>
          <div className="mt-5 space-y-4">
            {[
              "This page stays connected to Firebase and updates if the selected bin changes.",
              "Fill status uses Low, Medium, and Full thresholds with full starting at 80 percent.",
              `Gas hazard status starts at ${GAS_HAZARD_THRESHOLD} and is highlighted in red when breached.`,
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-7 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                getStatusTone(fillStatus),
              )}`}
            >
              Fill: {fillStatus}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                getStatusTone(gasStatus),
              )}`}
            >
              Gas: {gasStatus}
            </span>
            {critical ? (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-800">
                Immediate Review
              </span>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}
