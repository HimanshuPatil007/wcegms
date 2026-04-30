import Link from "next/link";

import {
  getFillStatus,
  getGasStatus,
  getStatusClasses,
  getStatusTone,
  isCriticalBin,
} from "@/lib/bin-status";
import type { GarbageBin } from "@/lib/firebase/types";

type BinCardProps = {
  bin: GarbageBin;
};

function formatWeight(weightInGrams: number) {
  if (weightInGrams >= 1000) {
    return `${(weightInGrams / 1000).toFixed(2)} kg`;
  }

  return `${weightInGrams.toFixed(0)} g`;
}

function clampFillLevel(fillLevel: number) {
  return Math.max(0, Math.min(fillLevel, 100));
}

export function BinCard({ bin }: BinCardProps) {
  const fillLevel = clampFillLevel(bin.fillLevel);
  const fillStatus = getFillStatus(fillLevel);
  const gasStatus = getGasStatus(bin.gasLevel);
  const critical = isCriticalBin(bin);

  return (
    <article
      className={`rounded-[28px] border bg-white/92 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur ${
        critical ? "border-rose-200 ring-2 ring-rose-100" : "border-white/70"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Bin ID
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {bin.binId}
          </h3>
          {bin.locationName ? (
            <p className="mt-2 text-sm font-medium text-slate-600">
              {bin.locationName}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Live
          </div>
          {critical ? (
            <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
              Critical
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
          <span>Fill Level</span>
          <span>{fillLevel.toFixed(0)}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#10b981_0%,#34d399_40%,#f59e0b_76%,#ef4444_100%)] transition-[width] duration-500"
            style={{ width: `${fillLevel}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Gas Level
            </p>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                getStatusTone(gasStatus),
              )}`}
            >
              {gasStatus}
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {bin.gasLevel.toFixed(0)}
          </p>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-slate-50/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Weight
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {bin.weight.toFixed(0)} g
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {formatWeight(bin.weight)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
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
      </div>

      <div className="mt-5 rounded-[22px] border border-sky-200 bg-sky-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
          Location
        </p>
        {bin.locationName ? (
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-800">
            {bin.locationName}
          </p>
        ) : null}
        <p className={`${bin.locationName ? "" : "mt-2 "}text-sm leading-7 text-slate-700`}>
          Latitude: {bin.location.latitude.toFixed(5)}
        </p>
        <p className="text-sm leading-7 text-slate-700">
          Longitude: {bin.location.longitude.toFixed(5)}
        </p>
      </div>

      <Link
        className="mt-5 inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        href={`/dashboard/bins/${encodeURIComponent(bin.binId)}`}
      >
        View details
      </Link>
    </article>
  );
}
