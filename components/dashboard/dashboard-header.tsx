"use client";

import { useAuth } from "@/hooks/use-auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

function getDisplayName(name: string | null | undefined, email: string | null | undefined) {
  if (name?.trim()) {
    return name.trim();
  }

  if (email?.trim()) {
    return email.trim();
  }

  return "Operations User";
}

export function DashboardHeader() {
  const { user } = useAuth();
  const { connectionState, lastUpdatedLabel } = useCampusMonitoring();
  const displayName = getDisplayName(user?.displayName, user?.email);

  return (
    <header className="animate-rise-in flex flex-col gap-5 rounded-[32px] border border-cyan-500/15 bg-[rgba(9,17,33,0.92)] px-5 py-5 text-white shadow-[0_20px_70px_rgba(2,6,23,0.42)] backdrop-blur md:flex-row md:items-center md:justify-between md:px-6 md:py-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
            Waste Control Deck
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            <span className="animate-soft-pulse inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
            {connectionState === "live"
              ? "Live Telemetry"
              : connectionState === "demo"
                ? "Demo Telemetry"
                : connectionState === "error"
                  ? "Sync Error"
                  : "Connecting"}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            WCE garbage management system
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">
            Track campus bin conditions, prioritize alerts, and manage sensor
            locations from one synced control surface.
          </p>
        </div>
      </div>

      <div className="surface-hover flex flex-col items-start gap-4 rounded-[26px] border border-white/10 bg-white/[0.04] px-5 py-4 md:items-end">
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Feed Status
          </p>
          <p className="mt-2 text-base font-semibold text-white">
            {connectionState === "live"
              ? "Live Feed"
              : connectionState === "demo"
                ? "Demo Mode"
                : connectionState === "error"
                  ? "Attention Needed"
                  : "Connecting"}
          </p>
          <p className="text-sm text-slate-400">{lastUpdatedLabel}</p>
        </div>
        <div className="h-px w-full bg-white/10" />
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Signed In As
          </p>
          <p className="mt-2 text-base font-semibold text-white">
            {displayName}
          </p>
          <p className="text-sm text-slate-400">{user?.email ?? "No email available"}</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
