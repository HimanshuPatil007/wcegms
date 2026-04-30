"use client";

import dynamic from "next/dynamic";

import type { MonitoringBin } from "@/hooks/use-campus-monitoring";

const CampusMapCanvas = dynamic(
  () =>
    import("@/components/dashboard/campus-map-canvas").then(
      (module) => module.CampusMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[260px] items-center justify-center rounded-[24px] border border-cyan-500/20 bg-[#0f1a30] text-sm text-slate-300">
        Preparing map surface...
      </div>
    ),
  },
);

export function CampusMap({
  bins,
  interactive = true,
  zoom,
}: {
  bins: MonitoringBin[];
  interactive?: boolean;
  zoom?: number;
}) {
  return <CampusMapCanvas bins={bins} interactive={interactive} zoom={zoom} />;
}
