"use client";

import dynamic from "next/dynamic";

import type { LiveTruck, MonitoringBin } from "@/hooks/use-campus-monitoring";

const CampusMapCanvas = dynamic(
  () =>
    import("@/components/dashboard/campus-map-canvas").then(
      (module) => module.CampusMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(180deg,#0f1a30_0%,#091224_100%)] text-sm text-slate-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_35%)]" />
        <div className="relative flex items-center gap-3 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.8)]" />
          Preparing map surface...
        </div>
      </div>
    ),
  },
);

export function CampusMap({
  bins,
  truck,
  interactive = true,
  heightClass,
  zoom,
  showInactiveBins = true,
}: {
  bins: MonitoringBin[];
  truck: LiveTruck | null;
  interactive?: boolean;
  heightClass?: string;
  zoom?: number;
  showInactiveBins?: boolean;
}) {
  return (
    <CampusMapCanvas
      bins={bins}
      heightClass={heightClass}
      interactive={interactive}
      showInactiveBins={showInactiveBins}
      truck={truck}
      zoom={zoom}
    />
  );
}
