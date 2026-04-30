"use client";

import { useAuth } from "@/hooks/use-auth";
import { LogoutButton } from "@/components/auth/logout-button";

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
  const displayName = getDisplayName(user?.displayName, user?.email);

  return (
    <header className="animate-rise-in flex flex-col gap-5 rounded-[32px] border border-white/70 bg-white/88 px-5 py-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between md:px-6 md:py-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Dashboard Workspace
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            <span className="animate-soft-pulse inline-block h-2.5 w-2.5 rounded-full bg-sky-500" />
            Live Telemetry
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            City waste monitoring control center
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
            Review live garbage bin activity, track field conditions, and
            coordinate collection operations from a single responsive layout.
          </p>
        </div>
      </div>

      <div className="surface-hover flex flex-col items-start gap-4 rounded-[26px] border border-slate-200 bg-slate-50/90 px-5 py-4 md:items-end">
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Signed In As
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {displayName}
          </p>
          <p className="text-sm text-slate-500">{user?.email ?? "No email available"}</p>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
