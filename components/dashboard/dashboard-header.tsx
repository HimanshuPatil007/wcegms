"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/hooks/use-auth";
import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";
import { useWorkforce } from "@/hooks/use-workforce";

function getDisplayName(
  name: string | null | undefined,
  email: string | null | undefined,
) {
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
  const { accessRole, currentEmployee } = useWorkforce();
  const displayName = getDisplayName(user?.displayName, user?.email);
  const statusLabel =
    connectionState === "live"
      ? "Live Feed"
      : connectionState === "demo"
        ? "Demo Mode"
        : connectionState === "error"
          ? "Attention Needed"
          : "Connecting";

  return (
    <header className="animate-rise-in relative overflow-hidden rounded-[36px] border border-white/8 bg-[linear-gradient(135deg,rgba(14,25,42,0.94),rgba(10,18,31,0.92))] px-5 py-5 text-white shadow-[0_24px_80px_rgba(2,6,23,0.48)] backdrop-blur md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.12),transparent_28%),radial-gradient(circle_at_right,rgba(245,158,11,0.08),transparent_20%),linear-gradient(90deg,transparent,rgba(255,255,255,0.02),transparent)]" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/14 bg-teal-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-50">
            <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.9)]" />
            Smart Operations Center
          </div>
          <div>
            <h2 className="text-2xl font-semibold uppercase tracking-[0.02em] text-white sm:text-3xl">
              WCE Garbage Management System
            </h2>
          </div>
        </div>

        <div className="surface-hover flex max-w-[340px] flex-col items-start gap-3 rounded-[24px] border border-white/8 bg-white/[0.05] px-4 py-4 md:items-end">
          <div className="text-left md:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Feed Status
            </p>
            <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-teal-300/12 bg-teal-400/10 px-3 py-1 text-sm font-medium text-teal-50">
              <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,0.9)]" />
              {statusLabel}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">{lastUpdatedLabel}</p>
          </div>

          <div className="h-px w-full bg-white/8" />

          <div className="text-left md:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Signed In As
            </p>
            <p className="mt-1 text-sm font-medium text-white">{displayName}</p>
            <p className="text-[11px] text-slate-400">
              {user?.email ?? "No email available"}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
              {accessRole === "admin"
                ? "Admin Access"
                : accessRole === "employee"
                  ? `${currentEmployee?.role ?? "Employee"} Access`
                  : "User Access"}
            </p>
          </div>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
