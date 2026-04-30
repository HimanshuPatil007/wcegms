"use client";

import { BinCard } from "@/components/dashboard/bin-card";
import { BinCardSkeleton } from "@/components/dashboard/bin-card-skeleton";
import { BinMap } from "@/components/dashboard/bin-map";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { useBins } from "@/hooks/use-bins";
import {
  GAS_HAZARD_THRESHOLD,
  getFillStatus,
  getGasStatus,
  isCriticalBin,
} from "@/lib/bin-status";

function formatAverageFill(totalFillLevel: number, count: number) {
  if (count === 0) {
    return "--";
  }

  return `${Math.round(totalFillLevel / count)}%`;
}

function getTotalWeight(bins: ReturnType<typeof useBins>["bins"]) {
  const totalWeight = bins.reduce((sum, bin) => sum + bin.weight, 0);

  if (totalWeight >= 1000) {
    return `${(totalWeight / 1000).toFixed(1)} kg`;
  }

  return `${totalWeight.toFixed(0)} g`;
}

export function DashboardOverview() {
  const { bins, isLoading, errorMessage } = useBins();

  const totalFillLevel = bins.reduce((sum, bin) => sum + bin.fillLevel, 0);
  const criticalBins = bins.filter(isCriticalBin);
  const fullBins = bins.filter((bin) => getFillStatus(bin.fillLevel) === "Full");
  const mediumBins = bins.filter(
    (bin) => getFillStatus(bin.fillLevel) === "Medium",
  );
  const lowBins = bins.filter((bin) => getFillStatus(bin.fillLevel) === "Low");
  const hazardBins = bins.filter(
    (bin) => getGasStatus(bin.gasLevel) === "Hazard",
  );
  const averageGasLevel =
    bins.length > 0
      ? `${Math.round(
          bins.reduce((sum, bin) => sum + bin.gasLevel, 0) / bins.length,
        )}`
      : "--";

  return (
    <div className="flex flex-col gap-6">
      {!isLoading && criticalBins.length > 0 ? (
        <section className="animate-rise-in rounded-[32px] border border-rose-200 bg-[linear-gradient(135deg,#fff1f2_0%,#ffe4e6_100%)] px-5 py-5 text-rose-900 shadow-[0_18px_50px_rgba(244,63,94,0.10)] sm:px-6 sm:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-700">
            Critical Alert Banner
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-rose-950">
            {criticalBins.length} critical bin{criticalBins.length === 1 ? "" : "s"} require immediate attention.
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-8 text-rose-800 sm:text-base">
            Full bins use the 80%+ threshold and gas hazards use the {GAS_HAZARD_THRESHOLD}+ threshold.
            Prioritize pickup or inspection for {criticalBins.map((bin) => bin.binId).join(", ")}.
          </p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4 xl:gap-5">
        <DashboardStatCard
          description="Live count of bins currently streamed from Firebase Realtime Database."
          label="Connected Bins"
          tone="emerald"
          value={isLoading ? "--" : `${bins.length}`}
        />
        <DashboardStatCard
          description="Average fill level across all monitored garbage bins, with 80 percent and above treated as full."
          label="Average Fill"
          tone="amber"
          value={isLoading ? "--" : formatAverageFill(totalFillLevel, bins.length)}
        />
        <DashboardStatCard
          description="Count of bins that have crossed the full threshold and need collection priority."
          label="Full Bins"
          tone="rose"
          value={isLoading ? "--" : `${fullBins.length}`}
        />
        <DashboardStatCard
          description={`Gas hazard threshold is ${GAS_HAZARD_THRESHOLD}. Elevated gas can be reviewed on bin cards and details.`}
          label="Gas Hazards"
          tone="sky"
          value={isLoading ? "--" : `${hazardBins.length}`}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        <DashboardStatCard
          description="Average gas reading from the current realtime feed."
          label="Average Gas"
          tone="rose"
          value={isLoading ? "--" : averageGasLevel}
        />
        <DashboardStatCard
          description="Total measured weight from all reported bins in grams or kilograms."
          label="Total Weight"
          tone="sky"
          value={isLoading ? "--" : getTotalWeight(bins)}
        />
        <DashboardStatCard
          description="Bins between 50 percent and 80 percent are marked as medium."
          label="Medium Fill"
          tone="amber"
          value={isLoading ? "--" : `${mediumBins.length}`}
        />
        <DashboardStatCard
          description="Bins below 50 percent are considered low and are shown in green."
          label="Low Fill"
          tone="emerald"
          value={isLoading ? "--" : `${lowBins.length}`}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="surface-hover rounded-[34px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                Realtime Bin Feed
              </div>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Live garbage bin monitoring grid
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                These cards are subscribed to Firebase in realtime and will
                update automatically as bin sensor values change.
              </p>
            </div>

            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
              {isLoading
                ? "Connecting to realtime feed..."
                : `Last update: ${bins.length} bin${bins.length === 1 ? "" : "s"} loaded`}
            </div>
          </div>
        </article>

        <article className="surface-hover rounded-[34px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Feed Notes
          </p>
          <div className="mt-5 space-y-4">
            {[
              "Fill levels use Low (0-50), Medium (50-80), and Full (80+) thresholds.",
              `Gas levels use Safe, Elevated, and Hazard states with ${GAS_HAZARD_THRESHOLD} as the hazard threshold.`,
              "Critical bins are highlighted across the dashboard when either threshold becomes severe.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-7 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      {errorMessage ? (
        <section className="animate-rise-in rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-rose-700 shadow-[0_12px_30px_rgba(244,63,94,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em]">
            Realtime Feed Error
          </p>
          <p className="mt-2 text-sm leading-7">{errorMessage}</p>
        </section>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="surface-hover rounded-[34px] border border-white/70 bg-white/92 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
                Interactive Map
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Live bin locations across the deployment area
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                Each marker is plotted from bin latitude and longitude. Click a
                marker to inspect bin ID, fill level, gas level, and weight.
              </p>
            </div>

            <div className="rounded-[24px] border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm text-sky-900">
              {isLoading
                ? "Preparing live map..."
                : `${bins.length} mapped bin${bins.length === 1 ? "" : "s"}`}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
            <BinMap bins={bins} isLoading={isLoading} />
          </div>
        </article>

        <article className="surface-hover rounded-[34px] border border-slate-900/8 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
            Map Popups
          </p>
          <div className="mt-5 space-y-4">
            {[
              "Every marker popup shows bin ID, fill level, gas level, and weight.",
              "The map center adjusts automatically from the current bin coordinates.",
              "This module is loaded client-side only to avoid Leaflet SSR issues.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-7 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 xl:gap-5">
        {isLoading
          ? Array.from({ length: 6 }, (_, index) => (
              <BinCardSkeleton key={`bin-skeleton-${index}`} />
            ))
          : bins.map((bin) => <BinCard key={bin.binId} bin={bin} />)}
      </section>

      {!isLoading && bins.length === 0 ? (
        <section className="animate-rise-in rounded-[32px] border border-slate-200 bg-white/90 p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            No Bins Found
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            The realtime database is connected, but no bin records are available yet.
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            Add bin data under the `bins` node in Firebase Realtime Database to
            populate this live dashboard grid.
          </p>
        </section>
      ) : null}
    </div>
  );
}
