"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";
import { useWorkforce } from "@/hooks/use-workforce";

function getNavigationGroups(accessRole: "admin" | "employee" | "user") {
  if (accessRole === "admin") {
    return [
      {
        label: "Main",
        items: [
          { label: "Dashboard", href: "/dashboard", icon: "Overview" },
          { label: "Tasks", href: "/dashboard/tasks", icon: "Tasks" },
          { label: "All Bins", href: "/dashboard/bins", icon: "Bins" },
        ],
      },
      {
        label: "Monitor",
        items: [
          { label: "Alerts", href: "/dashboard/alerts", icon: "Alerts" },
          { label: "Map View", href: "/dashboard/map", icon: "Map" },
          { label: "Analytics", href: "/dashboard/analytics", icon: "Charts" },
          { label: "Issue Reports", href: "/dashboard/issues", icon: "Reports" },
        ],
      },
      {
        label: "System",
        items: [
          { label: "Users", href: "/dashboard/users", icon: "Users" },
          { label: "Employees", href: "/dashboard/employees", icon: "People" },
          { label: "Settings", href: "/dashboard/settings", icon: "Manage" },
        ],
      },
    ];
  }

  if (accessRole === "employee") {
    return [
      {
        label: "Main",
        items: [
          { label: "Dashboard", href: "/dashboard", icon: "Overview" },
          { label: "Tasks", href: "/dashboard/tasks", icon: "Tasks" },
          { label: "All Bins", href: "/dashboard/bins", icon: "Bins" },
        ],
      },
      {
        label: "Monitor",
        items: [
          { label: "Alerts", href: "/dashboard/alerts", icon: "Alerts" },
          { label: "Map View", href: "/dashboard/map", icon: "Map" },
          { label: "Issue Reports", href: "/dashboard/issues", icon: "Reports" },
        ],
      },
    ];
  }

  return [
    {
      label: "Main",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "Overview" },
        { label: "All Bins", href: "/dashboard/bins", icon: "Bins" },
      ],
    },
    {
      label: "Monitor",
      items: [
        { label: "Alerts", href: "/dashboard/alerts", icon: "Alerts" },
        { label: "Map View", href: "/dashboard/map", icon: "Map" },
        { label: "Issue Reports", href: "/dashboard/issues", icon: "Reports" },
      ],
    },
  ];
}

function NavIcon({ kind }: { kind: string }) {
  const iconMap: Record<string, string> = {
    Overview: "M4 12 12 5l8 7v8H4z M9 20v-5h6v5",
    Bins: "M5 6h14v4H5z M5 14h6v4H5z M13 14h6v4h-6z",
    Tasks: "M9 11l3 3L22 4 M21 12v7H3V5h11",
    Alerts: "M12 4l8 14H4L12 4z M12 9v4 M12 16h.01",
    Map: "M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2z M9 5v12 M15 7v12",
    Charts: "M5 18V9 M12 18V5 M19 18v-7",
    People: "M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1 M10 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8zm8 8v-1a4 4 0 0 0-3-3.87 M15 3.13a4 4 0 0 1 0 7.75",
    Users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8a4 4 0 0 0 0 8zm10 4v6 M16 14h6",
    Reports: "M5 5h14v10H8l-3 4z M8 9h8 M8 12h5",
    Manage:
      "M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10z M12 2v3 M12 19v3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M2 12h3 M19 12h3",
  };

  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
      <svg
        aria-hidden="true"
        className="h-4 w-4 text-teal-100"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
        viewBox="0 0 24 24"
      >
        <path d={iconMap[kind] ?? iconMap.Overview} />
      </svg>
    </span>
  );
}

function isActiveLink(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { alertCount } = useCampusMonitoring();
  const { accessRole, currentEmployee, isAdmin } = useWorkforce();
  const navigationGroups = getNavigationGroups(accessRole);

  return (
    <aside className="animate-rise-in relative flex h-full flex-col overflow-hidden rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(12,22,38,0.98)_0%,rgba(7,13,24,0.98)_100%)] px-4 py-5 text-slate-50 shadow-[0_28px_90px_rgba(2,6,23,0.56)] sm:px-5 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.08),transparent_24%),linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]" />

      <div className="relative rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(18,31,51,0.96),rgba(12,24,41,0.92))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/14 bg-teal-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-teal-50">
          <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_12px_rgba(94,234,212,0.9)]" />
          Campus Intelligence
        </div>
        <div className="relative mt-4 h-20 w-20 overflow-hidden rounded-[24px] border border-amber-200/18 bg-white shadow-[0_0_36px_rgba(251,191,36,0.14)]">
          <Image
            alt="WCE GMS smart garbage collection system logo"
            className="object-cover"
            fill
            priority
            sizes="80px"
            src="/wce-gms-icon.png"
          />
        </div>
        <h1 className="mt-5 text-[1.9rem] font-semibold tracking-tight text-white">
          WCE GMS
        </h1>
        <p className="mt-2 max-w-[14rem] text-sm font-medium leading-6 text-slate-200">
          {isAdmin
            ? "smart garbage collection system"
            : accessRole === "employee"
              ? `${currentEmployee?.role ?? "Employee"} workspace`
              : "User workspace"}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Access</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {accessRole === "admin"
                ? "Admin"
                : accessRole === "employee"
                  ? currentEmployee?.role ?? "Employee"
                  : "User"}
            </p>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">
              {accessRole === "employee" ? "Zone" : "Alerts"}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {accessRole === "employee" ? currentEmployee?.assignedZone ?? "-" : alertCount}
            </p>
          </div>
        </div>
      </div>

      <nav className="relative mt-6 flex flex-1 flex-col gap-5">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-400">
              {group.label}
            </p>
            <div className="mt-3 space-y-2">
              {group.items.map((item) => {
                const active = isActiveLink(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    className={`surface-hover group flex items-center gap-3 rounded-[20px] border px-4 py-3.5 transition ${
                      active
                        ? "border-teal-300/18 bg-[linear-gradient(135deg,rgba(45,212,191,0.16),rgba(245,158,11,0.08))] text-white shadow-[0_18px_36px_rgba(45,212,191,0.10)]"
                        : "border-white/8 bg-white/[0.03] text-slate-200 hover:border-amber-300/14 hover:bg-white/[0.05] hover:text-white"
                    }`}
                    href={item.href}
                  >
                    <NavIcon kind={item.icon} />
                    <div className="flex-1 text-sm font-medium">{item.label}</div>
                    {active ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.9)]" />
                    ) : null}
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

    </aside>
  );
}
