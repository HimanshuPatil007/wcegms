"use client";

import { useMemo, useState } from "react";

import { useWorkforce } from "@/hooks/use-workforce";
import type { IssueReportStatus } from "@/lib/workforce-data";

function getStatusClasses(status: IssueReportStatus) {
  if (status === "Resolved") {
    return "border-emerald-300/18 bg-emerald-400/10 text-emerald-50";
  }

  return "border-rose-300/18 bg-rose-400/10 text-rose-50";
}

export function IssueReportsPage() {
  const {
    accessRole,
    currentEmployee,
    visibleTasks,
    visibleIssueReports,
    deleteIssueReport,
    submitIssueReport,
    updateIssueReportStatus,
  } = useWorkforce();
  const isAdmin = accessRole === "admin";
  const [taskId, setTaskId] = useState("");
  const [zone, setZone] = useState(currentEmployee?.assignedZone ?? "");
  const [message, setMessage] = useState("");

  const openCount = useMemo(
    () => visibleIssueReports.filter((report) => report.status === "Open").length,
    [visibleIssueReports],
  );
  const resolvedCount = useMemo(
    () => visibleIssueReports.filter((report) => report.status === "Resolved").length,
    [visibleIssueReports],
  );

  function handleSubmit() {
    if (!zone.trim() || !message.trim()) {
      return;
    }

    submitIssueReport({
      taskId: taskId || null,
      zone: zone.trim(),
      message: message.trim(),
    });
    setMessage("");
    setTaskId("");
  }

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div>
        <p className="text-base font-semibold uppercase tracking-[0.3em] text-amber-200 xl:text-lg">
          Issue Reports
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {isAdmin ? "Operations Issue Reports" : "Report an Issue"}
        </h1>
        {!isAdmin ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Send route issues, pickup blockers, or sensor concerns directly to the operations desk.
          </p>
        ) : null}
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#172337_0%,#101827_100%)] p-5">
          <p className="text-sm font-semibold text-white">
            {isAdmin ? "Report Summary" : "Create New Report"}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Open Reports
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{openCount}</p>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Resolved
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">{resolvedCount}</p>
            </div>
          </div>

          {!isAdmin ? (
            <div className="mt-5 grid gap-3">
              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Linked Task
                </span>
                <select
                  className="w-full rounded-[14px] border border-white/10 bg-[#1a273a] px-3 py-2.5 text-sm text-white outline-none"
                  onChange={(event) => setTaskId(event.target.value)}
                  value={taskId}
                >
                  <option value="">General issue</option>
                  {visibleTasks.map((task) => (
                    <option key={task.taskId} value={task.taskId}>
                      {task.taskId} | {task.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Zone
                </span>
                <input
                  className="w-full rounded-[14px] border border-white/10 bg-[#1a273a] px-3 py-2.5 text-sm text-white outline-none"
                  onChange={(event) => setZone(event.target.value)}
                  value={zone}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Issue Report
                </span>
                <textarea
                  className="min-h-[140px] w-full rounded-[14px] border border-white/10 bg-[#1a273a] px-3 py-3 text-sm text-white outline-none"
                  onChange={(event) => setMessage(event.target.value)}
                  value={message}
                />
              </label>
              <button
                className="rounded-[16px] bg-[linear-gradient(135deg,#0f766e,#0ea5a4)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                onClick={handleSubmit}
                type="button"
              >
                Send Issue Report
              </button>
            </div>
          ) : null}
        </section>

        <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,#172337_0%,#101827_100%)] p-5">
          <p className="text-sm font-semibold text-white">
            {isAdmin ? "Incoming Reports" : "My Submitted Reports"}
          </p>
          <div className="mt-5 space-y-4">
            {visibleIssueReports.length === 0 ? (
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                No issue reports yet.
              </div>
            ) : (
              visibleIssueReports.map((report) => (
                <article
                  key={report.reportId}
                  className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {report.reportId}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-white">
                        {report.employeeName}
                      </h2>
                      <p className="mt-1 text-sm text-slate-300">
                        {report.zone}
                        {report.taskId ? ` | Linked to ${report.taskId}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${getStatusClasses(
                          report.status,
                        )}`}
                      >
                        {report.status}
                      </span>
                      {isAdmin ? (
                        <>
                          <button
                            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition hover:bg-white/[0.08]"
                            onClick={() =>
                              updateIssueReportStatus(
                                report.reportId,
                                report.status === "Open" ? "Resolved" : "Open",
                              )
                            }
                            type="button"
                          >
                            Mark {report.status === "Open" ? "Resolved" : "Open"}
                          </button>
                          {report.status === "Resolved" ? (
                            <button
                              className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-100 transition hover:bg-rose-500/18"
                              onClick={() => deleteIssueReport(report.reportId)}
                              type="button"
                            >
                              Delete
                            </button>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-200">{report.message}</p>
                  <p className="mt-3 text-[11px] text-slate-500">{report.createdLabel}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
