"use client";

import dynamic from "next/dynamic";

import type { GarbageBin } from "@/lib/firebase/types";

const BinMapCanvas = dynamic(
  () =>
    import("@/components/dashboard/bin-map-canvas").then(
      (module) => module.BinMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef5f3_100%)] text-sm font-medium text-slate-500">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-5 py-3 shadow-sm">
          <span className="animate-soft-pulse inline-block h-2.5 w-2.5 rounded-full bg-sky-500" />
          Loading interactive map...
        </div>
      </div>
    ),
  },
);

type BinMapProps = {
  bins: GarbageBin[];
  isLoading: boolean;
};

export function BinMap({ bins, isLoading }: BinMapProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top,#f8fafc_0%,#eef5f3_100%)] text-sm font-medium text-slate-500">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-5 py-3 shadow-sm">
          <span className="animate-soft-pulse inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Connecting map to realtime bin locations...
        </div>
      </div>
    );
  }

  if (bins.length === 0) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-200 bg-slate-50 px-6 text-center text-sm leading-7 text-slate-500">
        No bin locations are available yet. Add latitude and longitude values in
        Firebase to display live markers here.
      </div>
    );
  }

  return <BinMapCanvas bins={bins} />;
}
