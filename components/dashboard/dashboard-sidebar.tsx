"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

const navigationGroups = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "Overview",
      },
      {
        label: "All Bins",
        href: "/dashboard/bins",
        icon: "Bins",
      },
    ],
  },
  {
    label: "Monitor",
    items: [
      {
        label: "Alerts",
        href: "/dashboard/alerts",
        icon: "Alerts",
      },
      {
        label: "Map View",
        href: "/dashboard/map",
        icon: "Map",
      },
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: "Charts",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: "Manage",
      },
    ],
  },
];

function isActiveLink(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { alertCount, connectionState } = useCampusMonitoring();

  return (
    <aside className="animate-rise-in flex h-full flex-col rounded-[32px] border border-cyan-500/15 bg-[linear-gradient(180deg,#091121_0%,#060b14_100%)] px-4 py-5 text-slate-50 shadow-[0_24px_80px_rgba(2,6,23,0.45)] sm:px-5 sm:py-6">
      <div className="rounded-[28px] border border-cyan-500/18 bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(0,255,136,0.05))] p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#00d4ff,#00ff88)] text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(0,212,255,0.35)]">
          GMS
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
          WCE Sangli
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Smart Campus Waste
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Realtime fill and gas monitoring inspired by the original campus
          control console.
        </p>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-5">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
              {group.label}
            </p>
            <div className="mt-3 space-y-2">
              {group.items.map((item) => {
                const active = isActiveLink(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    className={`surface-hover flex items-center gap-3 rounded-[18px] border px-4 py-3 transition ${
                      active
                        ? "border-cyan-400/35 bg-cyan-400/12 text-cyan-100 shadow-[0_0_28px_rgba(0,212,255,0.14)]"
                        : "border-white/8 bg-white/[0.03] text-slate-300 hover:border-cyan-500/20 hover:bg-white/[0.05] hover:text-white"
                    }`}
                    href={item.href}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.label === "Alerts" ? (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {alertCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
          Link State
        </p>
        <p className="mt-2 text-sm text-white">
          {connectionState === "live"
            ? "Firebase telemetry is active."
            : connectionState === "demo"
              ? "Demo mode is running locally."
              : connectionState === "error"
                ? "Live sync needs attention."
                : "Connecting to the feed..."}
        </p>
      </div>
    </aside>
  );
}
