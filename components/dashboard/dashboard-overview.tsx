"use client";

import Link from "next/link";

import { CampusMap } from "@/components/dashboard/campus-map";
import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";
import { useWorkforce } from "@/hooks/use-workforce";

function getSeverityClasses(severity: "low" | "medium" | "high") {
  if (severity === "high") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-100";
  }

  if (severity === "medium") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-50";
  }

  return "border-emerald-400/25 bg-emerald-400/10 text-emerald-50";
}

function MiniDonut({
  high,
  medium,
  low,
  label,
}: {
  high: number;
  medium: number;
  low: number;
  label: string;
}) {
  const total = Math.max(high + medium + low, 1);
  const highDegrees = (high / total) * 360;
  const mediumDegrees = (medium / total) * 360;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-500/12 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.26)]">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/8 blur-2xl" />
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <div className="relative mt-5 flex items-center gap-5">
        <div
          className="relative h-24 w-24 rounded-full p-[8px]"
          style={{
            background: `conic-gradient(#ff3b3b 0deg ${highDegrees}deg, #ff9500 ${highDegrees}deg ${highDegrees + mediumDegrees}deg, #34c759 ${highDegrees + mediumDegrees}deg 360deg)`,
          }}
        >
          <div className="h-full w-full rounded-full bg-[#091121] ring-1 ring-white/8" />
        </div>
        <div className="space-y-2.5 text-sm text-slate-300">
          <p className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            High: {high}
          </p>
          <p className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Medium: {medium}
          </p>
          <p className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Low: {low}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatIcon({ tone }: { tone: "cyan" | "rose" | "amber" | "emerald" }) {
  const accent =
    tone === "rose"
      ? "text-rose-300 bg-rose-500/12 border-rose-400/20"
      : tone === "amber"
        ? "text-amber-200 bg-amber-400/12 border-amber-300/20"
        : tone === "emerald"
          ? "text-emerald-200 bg-emerald-400/12 border-emerald-300/20"
          : "text-cyan-200 bg-cyan-400/12 border-cyan-300/20";
  const iconPath =
    tone === "rose"
      ? "M12 4l8 14H4L12 4z M12 9v4 M12 16h.01"
      : tone === "amber"
        ? "M4 12h16 M7 7h10 M9 17h6"
        : tone === "emerald"
          ? "M5 12l4 4L19 6"
          : "M5 19V9 M12 19V5 M19 19v-8";

  return (
    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${accent}`}>
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d={iconPath} />
      </svg>
    </span>
  );
}

function getBinRankScore(fill: number, gas: number, weightPercent: number) {
  return fill * 0.45 + gas * 0.3 + weightPercent * 0.25;
}

export function DashboardOverview() {
  const { bins, criticalBins, errorMessage, truck } = useCampusMonitoring();
  const { accessRole, appUsers, currentAppUser, currentEmployee, visibleIssueReports, visibleTasks } =
    useWorkforce();
  const rankedBins = [...bins].sort(
    (firstBin, secondBin) =>
      getBinRankScore(secondBin.fill, secondBin.gas, secondBin.weightPercent) -
      getBinRankScore(firstBin.fill, firstBin.gas, firstBin.weightPercent),
  );

  if (accessRole === "employee") {
    const completedTasks = visibleTasks.filter((task) => task.status === "Completed").length;
    const openTasks = visibleTasks.filter((task) => task.status !== "Completed").length;
    const openIssues = visibleIssueReports.filter((issue) => issue.status === "Open").length;

    return (
      <div className="flex flex-col gap-6">
        <section className="relative overflow-hidden rounded-[32px] border border-teal-300/14 bg-[linear-gradient(135deg,rgba(14,116,144,0.16),rgba(15,118,110,0.14),rgba(15,23,42,0.92))] px-6 py-6 text-white shadow-[0_20px_60px_rgba(2,6,23,0.30)]">
          <div className="absolute right-[-4%] top-[-8%] h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
            Employee Dashboard
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {currentEmployee?.name ? `Welcome, ${currentEmployee.name}` : "Welcome"}
          </h2>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {[
            { label: "Assigned Tasks", value: visibleTasks.length, href: "/dashboard/tasks" },
            { label: "Open Tasks", value: openTasks, href: "/dashboard/tasks" },
            { label: "All Dustbins", value: bins.length, href: "/dashboard/bins" },
            { label: "High Alerts", value: criticalBins.length, href: "/dashboard/alerts" },
            { label: "Completed", value: completedTasks, href: "/dashboard/tasks" },
            { label: "Open Issues", value: openIssues, href: "/dashboard/issues" },
          ].map((item) => (
            <Link key={item.label} className="block" href={item.href}>
              <article className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  {item.value}
                </p>
              </article>
            </Link>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          <Link className="block" href="/dashboard/alerts">
            <article className="relative h-full overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-4 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                  Alerts
                </p>
                <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100">
                  Top 5
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {rankedBins.length === 0 ? (
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    No alerts available right now.
                  </div>
                ) : (
                  rankedBins.slice(0, 5).map((bin) => (
                    <div
                      key={bin.id}
                      className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 sm:px-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{bin.name}</p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            {bin.id}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getSeverityClasses(
                            bin.overallSeverity,
                          )}`}
                        >
                          {bin.overallSeverity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        Fill {bin.fill.toFixed(0)}% | Gas {bin.gas.toFixed(0)}% | Weight{" "}
                        {bin.weightPercent.toFixed(0)}%
                      </p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </Link>

          <Link className="block" href="/dashboard/tasks">
            <article className="relative h-full overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                My Tasks
              </p>
              <div className="mt-5 space-y-3">
                {visibleTasks.length === 0 ? (
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                    No assigned tasks yet.
                  </div>
                ) : (
                  visibleTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.taskId}
                      className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{task.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {task.taskId} | {task.routeLabel}
                          </p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getSeverityClasses(task.status === "Completed" ? "low" : task.status === "In Progress" ? "medium" : "high")}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </Link>

          <Link className="block" href="/dashboard/issues">
            <article className="relative h-full overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                Issue Reports
              </p>
              <div className="mt-5 space-y-3">
                {visibleIssueReports.length === 0 ? (
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                    No issue reports submitted yet.
                  </div>
                ) : (
                  visibleIssueReports.slice(0, 4).map((issue) => (
                    <div
                      key={issue.reportId}
                      className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{issue.zone}</p>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getSeverityClasses(
                            issue.status === "Resolved" ? "low" : "high",
                          )}`}
                        >
                          {issue.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{issue.message}</p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </Link>
        </section>

        <Link className="block" href="/dashboard/map">
          <article className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                  Route Map
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  Assigned zone visibility
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Use the live campus map to review your route, current truck position, and nearby collection points.
                </p>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-[24px] border border-cyan-500/10">
              <CampusMap bins={bins} interactive={false} truck={truck} zoom={16} />
            </div>
          </article>
        </Link>
      </div>
    );
  }

  if (accessRole === "user") {
    const userDisplayName =
      currentAppUser?.displayName?.trim() ||
      currentAppUser?.email?.split("@")[0] ||
      "User";
    const openIssues = visibleIssueReports.filter((issue) => issue.status === "Open").length;

    return (
      <div className="flex flex-col gap-6">
        <section className="relative overflow-hidden rounded-[32px] border border-sky-300/14 bg-[linear-gradient(135deg,rgba(29,78,216,0.16),rgba(14,165,233,0.12),rgba(15,23,42,0.92))] px-6 py-6 text-white shadow-[0_20px_60px_rgba(2,6,23,0.30)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
            User Dashboard
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome, {userDisplayName}
          </h2>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "All Bins", value: bins.length, href: "/dashboard/bins" },
            { label: "High Alerts", value: criticalBins.length, href: "/dashboard/alerts" },
            { label: "Open Reports", value: openIssues, href: "/dashboard/issues" },
            { label: "Map View", value: truck ? "Live" : "Ready", href: "/dashboard/map" },
          ].map((item) => (
            <Link key={item.label} className="block" href={item.href}>
              <article className="relative overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  {item.value}
                </p>
              </article>
            </Link>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Link className="block" href="/dashboard/alerts">
            <article className="relative h-full overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-4 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                  Alerts
                </p>
                <span className="rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-100">
                  Top 5
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {rankedBins.length === 0 ? (
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    No alerts available right now.
                  </div>
                ) : (
                  rankedBins.slice(0, 5).map((bin) => (
                    <div
                      key={bin.id}
                      className="rounded-[18px] border border-white/8 bg-white/[0.03] px-3 py-3 sm:px-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{bin.name}</p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            {bin.id}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getSeverityClasses(
                            bin.overallSeverity,
                          )}`}
                        >
                          {bin.overallSeverity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">
                        Fill {bin.fill.toFixed(0)}% | Gas {bin.gas.toFixed(0)}% | Weight{" "}
                        {bin.weightPercent.toFixed(0)}%
                      </p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </Link>

          <Link className="block" href="/dashboard/issues">
            <article className="relative h-full overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                Issue Reports
              </p>
              <div className="mt-5 space-y-3">
                {visibleIssueReports.length === 0 ? (
                  <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                    No issue reports submitted yet.
                  </div>
                ) : (
                  visibleIssueReports.slice(0, 4).map((issue) => (
                    <div
                      key={issue.reportId}
                      className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{issue.zone}</p>
                        <span
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getSeverityClasses(
                            issue.status === "Resolved" ? "low" : "high",
                          )}`}
                        >
                          {issue.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{issue.message}</p>
                    </div>
                  ))
                )}
              </div>
            </article>
          </Link>
        </section>

        <Link className="block" href="/dashboard/map">
          <article className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
                  Campus Map
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  Live campus visibility
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  Explore the active campus deployment, review all bins, and keep track of live truck movement from one map view.
                </p>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-[24px] border border-cyan-500/10">
              <CampusMap bins={bins} interactive={false} truck={truck} zoom={16} />
            </div>
          </article>
        </Link>
      </div>
    );
  }

  const highCount = bins.filter((bin) => bin.overallSeverity === "high").length;
  const mediumCount = bins.filter(
    (bin) => bin.overallSeverity === "medium",
  ).length;
  const lowCount = bins.filter((bin) => bin.overallSeverity === "low").length;
  const averageFill =
    bins.length > 0
      ? Math.round(bins.reduce((sum, bin) => sum + bin.fill, 0) / bins.length)
      : 0;
  const averageGas =
    bins.length > 0
      ? Math.round(bins.reduce((sum, bin) => sum + bin.gas, 0) / bins.length)
      : 0;
  const averageWeight =
    bins.length > 0
      ? Math.round(
          bins.reduce((sum, bin) => sum + bin.weightPercent, 0) / bins.length,
        )
      : 0;
  const latestUsers = [...appUsers]
    .sort((firstUser, secondUser) => secondUser.createdAt - firstUser.createdAt)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {criticalBins.length > 0 ? (
        <Link
          className="block"
          href="/dashboard/alerts"
        >
        <section className="relative overflow-hidden rounded-[30px] border border-rose-500/25 bg-[linear-gradient(135deg,rgba(127,29,29,0.42),rgba(15,23,42,0.9))] px-6 py-5 text-rose-50 shadow-[0_18px_50px_rgba(127,29,29,0.22)] transition hover:-translate-y-0.5 hover:border-rose-400/35">
          <div className="absolute inset-y-0 left-0 w-1.5 bg-[linear-gradient(180deg,#fb7185,#ef4444)]" />
          <div className="absolute right-0 top-0 h-24 w-32 rounded-full bg-rose-500/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-rose-200">
            Critical Alert
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            {criticalBins.length} bin{criticalBins.length === 1 ? "" : "s"} need
            immediate review.
          </h2>
          <p className="mt-3 max-w-4xl text-sm leading-8 text-rose-100/90">
            Priority locations:{" "}
            {criticalBins
              .slice(0, 5)
              .map((bin) => bin.name)
              .join(", ")}
            .
          </p>
        </section>
        </Link>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {[
          { label: "Total Bins", value: bins.length, tone: "cyan", href: "/dashboard/bins" },
          { label: "High Alert", value: highCount, tone: "rose", href: "/dashboard/alerts" },
          { label: "Medium Level", value: mediumCount, tone: "amber", href: "/dashboard/alerts" },
          { label: "Registered Users", value: appUsers.length, tone: "emerald", href: "/dashboard/users" },
        ].map((item) => (
          <Link
            key={item.label}
            className="block"
            href={item.href}
          >
          <article className="relative overflow-hidden rounded-[28px] border border-cyan-500/12 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-cyan-400/25">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl" />
            <div className="absolute inset-x-5 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(103,214,239,0.6),transparent)]" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-tight text-white">
                  {item.value}
                </p>
              </div>
              <StatIcon tone={item.tone as "cyan" | "rose" | "amber" | "emerald"} />
            </div>
            <div
              className={`mt-5 h-2 rounded-full ${
                item.tone === "rose"
                  ? "bg-rose-500/80"
                  : item.tone === "amber"
                    ? "bg-amber-400/80"
                    : item.tone === "emerald"
                      ? "bg-emerald-400/80"
                      : "bg-cyan-400/80"
              }`}
            />
          </article>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Link className="block" href="/dashboard/map">
        <article className="relative overflow-hidden rounded-[30px] border border-cyan-500/12 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-cyan-400/25">
          <div className="absolute right-[-10%] top-[-15%] h-40 w-40 rounded-full bg-cyan-400/8 blur-3xl" />
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Mini Map
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Campus deployment view
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Live mapping keeps every campus location visible from one
                responsive control surface, including the garbage truck tracker.
              </p>
              {truck ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/18 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                  {truck.label}: {truck.latitude.toFixed(4)}, {truck.longitude.toFixed(4)}
                </div>
              ) : null}
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M4 7l5-2 6 2 5-2v12l-5 2-6-2-5 2z M9 5v12 M15 7v12" />
              </svg>
              Open full map
            </span>
          </div>
          <div className="mt-6 overflow-hidden rounded-[24px] border border-cyan-500/10">
            <CampusMap bins={bins} interactive={false} truck={truck} zoom={16} />
          </div>
        </article>
        </Link>

        <Link className="block" href="/dashboard/alerts">
        <article className="relative overflow-hidden rounded-[30px] border border-cyan-500/12 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-cyan-400/25">
          <div className="absolute right-[-4%] top-[8%] h-32 w-32 rounded-full bg-rose-500/8 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            High Alerts
          </p>
          <div className="mt-5 space-y-3">
            {criticalBins.length === 0 ? (
              <div className="rounded-[22px] border border-emerald-400/15 bg-emerald-400/10 px-4 py-4 text-sm text-emerald-100">
                No high alerts at the moment.
              </div>
            ) : (
              criticalBins.slice(0, 5).map((bin) => (
                <div
                  key={bin.id}
                  className="rounded-[22px] border border-rose-500/18 bg-[linear-gradient(135deg,rgba(91,33,56,0.34),rgba(58,23,49,0.18))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{bin.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {bin.id}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span
                        className={`rounded-full border px-3 py-1 ${getSeverityClasses(bin.fillSeverity)}`}
                      >
                        Fill {bin.fill.toFixed(0)}%
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 ${getSeverityClasses(bin.gasSeverity)}`}
                      >
                        Gas {bin.gas.toFixed(0)}%
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 ${getSeverityClasses(bin.weightSeverity)}`}
                      >
                        Weight {bin.weightPercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
        </Link>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Link className="block" href="/dashboard/analytics">
          <div className="transition hover:-translate-y-1">
            <MiniDonut
              high={highCount}
              low={lowCount}
              medium={mediumCount}
              label="Overall Severity"
            />
          </div>
        </Link>
        <Link className="block" href="/dashboard/analytics">
        <article className="relative overflow-hidden rounded-[28px] border border-cyan-500/12 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.26)] transition hover:-translate-y-1 hover:border-cyan-400/25">
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-cyan-400/8 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Live Averages
          </p>
            <div className="relative mt-5 space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Average fill</span>
                <span>{averageFill}%</span>
              </div>
              <div className="mt-2.5 h-2.5 rounded-full bg-slate-800/80 ring-1 ring-white/5">
                <div
                  className="h-2.5 rounded-full bg-[linear-gradient(90deg,#00d4ff,#00ff88)] shadow-[0_0_18px_rgba(34,211,238,0.28)]"
                  style={{ width: `${averageFill}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Average gas</span>
                <span>{averageGas}%</span>
              </div>
              <div className="mt-2.5 h-2.5 rounded-full bg-slate-800/80 ring-1 ring-white/5">
                <div
                  className="h-2.5 rounded-full bg-[linear-gradient(90deg,#ff9500,#ff3b3b)] shadow-[0_0_18px_rgba(251,146,60,0.28)]"
                  style={{ width: `${averageGas}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Average weight</span>
                <span>{averageWeight}%</span>
              </div>
              <div className="mt-2.5 h-2.5 rounded-full bg-slate-800/80 ring-1 ring-white/5">
                <div
                  className="h-2.5 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#22c55e)] shadow-[0_0_18px_rgba(139,92,246,0.25)]"
                  style={{ width: `${averageWeight}%` }}
                />
              </div>
            </div>
          </div>
        </article>
        </Link>
      </section>

      <Link className="block" href="/dashboard/users">
        <section className="relative overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(10,18,36,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.30)] transition hover:-translate-y-1 hover:border-amber-300/18">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">
            Signed-Up Users
          </p>
          <div className="mt-5 grid gap-3 xl:grid-cols-5">
            {latestUsers.length === 0 ? (
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                No user records available yet.
              </div>
            ) : (
              latestUsers.map((appUser) => (
                <div
                  key={appUser.uid}
                  className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-sm font-semibold text-white">{appUser.displayName}</p>
                  <p className="mt-2 break-all text-xs text-slate-400">{appUser.email}</p>
                  <span className="mt-3 inline-flex rounded-full border border-amber-300/18 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-50">
                    {appUser.accessRole}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </Link>

      {errorMessage ? (
        <section className="rounded-[24px] border border-rose-500/18 bg-rose-500/10 px-5 py-4 text-sm text-rose-100">
          {errorMessage}
        </section>
      ) : null}
    </div>
  );
}
