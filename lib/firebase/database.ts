import { get, onValue, ref, set } from "firebase/database";

import { getBinLocationName } from "@/lib/bin-location-names";
import { getRealtimeDatabase } from "@/lib/firebase/config";
import type { BinLocation, GarbageBin, GarbageBinRecord } from "@/lib/firebase/types";

export type AnalyticsHistoryMetric = {
  fill: string;
  gas: string;
};

export type AnalyticsHistoryRow = {
  timestamp: string;
  metrics: Record<string, AnalyticsHistoryMetric>;
};

function toNumber(value: unknown) {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeLocation(value: unknown): BinLocation {
  const location = value as Partial<BinLocation> | null | undefined;

  return {
    latitude: toNumber(location?.latitude),
    longitude: toNumber(location?.longitude),
  };
}

function normalizeBinRecord(binId: string, value: unknown): GarbageBin {
  const rawBin = (value ?? {}) as Partial<GarbageBin>;
  const normalizedBinId = rawBin.binId?.trim() || binId;
  const locationName =
    (typeof rawBin.locationName === "string" && rawBin.locationName.trim()) ||
    (typeof (rawBin as { name?: string }).name === "string" &&
      (rawBin as { name?: string }).name?.trim()) ||
    (typeof (rawBin as { label?: string }).label === "string" &&
      (rawBin as { label?: string }).label?.trim()) ||
    getBinLocationName(normalizedBinId);

  return {
    binId: normalizedBinId,
    locationName: locationName || null,
    fillLevel: toNumber(rawBin.fillLevel),
    gasLevel: toNumber(rawBin.gasLevel),
    weight: toNumber(rawBin.weight),
    location: normalizeLocation(rawBin.location),
  };
}

function normalizeBinsPayload(value: unknown): GarbageBin[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as GarbageBinRecord)
    .map(([binId, binValue]) => normalizeBinRecord(binId, binValue))
    .sort((firstBin, secondBin) => firstBin.binId.localeCompare(secondBin.binId));
}

function normalizeAnalyticsMetric(value: unknown): AnalyticsHistoryMetric {
  const metric = (value ?? {}) as Partial<AnalyticsHistoryMetric>;

  return {
    fill:
      typeof metric.fill === "string" && metric.fill.trim()
        ? metric.fill
        : "0.0%",
    gas:
      typeof metric.gas === "string" && metric.gas.trim()
        ? metric.gas
        : "0.0%",
  };
}

function normalizeAnalyticsHistoryPayload(value: unknown): AnalyticsHistoryRow[] {
  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.values(value as Record<string, unknown>)
    .map((rowValue) => {
      const row = (rowValue ?? {}) as Partial<AnalyticsHistoryRow>;
      const metricsRecord =
        row.metrics && typeof row.metrics === "object"
          ? Object.fromEntries(
              Object.entries(row.metrics).map(([binId, metricValue]) => [
                binId,
                normalizeAnalyticsMetric(metricValue),
              ]),
            )
          : {};

      return {
        timestamp:
          typeof row.timestamp === "string" && row.timestamp.trim()
            ? row.timestamp
            : "",
        metrics: metricsRecord,
      };
    })
    .filter((row) => row.timestamp)
    .sort((firstRow, secondRow) => firstRow.timestamp.localeCompare(secondRow.timestamp));
}

function getAnalyticsHistoryKey(timestamp: string) {
  return timestamp.replace(" ", "T").replace(/:/g, "-");
}

export async function fetchAllBins() {
  const snapshot = await get(ref(getRealtimeDatabase(), "bins"));

  if (!snapshot.exists()) {
    return [];
  }

  return normalizeBinsPayload(snapshot.val());
}

export async function fetchBinById(id: string) {
  const snapshot = await get(ref(getRealtimeDatabase(), `bins/${id}`));

  if (!snapshot.exists()) {
    return null;
  }

  return normalizeBinRecord(id, snapshot.val());
}

export function subscribeToBinRealtime(
  id: string,
  callback: (bin: GarbageBin | null) => void,
  onError?: (error: Error) => void,
) {
  const binReference = ref(getRealtimeDatabase(), `bins/${id}`);

  return onValue(
    binReference,
    (snapshot) => {
      callback(snapshot.exists() ? normalizeBinRecord(id, snapshot.val()) : null);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export function subscribeToBinsRealtime(
  callback: (bins: GarbageBin[]) => void,
  onError?: (error: Error) => void,
) {
  const binsReference = ref(getRealtimeDatabase(), "bins");

  return onValue(
    binsReference,
    (snapshot) => {
      callback(snapshot.exists() ? normalizeBinsPayload(snapshot.val()) : []);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export function subscribeToAnalyticsHistory(
  callback: (rows: AnalyticsHistoryRow[]) => void,
  onError?: (error: Error) => void,
) {
  const analyticsHistoryReference = ref(getRealtimeDatabase(), "analyticsHistory");

  return onValue(
    analyticsHistoryReference,
    (snapshot) => {
      callback(snapshot.exists() ? normalizeAnalyticsHistoryPayload(snapshot.val()) : []);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function upsertAnalyticsHistoryRow(row: AnalyticsHistoryRow) {
  const analyticsHistoryReference = ref(
    getRealtimeDatabase(),
    `analyticsHistory/${getAnalyticsHistoryKey(row.timestamp)}`,
  );

  await set(analyticsHistoryReference, row);
}
