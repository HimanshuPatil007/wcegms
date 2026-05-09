"use client";

import { useState } from "react";

import { CampusMap } from "@/components/dashboard/campus-map";
import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

export function MapPage() {
  const { bins, inactiveBinCount, truck } = useCampusMonitoring();
  const [showInactiveBins, setShowInactiveBins] = useState(true);

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-base font-semibold uppercase tracking-[0.3em] text-amber-200 xl:text-lg">
            Map View
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Full campus map
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Inactive bins stay visible in sky blue and can be hidden whenever needed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
            {inactiveBinCount} inactive bin{inactiveBinCount === 1 ? "" : "s"}
          </div>
          <button
            className="rounded-full bg-[linear-gradient(135deg,#38bdf8,#0ea5e9)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            onClick={() => setShowInactiveBins((previous) => !previous)}
            type="button"
          >
            {showInactiveBins ? "Hide Inactive Bins" : "Show Inactive Bins"}
          </button>
        </div>
      </div>

      <div className="mb-7 grid gap-5 xl:grid-cols-3">
        <div className="rounded-[26px] border border-cyan-500/12 bg-black/20 px-5 py-5 xl:px-6 xl:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Truck Status
          </p>
          <p className="mt-3 text-2xl font-semibold text-white xl:text-[2rem]">
            {truck ? truck.status ?? "Tracking" : "Waiting for GPS feed"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {truck ? truck.lastSeenLabel : "No live truck coordinates found yet."}
          </p>
        </div>
        <div className="rounded-[26px] border border-cyan-500/12 bg-black/20 px-5 py-5 xl:px-6 xl:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Latitude
          </p>
          <p className="mt-3 text-2xl font-semibold text-white xl:text-[2rem]">
            {truck ? truck.latitude.toFixed(5) : "--"}
          </p>
        </div>
        <div className="rounded-[26px] border border-cyan-500/12 bg-black/20 px-5 py-5 xl:px-6 xl:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Longitude
          </p>
          <p className="mt-3 text-2xl font-semibold text-white xl:text-[2rem]">
            {truck ? truck.longitude.toFixed(5) : "--"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-cyan-500/10">
        <CampusMap
          bins={bins}
          heightClass="min-h-[760px]"
          showInactiveBins={showInactiveBins}
          truck={truck}
        />
      </div>
    </section>
  );
}
