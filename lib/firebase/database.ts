import { get, onValue, ref } from "firebase/database";

import { getRealtimeDatabase } from "@/lib/firebase/config";
import type { BinLocation, GarbageBin, GarbageBinRecord } from "@/lib/firebase/types";

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

  return {
    binId: rawBin.binId?.trim() || binId,
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
