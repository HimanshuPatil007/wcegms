"use client";

import { useEffect, useRef, useState } from "react";

import {
  useCampusMonitoring,
  type MonitoringBin,
} from "@/hooks/use-campus-monitoring";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import {
  subscribeToAnalyticsHistory,
  upsertAnalyticsHistoryRow,
  type AnalyticsHistoryRow,
} from "@/lib/firebase/database";
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
const ZERO_ANALYTICS_METRIC: AnalyticsMetric = {
  fill: "0.0%",
  gas: "0.0%",
};
const MANUAL_REPORT_BIN_DEFINITIONS = {
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

function padDateTimeSegment(value: number) {
  return String(value).padStart(2, "0");
}

function getReportTimestamp(date: Date) {
  return [
    date.getFullYear(),
    padDateTimeSegment(date.getMonth() + 1),
    padDateTimeSegment(date.getDate()),
  ].join("-") +
    ` ${padDateTimeSegment(date.getHours())}:${padDateTimeSegment(date.getMinutes())}`;
}

function formatMetricPercentage(value: number) {
  const normalizedValue =
    Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

  return `${normalizedValue.toFixed(1)}%`;
}

function buildAnalyticsSnapshotRow(allBins: MonitoringBin[]) {
  return {
    timestamp: getReportTimestamp(new Date()),
    metrics: Object.fromEntries(
      allBins.map((bin) => [
        bin.id,
        {
          fill: formatMetricPercentage(bin.fill),
          gas: formatMetricPercentage(bin.gas),
        },
      ]),
    ),
  } satisfies AnalyticsTableRow;
}

function buildManualAnalyticsRows(rows: SensorMonitoringLogRow[]) {
  return rows.map((row) => ({
    timestamp: row.timestamp,
    metrics: Object.fromEntries(
      Object.entries(MANUAL_REPORT_BIN_DEFINITIONS).map(([binId, definition]) => [
        binId,
        {
          fill: row[definition.fillKey],
          gas: row[definition.gasKey],
        },
      ]),
    ),
  })) satisfies AnalyticsTableRow[];
}

function mergeAnalyticsRows(...rowGroups: AnalyticsTableRow[][]) {
  const rowsByTimestamp = new Map<string, AnalyticsTableRow>();

  for (const rows of rowGroups) {
    for (const row of rows) {
      const existingRow = rowsByTimestamp.get(row.timestamp);

      rowsByTimestamp.set(row.timestamp, {
        timestamp: row.timestamp,
        metrics: {
          ...(existingRow?.metrics ?? {}),
          ...row.metrics,
        },
      });
    }
  }

  return [...rowsByTimestamp.values()].sort((firstRow, secondRow) =>
    firstRow.timestamp.localeCompare(secondRow.timestamp),
  );
}

function upsertAnalyticsRows(
  rows: AnalyticsTableRow[],
  nextRow: AnalyticsTableRow,
) {
  if (rows.length > 0 && rows.at(-1)?.timestamp === nextRow.timestamp) {
    return [...rows.slice(0, -1), nextRow];
  }

  return [...rows, nextRow].sort((firstRow, secondRow) =>
    firstRow.timestamp.localeCompare(secondRow.timestamp),
  );
}

function buildSelectedAnalyticsRows(
  rows: AnalyticsTableRow[],
  selectedBins: MonitoringBin[],
) {
  return rows.map((row) => ({
    timestamp: row.timestamp,
    metrics: Object.fromEntries(
      selectedBins.map((bin) => [bin.id, row.metrics[bin.id] ?? ZERO_ANALYTICS_METRIC]),
    ),
  })) satisfies AnalyticsTableRow[];
}

function buildZeroAnalyticsRow(
  timestamp: string,
  selectedBins: MonitoringBin[],
) {
  return {
    timestamp,
    metrics: Object.fromEntries(
      selectedBins.map((bin) => [bin.id, ZERO_ANALYTICS_METRIC]),
    ),
  } satisfies AnalyticsTableRow;
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
  const currentRangeValue = toDateTimeLocalValue(getReportTimestamp(new Date()));
  const [selectedIds, setSelectedIds] = useState(DEFAULT_SELECTED_DUSTBINS);
  const [manualDownloadFrom, setManualDownloadFrom] = useState(currentRangeValue);
  const [manualDownloadTo, setManualDownloadTo] = useState(currentRangeValue);
  const [sheetPage, setSheetPage] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [liveHistoryRows, setLiveHistoryRows] = useState<AnalyticsTableRow[]>([]);
  const [isUsingAutoRange, setIsUsingAutoRange] = useState(true);
  const lastStoredSnapshotRef = useRef("");
  const manualHistoryRows = buildManualAnalyticsRows(SENSOR_MONITORING_REPORT_ROWS);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    return subscribeToAnalyticsHistory(
      (rows) => {
        setLiveHistoryRows(rows as AnalyticsTableRow[]);
      },
      () => {
        setLiveHistoryRows([]);
      },
    );
  }, []);

  useEffect(() => {
    if (bins.length === 0) {
      return;
    }

    const sortedBins = [...bins].sort((firstBin, secondBin) =>
      firstBin.id.localeCompare(secondBin.id),
    );
    const nextRow = buildAnalyticsSnapshotRow(sortedBins);
    const nextSnapshotSignature = `${nextRow.timestamp}|${JSON.stringify(nextRow.metrics)}`;

    if (lastStoredSnapshotRef.current === nextSnapshotSignature) {
      return;
    }

    lastStoredSnapshotRef.current = nextSnapshotSignature;

    setLiveHistoryRows((previousRows) => upsertAnalyticsRows(previousRows, nextRow));

    if (!isFirebaseConfigured()) {
      return;
    }

    void upsertAnalyticsHistoryRow(nextRow as AnalyticsHistoryRow);
  }, [bins]);

  const historyRows = mergeAnalyticsRows(manualHistoryRows, liveHistoryRows);

  const downloadFrom =
    isUsingAutoRange && historyRows.length > 0
      ? toDateTimeLocalValue(historyRows[0].timestamp)
      : manualDownloadFrom;
  const downloadTo =
    isUsingAutoRange && historyRows.length > 0
      ? toDateTimeLocalValue(
          historyRows.at(-1)?.timestamp ?? historyRows[0].timestamp,
        )
      : manualDownloadTo;

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
  const filteredHistoryRows = hasValidDownloadRange
    ? historyRows.filter(
        (row) =>
          row.timestamp >= selectedFromValue && row.timestamp <= selectedToValue,
      )
    : [];
  const zeroFallbackRow =
    hasValidDownloadRange && selectedBins.length > 0
      ? buildZeroAnalyticsRow(selectedToValue || selectedFromValue, selectedBins)
      : null;
  const filteredReportRows =
    selectedBins.length > 0
      ? buildSelectedAnalyticsRows(filteredHistoryRows, selectedBins)
      : [];
  const exportAnalyticsRows =
    filteredReportRows.length > 0
      ? filteredReportRows
      : zeroFallbackRow
        ? [zeroFallbackRow]
        : [];
  const isUsingZeroFallback =
    filteredReportRows.length === 0 && exportAnalyticsRows.length > 0;
  const visibleRowCount = exportAnalyticsRows.length;
  const sheetPageCount = Math.max(1, Math.ceil(visibleRowCount / SHEET_PAGE_SIZE));
  const currentSheetPage = Math.min(sheetPage, sheetPageCount);
  const sheetStartIndex = (currentSheetPage - 1) * SHEET_PAGE_SIZE;
  const pageReportRows = exportAnalyticsRows.slice(
    sheetStartIndex,
    sheetStartIndex + SHEET_PAGE_SIZE,
  );
  const visibleReportRows = pageReportRows;
  const latestReportRow = exportAnalyticsRows.at(-1) ?? null;
  const selectedDustbinLabel =
    selectedBins.length > 0
      ? selectedBins.map((bin) => bin.name).join(", ")
      : "No dustbin selected";
  const pdfColumns = buildPdfExportColumns(selectedBins);
  const pdfRows = buildPdfExportRows(exportAnalyticsRows, selectedBins);
  const canDownloadPdf =
    !isDownloading &&
    hasValidDownloadRange &&
    selectedBins.length > 0 &&
    pdfColumns.length > 1 &&
    pdfRows.length > 0;

  async function handleDownloadPdf() {
    if (!canDownloadPdf) {
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
                setIsUsingAutoRange(false);
                setManualDownloadFrom(event.target.value);
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
                setIsUsingAutoRange(false);
                setManualDownloadTo(event.target.value);
                setSheetPage(1);
              }}
              type="datetime-local"
              value={downloadTo}
            />
          </label>

          <button
            className={`rounded-2xl bg-[linear-gradient(135deg,#5eead4,#38bdf8)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 ${
              !canDownloadPdf
                ? "cursor-not-allowed opacity-60"
                : ""
            }`}
            disabled={!canDownloadPdf}
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
          ) : isUsingZeroFallback ? (
            <p className="text-xs text-amber-200">
              No past data is available in the selected range, so zero values are
              shown for the report export.
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
                {visibleRowCount} row{visibleRowCount === 1 ? "" : "s"}
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
