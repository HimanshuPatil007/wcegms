"use client";

import { useState } from "react";

import {
  useCampusMonitoring,
  type MonitoringBin,
} from "@/hooks/use-campus-monitoring";
import {
  downloadSensorMonitoringReportPdf,
  type ReportPdfColumn,
  type ReportPdfRow,
} from "@/lib/sensor-monitoring-report-pdf";
import {
  SENSOR_MONITORING_REPORT_ROWS,
  SENSOR_MONITORING_REPORT_SUBTITLE,
  SENSOR_MONITORING_REPORT_TITLE,
  type SensorMonitoringLogRow,
} from "@/lib/sensor-monitoring-report";

type AnalyticsMetric = {
  fill: string;
  gas: string;
};

type AnalyticsTableRow = {
  timestamp: string;
  metrics: Record<string, AnalyticsMetric>;
};

const SHEET_PAGE_SIZE = 18;
const DEFAULT_SELECTED_DUSTBINS = ["location1", "location2", "location3"];
const SENSOR_ANALYTICS_BIN_IDS = ["location1", "location2", "location3"] as const;
const REPORT_BIN_DEFINITIONS = {
  location1: {
    fillKey: "studyFill",
    gasKey: "studyGas",
  },
  location2: {
    fillKey: "gymFill",
    gasKey: "gymGas",
  },
  location3: {
    fillKey: "hostelFill",
    gasKey: "hostelGas",
  },
} as const;

function toDateTimeLocalValue(reportTimestamp: string) {
  return reportTimestamp.replace(" ", "T");
}

function toReportTimestampValue(dateTimeLocal: string) {
  return dateTimeLocal.replace("T", " ");
}

function formatDownloadBoundary(dateTimeLocal: string) {
  if (!dateTimeLocal) {
    return "";
  }

  const [datePart, timePart = "00:00"] = dateTimeLocal.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}-${month}-${year} ${timePart}`;
}

function formatDisplayTimestamp(reportTimestamp: string) {
  const [datePart, timePart = "00:00"] = reportTimestamp.split(" ");
  const [year, month, day] = datePart.split("-");
  return `${day}-${month}-${year} ${timePart}`;
}

function getAnalyticsMetric(
  row: SensorMonitoringLogRow,
  bin: MonitoringBin | undefined,
) {
  if (
    !bin ||
    !SENSOR_ANALYTICS_BIN_IDS.includes(
      bin.id as (typeof SENSOR_ANALYTICS_BIN_IDS)[number],
    )
  ) {
    return {
      fill: "0",
      gas: "0",
    };
  }

  const reportDefinition = REPORT_BIN_DEFINITIONS[
    bin.id as keyof typeof REPORT_BIN_DEFINITIONS
  ];

  return {
    fill: row[reportDefinition.fillKey],
    gas: row[reportDefinition.gasKey],
  };
}

function buildAnalyticsRows(
  rows: SensorMonitoringLogRow[],
  selectedBins: MonitoringBin[],
) {
  return rows.map((row) => ({
    timestamp: row.timestamp,
    metrics: Object.fromEntries(
      selectedBins.map((bin) => [bin.id, getAnalyticsMetric(row, bin)]),
    ),
  })) satisfies AnalyticsTableRow[];
}

function buildPdfExportColumns(selectedBins: MonitoringBin[]) {
  return [
    {
      key: "timestamp",
      title: "Timestamp",
    },
    ...selectedBins.map((bin) => ({
      key: `${bin.id}-fill`,
      title: `${bin.name} Fill %`,
    })),
    ...selectedBins.map((bin) => ({
      key: `${bin.id}-gas`,
      title: `${bin.name} Gas %`,
    })),
  ] satisfies ReportPdfColumn[];
}

function buildPdfExportRows(
  rows: AnalyticsTableRow[],
  selectedBins: MonitoringBin[],
) {
  return rows.map((row) => ({
    timestamp: formatDisplayTimestamp(row.timestamp),
    ...Object.fromEntries(
      selectedBins.map((bin) => [`${bin.id}-fill`, row.metrics[bin.id]?.fill ?? "0"]),
    ),
    ...Object.fromEntries(
      selectedBins.map((bin) => [`${bin.id}-gas`, row.metrics[bin.id]?.gas ?? "0"]),
    ),
  })) satisfies ReportPdfRow[];
}

export function AnalyticsPage() {
  const { bins } = useCampusMonitoring();
  const [selectedIds, setSelectedIds] = useState(DEFAULT_SELECTED_DUSTBINS);
  const [downloadFrom, setDownloadFrom] = useState(
    toDateTimeLocalValue(SENSOR_MONITORING_REPORT_ROWS[0]?.timestamp ?? ""),
  );
  const [downloadTo, setDownloadTo] = useState(
    toDateTimeLocalValue(
      SENSOR_MONITORING_REPORT_ROWS.at(-1)?.timestamp ??
        SENSOR_MONITORING_REPORT_ROWS[0]?.timestamp ??
        "",
    ),
  );
  const [sheetPage, setSheetPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFromValue = toReportTimestampValue(downloadFrom);
  const selectedToValue = toReportTimestampValue(downloadTo);
  const hasValidDownloadRange =
    Boolean(downloadFrom) && Boolean(downloadTo) && selectedFromValue <= selectedToValue;
  const allSelectableBins = [...bins].sort((firstBin, secondBin) =>
    firstBin.name.localeCompare(secondBin.name),
  );
  const selectedBins = selectedIds
    .map((selectedId) => allSelectableBins.find((bin) => bin.id === selectedId) ?? null)
    .filter((bin): bin is MonitoringBin => bin !== null);
  const selectedReportPeriod =
    hasValidDownloadRange && downloadFrom && downloadTo
      ? `${formatDownloadBoundary(downloadFrom)} to ${formatDownloadBoundary(downloadTo)}`
      : "Select a valid date and time range";
  const filteredReportRows = hasValidDownloadRange
    ? SENSOR_MONITORING_REPORT_ROWS.filter(
        (row) =>
          row.timestamp >= selectedFromValue && row.timestamp <= selectedToValue,
      )
    : [];
  const visibleRowCount = selectedBins.length > 0 ? filteredReportRows.length : 0;
  const sheetPageCount = Math.max(1, Math.ceil(visibleRowCount / SHEET_PAGE_SIZE));
  const currentSheetPage = Math.min(sheetPage, sheetPageCount);
  const sheetStartIndex = (currentSheetPage - 1) * SHEET_PAGE_SIZE;
  const pageReportRows = filteredReportRows.slice(
    sheetStartIndex,
    sheetStartIndex + SHEET_PAGE_SIZE,
  );
  const visibleReportRows = buildAnalyticsRows(pageReportRows, selectedBins);
  const latestReportRow =
    filteredReportRows.length > 0
      ? buildAnalyticsRows(
          [filteredReportRows.at(-1) ?? filteredReportRows[0]],
          selectedBins,
        )[0]
      : null;
  const selectedDustbinLabel =
    selectedBins.length > 0
      ? selectedBins.map((bin) => bin.name).join(", ")
      : "No dustbin selected";
  const exportAnalyticsRows =
    hasValidDownloadRange && selectedBins.length > 0
      ? buildAnalyticsRows(filteredReportRows, selectedBins)
      : [];
  const pdfColumns = buildPdfExportColumns(selectedBins);
  const pdfRows = buildPdfExportRows(exportAnalyticsRows, selectedBins);

  async function handleDownloadPdf() {
    if (
      !hasValidDownloadRange ||
      pdfRows.length === 0 ||
      pdfColumns.length <= 1
    ) {
      return;
    }

    try {
      setIsDownloading(true);
      downloadSensorMonitoringReportPdf({
        rows: pdfRows,
        columns: pdfColumns,
        title: SENSOR_MONITORING_REPORT_TITLE,
        subtitle: SENSOR_MONITORING_REPORT_SUBTITLE,
        period: selectedReportPeriod,
        selectedDustbinsLabel: selectedDustbinLabel,
      });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-200">
          Analytics
        </p>
      </div>

      <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(15,26,48,0.98),rgba(8,17,33,0.98))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.28)]">
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1fr_1fr_auto] xl:items-end">
          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Select Dustbin
            </span>
            <select
              className="min-h-36 rounded-2xl border border-white/10 bg-[#172337] px-4 py-3 text-white outline-none"
              onChange={(event) => {
                const nextSelection = Array.from(
                  event.target.selectedOptions,
                  (option) => option.value,
                );
                setSelectedIds(nextSelection);
                setSheetPage(1);
              }}
              multiple
              value={selectedIds}
            >
              {allSelectableBins.map((bin) => (
                <option key={bin.id} value={bin.id}>
                  {bin.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400">
              Hold `Ctrl` or `Cmd` to choose multiple dustbins.
            </span>
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              From
            </span>
            <input
              className="rounded-2xl border border-white/10 bg-[#172337] px-4 py-3 text-white outline-none"
              max={downloadTo || undefined}
              onChange={(event) => {
                setDownloadFrom(event.target.value);
                setSheetPage(1);
              }}
              type="datetime-local"
              value={downloadFrom}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-300">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              To
            </span>
            <input
              className="rounded-2xl border border-white/10 bg-[#172337] px-4 py-3 text-white outline-none"
              min={downloadFrom || undefined}
              onChange={(event) => {
                setDownloadTo(event.target.value);
                setSheetPage(1);
              }}
              type="datetime-local"
              value={downloadTo}
            />
          </label>

          <button
            className={`rounded-2xl bg-[linear-gradient(135deg,#5eead4,#38bdf8)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 ${
              isDownloading ||
              !hasValidDownloadRange ||
              pdfRows.length === 0 ||
              pdfColumns.length <= 1
                ? "cursor-not-allowed opacity-60"
                : ""
            }`}
            disabled={
              isDownloading ||
              !hasValidDownloadRange ||
              pdfRows.length === 0 ||
              pdfColumns.length <= 1
            }
            onClick={handleDownloadPdf}
            type="button"
          >
            {isDownloading ? "Preparing Report PDF..." : "Download Report PDF"}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-300">
          <p>
            Selected range:{" "}
            <span className="font-semibold text-white">{selectedReportPeriod}</span>
          </p>
          {!hasValidDownloadRange ? (
            <p className="text-xs text-rose-200">
              Choose a valid start and end date-time before viewing the analytics rows.
            </p>
          ) : selectedIds.length === 0 ? (
            <p className="text-xs text-amber-200">
              Select one or more dustbins from the list to view report data.
            </p>
          ) : filteredReportRows.length === 0 ? (
            <p className="text-xs text-amber-200">
              No report rows are available in the selected date-time range.
            </p>
          ) : (
            <p className="text-xs text-emerald-200">
              {visibleRowCount} row{visibleRowCount === 1 ? "" : "s"} are ready for the
              selected screen view.
            </p>
          )}
        </div>
      </div>

      <article className="mt-6 overflow-hidden rounded-[30px] border border-emerald-300/12 bg-[#effaf2] shadow-[0_20px_60px_rgba(2,6,23,0.28)]">
        <div className="border-b border-emerald-900/10 bg-[linear-gradient(90deg,#1f5d41,#2e7d57)] px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-lg font-semibold text-white">
                {SENSOR_MONITORING_REPORT_TITLE}
              </p>
              <p className="text-sm text-emerald-50/90">
                {SENSOR_MONITORING_REPORT_SUBTITLE} | Period: {selectedReportPeriod}
              </p>
              <p className="mt-2 text-sm text-emerald-50/90">
                Showing: <span className="font-semibold text-white">{selectedDustbinLabel}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                Page {currentSheetPage} / {sheetPageCount}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                {visibleRowCount} rows
              </span>
            </div>
          </div>
        </div>

        {selectedBins.length > 0 && latestReportRow ? (
          <div
            className={`grid gap-4 border-b border-emerald-900/10 bg-[#e5f6ea] px-6 py-5 ${
              selectedBins.length > 1 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"
            }`}
          >
            <div className="rounded-[22px] border border-emerald-900/10 bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Latest Timestamp
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {formatDisplayTimestamp(latestReportRow.timestamp)}
              </p>
            </div>
            {selectedBins.map((bin) => (
              <div
                key={bin.id}
                className="rounded-[22px] border border-emerald-900/10 bg-white px-4 py-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {bin.name}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  Fill {latestReportRow.metrics[bin.id]?.fill ?? "0"}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  Gas {latestReportRow.metrics[bin.id]?.gas ?? "0"}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#2d6f4f] text-white">
              <tr>
                <th className="whitespace-nowrap border-b border-emerald-900/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]">
                  Timestamp
                </th>
                {selectedBins.map((bin) => (
                  <th
                    key={`${bin.id}-fill`}
                    className="whitespace-nowrap border-b border-emerald-900/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
                  >
                    {bin.name} Fill %
                  </th>
                ))}
                {selectedBins.map((bin) => (
                  <th
                    key={`${bin.id}-gas`}
                    className="whitespace-nowrap border-b border-emerald-900/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
                  >
                    {bin.name} Gas %
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-slate-800">
              {selectedIds.length === 0 ? (
                <tr className="bg-white">
                  <td
                    className="border-b border-emerald-900/10 px-4 py-6 text-center text-sm text-slate-500"
                    colSpan={Math.max(1, 1 + selectedBins.length * 2)}
                  >
                    Select one or more dustbins to view report data.
                  </td>
                </tr>
              ) : visibleReportRows.length > 0 ? (
                visibleReportRows.map((row, index) => (
                  <tr
                    key={row.timestamp}
                    className={index % 2 === 0 ? "bg-[#f5fff5]" : "bg-white"}
                  >
                    <td className="whitespace-nowrap border-b border-emerald-900/10 px-4 py-3 font-medium">
                      {formatDisplayTimestamp(row.timestamp)}
                    </td>
                    {selectedBins.map((bin) => (
                      <td
                        key={`${row.timestamp}-${bin.id}-fill`}
                        className="whitespace-nowrap border-b border-emerald-900/10 px-4 py-3"
                      >
                        {row.metrics[bin.id]?.fill ?? "0"}
                      </td>
                    ))}
                    {selectedBins.map((bin) => (
                      <td
                        key={`${row.timestamp}-${bin.id}-gas`}
                        className="whitespace-nowrap border-b border-emerald-900/10 px-4 py-3"
                      >
                        {row.metrics[bin.id]?.gas ?? "0"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td
                    className="border-b border-emerald-900/10 px-4 py-6 text-center text-sm text-slate-500"
                    colSpan={Math.max(1, 1 + selectedBins.length * 2)}
                  >
                    No report data is available for the selected dustbins in this date-time range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-emerald-900/10 bg-[#e5f6ea] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-700">
            {visibleRowCount > 0
              ? `Showing ${sheetStartIndex + 1}-${sheetStartIndex + visibleReportRows.length} of ${visibleRowCount} entries`
              : "Showing 0 of 0 entries"}
          </p>
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border border-emerald-900/12 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentSheetPage === 1}
              onClick={() => setSheetPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded-xl border border-emerald-900/12 bg-[#1f5d41] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentSheetPage === sheetPageCount || visibleRowCount === 0}
              onClick={() => setSheetPage((page) => Math.min(sheetPageCount, page + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
