"use client";

import { CampusMap } from "@/components/dashboard/campus-map";
import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

export function MapPage() {
  const { bins } = useCampusMonitoring();

  return (
    <section className="rounded-[30px] border border-cyan-500/12 bg-[#0f1a30] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
          Map View
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Full campus map
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Marker color follows the highest severity between fill and gas, just
          like the attached reference dashboard.
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-cyan-500/10">
        <CampusMap bins={bins} />
      </div>
    </section>
  );
}
