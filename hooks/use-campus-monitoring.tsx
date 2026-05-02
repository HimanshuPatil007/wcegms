"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onValue, ref, remove, set } from "firebase/database";

import {
  DEFAULT_CAMPUS_LOCATIONS,
  LIVE_LOCATION_IDS,
  type CampusLocation,
} from "@/lib/campus-locations";
import { getRealtimeDatabase, isFirebaseConfigured } from "@/lib/firebase/config";

export type MonitoringSeverity = "low" | "medium" | "high";
export type ConnectionState = "connecting" | "live" | "demo" | "error";

type SensorSnapshot = {
  fill: number;
  gas: number;
  weightPercent: number;
  fillStatus?: string;
  gasStatus?: string;
  weightStatus?: string;
  isLive: boolean;
};

export type MonitoringBin = CampusLocation & {
  fill: number;
  gas: number;
  weightPercent: number;
  fillSeverity: MonitoringSeverity;
  gasSeverity: MonitoringSeverity;
  weightSeverity: MonitoringSeverity;
  overallSeverity: MonitoringSeverity;
  fillLabel: string;
  gasLabel: string;
  weightLabel: string;
  isLive: boolean;
};

export type LiveTruck = {
  label: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  status?: string;
  lastSeenLabel: string;
  isLive: boolean;
};

type CustomLocationInput = {
  name: string;
  latitude: number;
  longitude: number;
};

type CampusMonitoringContextValue = {
  bins: MonitoringBin[];
  criticalBins: MonitoringBin[];
  truck: LiveTruck | null;
  lastUpdatedLabel: string;
  connectionState: ConnectionState;
  errorMessage: string | null;
  alertCount: number;
  addCustomLocation: (input: CustomLocationInput) => Promise<string>;
  deleteCustomLocation: (locationId: string) => Promise<string>;
};

const CampusMonitoringContext = createContext<CampusMonitoringContextValue | null>(
  null,
);

function hasLocationId(
  deletedLocationIds: string[],
  locationId: string,
) {
  return deletedLocationIds.includes(locationId);
}

function filterDeletedLocations(
  locations: CampusLocation[],
  deletedLocationIds: string[],
) {
  return locations.filter(
    (location) => !hasLocationId(deletedLocationIds, location.id),
  );
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

const MAX_WEIGHT_GRAMS = 20000;
const TRUCK_NEARBY_OFFSET = 0.00045;
const TRUCK_UPDATE_INTERVAL_MS = 30000;
const DEPENDENT_BINS_UPDATE_INTERVAL_MS = 60000;

function randomPercent() {
  return Math.round(Math.random() * 1000) / 10;
}

function toSeverity(value: number) {
  if (value >= 80) {
    return "high";
  }

  if (value >= 50) {
    return "medium";
  }

  return "low";
}

function normalizeSeverity(value: string | undefined, fallback: number) {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "high" || normalized === "full" || normalized === "hazard") {
    return "high";
  }

  if (normalized === "medium" || normalized === "elevated") {
    return "medium";
  }

  if (normalized === "low" || normalized === "safe") {
    return "low";
  }

  return toSeverity(fallback);
}

function getSeverityLabel(value: MonitoringSeverity) {
  if (value === "high") {
    return "High";
  }

  if (value === "medium") {
    return "Medium";
  }

  return "Low";
}

function pickMapValue(
  data: Record<string, unknown>,
  keys: string[],
) {
  for (const key of keys) {
    const value = data[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function extractNumericValue(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const resolved = pickMapValue(value as Record<string, unknown>, keys);
  const numeric = Number(resolved);

  return Number.isFinite(numeric) ? clampPercent(numeric) : null;
}

function extractRawNumericValue(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const resolved = pickMapValue(value as Record<string, unknown>, keys);
  const numeric = Number(resolved);

  return Number.isFinite(numeric) ? numeric : null;
}

function extractCoordinateValue(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const containers = [
    value as Record<string, unknown>,
    ((value as Record<string, unknown>).location as Record<string, unknown>) ?? null,
    ((value as Record<string, unknown>).currentLocation as Record<string, unknown>) ?? null,
    ((value as Record<string, unknown>).truckLocation as Record<string, unknown>) ?? null,
    ((value as Record<string, unknown>).position as Record<string, unknown>) ?? null,
    ((value as Record<string, unknown>).coordinates as Record<string, unknown>) ?? null,
    ((value as Record<string, unknown>).coords as Record<string, unknown>) ?? null,
    ((value as Record<string, unknown>).gps as Record<string, unknown>) ?? null,
  ];

  for (const container of containers) {
    if (!container || typeof container !== "object") {
      continue;
    }

    const resolved = pickMapValue(container, keys);
    const numeric = Number(resolved);

    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return null;
}

function extractLatitude(value: unknown) {
  return extractCoordinateValue(value, [
    "latitude",
    "Latitude",
    "lat",
    "Lat",
    "truckLatitude",
    "gpsLatitude",
  ]);
}

function extractLongitude(value: unknown) {
  return extractCoordinateValue(value, [
    "longitude",
    "Longitude",
    "lng",
    "Lng",
    "lon",
    "Lon",
    "truckLongitude",
    "gpsLongitude",
  ]);
}

function extractSpeed(value: unknown) {
  return extractRawNumericValue(value, [
    "speed",
    "Speed",
    "speedKmh",
    "speed_kmh",
    "kmh",
    "km_h",
  ]);
}

function hasTruckCoordinates(value: unknown) {
  return extractLatitude(value) !== null && extractLongitude(value) !== null;
}

function extractFill(value: unknown) {
  return extractNumericValue(value, [
    "LevelPercent",
    "levelPercent",
    "level_percent",
    "fillLevel",
    "fill_level",
    "fill",
    "FillLevel",
    "Fill",
    "percent",
    "Percent",
    "distance",
    "Distance",
  ]);
}

function extractGas(value: unknown) {
  return extractNumericValue(value, [
    "GasValue",
    "gasValue",
    "gas_value",
    "gasLevel",
    "gas_level",
    "gas",
    "GasLevel",
    "Gas",
    "ppm",
    "PPM",
    "mq2",
    "MQ2",
  ]);
}

function extractWeight(value: unknown) {
  const explicitPercent = extractNumericValue(value, [
    "WeightPercent",
    "weightPercent",
    "weight_percent",
    "weightPercentage",
    "weight_percentage",
    "weightLevel",
    "weight_level",
    "loadPercent",
    "load_percent",
    "LoadPercent",
  ]);

  if (explicitPercent !== null) {
    return explicitPercent;
  }

  const rawWeight = extractRawNumericValue(value, [
    "weight",
    "Weight",
    "weightValue",
    "WeightValue",
    "garbageWeight",
    "garbage_weight",
    "load",
    "Load",
  ]);

  if (rawWeight === null) {
    return null;
  }

  return rawWeight <= 100
    ? clampPercent(rawWeight)
    : clampPercent((rawWeight / MAX_WEIGHT_GRAMS) * 100);
}

function extractStatus(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const resolved = pickMapValue(value as Record<string, unknown>, keys);

  return typeof resolved === "string" && resolved.trim() ? resolved : undefined;
}

function findTruckInData(value: unknown, keyHint = ""): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (
    keyHint &&
    /(truck|vehicle|gps|tracker|collector)/i.test(keyHint) &&
    hasTruckCoordinates(record)
  ) {
    return record;
  }

  const preferredKeys = [
    "truck",
    "garbageTruck",
    "garbage_truck",
    "collectionTruck",
    "collection_truck",
    "vehicle",
    "truckTracker",
    "truck_tracker",
    "truckGps",
    "truck_gps",
    "liveTruck",
    "gpsTruck",
  ];

  for (const key of preferredKeys) {
    const candidate = record[key];

    if (candidate && typeof candidate === "object" && hasTruckCoordinates(candidate)) {
      return candidate as Record<string, unknown>;
    }
  }

  for (const [key, nestedValue] of Object.entries(record)) {
    if (!nestedValue || typeof nestedValue !== "object") {
      continue;
    }

    if (/(truck|vehicle|gps|tracker|collector)/i.test(key) && hasTruckCoordinates(nestedValue)) {
      return nestedValue as Record<string, unknown>;
    }

    const match = findTruckInData(nestedValue, key);

    if (match) {
      return match;
    }
  }

  return null;
}

function buildUpdatedTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function randomizeCoordinate(base: number, maxOffset = TRUCK_NEARBY_OFFSET) {
  const offset = (Math.random() - 0.5) * maxOffset * 2;

  return Math.round((base + offset) * 100000) / 100000;
}

function getTruckReadyLocations(locations: CampusLocation[]) {
  return locations.filter(
    (location) =>
      Number.isFinite(location.latitude) && Number.isFinite(location.longitude),
  );
}

function simulateTruckPosition(
  locations: CampusLocation[],
  tick: number,
  lastSeenLabel = "Simulated live route",
): LiveTruck | null {
  const trackableLocations = getTruckReadyLocations(locations);

  if (trackableLocations.length === 0) {
    return null;
  }

  const anchor = trackableLocations[tick % trackableLocations.length];

  return {
    label: "Garbage Truck",
    latitude: randomizeCoordinate(anchor.latitude),
    longitude: randomizeCoordinate(anchor.longitude),
    speedKmh: Math.round(10 + Math.random() * 18),
    status: `Near ${anchor.name}`,
    lastSeenLabel,
    isLive: false,
  };
}

function createSeededSensors(locations: CampusLocation[]) {
  const seeded: Record<string, SensorSnapshot> = {};

  for (const location of locations) {
    seeded[location.id] = {
      fill: randomPercent(),
      gas: randomPercent(),
      weightPercent: randomPercent(),
      isLive: false,
    };
  }

  return seeded;
}

function findBinInData(
  data: Record<string, unknown>,
  locationId: string,
): Record<string, unknown> | null {
  const variants = [
    locationId,
    locationId.toLowerCase(),
    locationId.toUpperCase(),
    locationId.charAt(0).toUpperCase() + locationId.slice(1),
    locationId.replace("location", "Location"),
    locationId.replace("location", "bin"),
    locationId.replace("location", "Bin"),
    locationId.replace("location", "BIN"),
    locationId.replace("location", "dustbin"),
    locationId.replace("location", "Dustbin"),
    locationId.replace("location", "DUSTBIN"),
  ];

  for (const variant of variants) {
    const directMatch = data[variant];

    if (
      directMatch &&
      typeof directMatch === "object" &&
        (extractFill(directMatch) !== null ||
          extractGas(directMatch) !== null ||
          extractWeight(directMatch) !== null)
      ) {
        return directMatch as Record<string, unknown>;
      }
  }

  for (const nestedValue of Object.values(data)) {
    if (!nestedValue || typeof nestedValue !== "object") {
      continue;
    }

    const match = findBinInData(
      nestedValue as Record<string, unknown>,
      locationId,
    );

    if (match) {
      return match;
    }
  }

  return null;
}

function simulateDependentBins(
  nextSensors: Record<string, SensorSnapshot>,
  locations: CampusLocation[],
) {
  let totalFill = 0;
  let totalGas = 0;
  let totalWeight = 0;
  let liveCount = 0;

  for (const liveId of LIVE_LOCATION_IDS) {
    const liveBin = nextSensors[liveId];

    if (!liveBin) {
      continue;
    }

    totalFill += liveBin.fill;
    totalGas += liveBin.gas;
    totalWeight += liveBin.weightPercent;
    liveCount += 1;
  }

  const averageFill = liveCount > 0 ? totalFill / liveCount : 50;
  const averageGas = liveCount > 0 ? totalGas / liveCount : 50;
  const averageWeight = liveCount > 0 ? totalWeight / liveCount : 50;

  for (const location of locations) {
    if (LIVE_LOCATION_IDS.includes(location.id as (typeof LIVE_LOCATION_IDS)[number])) {
      continue;
    }

    const existing = nextSensors[location.id] ?? {
      fill: randomPercent(),
      gas: randomPercent(),
      weightPercent: randomPercent(),
      isLive: false,
    };

    if (Math.random() < 0.45 || !nextSensors[location.id]) {
      const fillDelta =
        Math.random() < 0.1 ? Math.random() * 18 - 5 : Math.random() * 7 - 3;
      const gasDelta =
        Math.random() < 0.1 ? Math.random() * 18 - 5 : Math.random() * 7 - 3;
      const weightDelta =
        Math.random() < 0.1 ? Math.random() * 15 - 4 : Math.random() * 6 - 2.5;
      const simulatedFill = clampPercent(
        (existing.fill + fillDelta) * 0.9 + averageFill * 0.1,
      );
      const simulatedGas = clampPercent(
        (existing.gas + gasDelta) * 0.9 + averageGas * 0.1,
      );
      const simulatedWeight = clampPercent(
        (existing.weightPercent + weightDelta) * 0.9 + averageWeight * 0.1,
      );

      nextSensors[location.id] = {
        ...existing,
        fill: Math.round(simulatedFill * 10) / 10,
        gas: Math.round(simulatedGas * 10) / 10,
        weightPercent: Math.round(simulatedWeight * 10) / 10,
        isLive: false,
      };
    } else {
      nextSensors[location.id] = {
        ...existing,
        isLive: false,
      };
    }
  }

  return nextSensors;
}

function sortBinsBySeverity(bins: MonitoringBin[]) {
  const score = {
    high: 2,
    medium: 1,
    low: 0,
  } satisfies Record<MonitoringSeverity, number>;

  return [...bins].sort((firstBin, secondBin) => {
    const firstScore = score[firstBin.overallSeverity];
    const secondScore = score[secondBin.overallSeverity];

    if (firstScore !== secondScore) {
      return secondScore - firstScore;
    }

    return firstBin.id.localeCompare(secondBin.id);
  });
}

export function CampusMonitoringProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [customLocations, setCustomLocations] = useState<CampusLocation[]>([]);
  const [localDemoLocations, setLocalDemoLocations] = useState<CampusLocation[]>([]);
  const [deletedLocationIds, setDeletedLocationIds] = useState<string[]>([]);
  const [sensorSnapshots, setSensorSnapshots] = useState<Record<string, SensorSnapshot>>(
    () => createSeededSensors(DEFAULT_CAMPUS_LOCATIONS),
  );
  const [truck, setTruck] = useState<LiveTruck | null>(() =>
    simulateTruckPosition(
      DEFAULT_CAMPUS_LOCATIONS,
      0,
      isFirebaseConfigured() ? "Waiting for live GPS feed" : "Simulated live route",
    ),
  );
  const [connectionState, setConnectionState] =
    useState<ConnectionState>(isFirebaseConfigured() ? "connecting" : "demo");
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState(
    isFirebaseConfigured() ? "--" : "Demo mode",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const locationsRef = useRef<CampusLocation[]>(DEFAULT_CAMPUS_LOCATIONS);
  const truckTickRef = useRef(0);
  const hasLiveTruckFeedRef = useRef(false);

  const visibleDefaultLocations = filterDeletedLocations(
    DEFAULT_CAMPUS_LOCATIONS,
    deletedLocationIds,
  );
  const visibleCustomLocations = filterDeletedLocations(
    isFirebaseConfigured() ? customLocations : localDemoLocations,
    deletedLocationIds,
  );
  const locations = [...visibleDefaultLocations, ...visibleCustomLocations];

  useEffect(() => {
    locationsRef.current = [...visibleDefaultLocations, ...visibleCustomLocations];
  }, [visibleCustomLocations, visibleDefaultLocations]);

  useEffect(() => {
    const binIntervalId = window.setInterval(() => {
      const updatedTimeLabel = buildUpdatedTimeLabel();

      setSensorSnapshots((previous) => {
        const nextSnapshots = simulateDependentBins(
          { ...previous },
          locationsRef.current,
        );

        return { ...nextSnapshots };
      });
      setLastUpdatedLabel(`Updated: ${updatedTimeLabel}`);
    }, DEPENDENT_BINS_UPDATE_INTERVAL_MS);

    const truckIntervalId = window.setInterval(() => {
      const updatedTimeLabel = buildUpdatedTimeLabel();

      setTruck((previousTruck) => {
        if (
          isFirebaseConfigured() &&
          hasLiveTruckFeedRef.current &&
          previousTruck?.isLive
        ) {
          return previousTruck;
        }

        return simulateTruckPosition(
          locationsRef.current,
          truckTickRef.current,
          `Updated: ${updatedTimeLabel} (simulated)`,
        );
      });
      truckTickRef.current += 1;
      setLastUpdatedLabel(`Updated: ${updatedTimeLabel}`);
    }, TRUCK_UPDATE_INTERVAL_MS);

    return () => {
      window.clearInterval(binIntervalId);
      window.clearInterval(truckIntervalId);
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      return;
    }

    const database = getRealtimeDatabase();

    const unsubscribeRoot = onValue(
      ref(database, "/"),
      (snapshot) => {
        const snapshotValue = (snapshot.val() ?? {}) as Record<string, unknown>;
        const updatedTimeLabel = buildUpdatedTimeLabel();

        setSensorSnapshots((previous) => {
          const nextSnapshots = { ...previous };

          for (const liveId of LIVE_LOCATION_IDS) {
            const match = findBinInData(snapshotValue, liveId);

            if (!match) {
              continue;
            }

            const fill = extractFill(match);
            const gas = extractGas(match);
            const weightPercent = extractWeight(match);

            nextSnapshots[liveId] = {
              fill: fill ?? nextSnapshots[liveId]?.fill ?? 0,
              gas: gas ?? nextSnapshots[liveId]?.gas ?? 0,
              weightPercent:
                weightPercent ?? nextSnapshots[liveId]?.weightPercent ?? 0,
              fillStatus: extractStatus(match, ["LevelStatus", "levelStatus"]),
              gasStatus: extractStatus(match, ["GasStatus", "gasStatus"]),
              weightStatus: extractStatus(match, [
                "WeightStatus",
                "weightStatus",
                "LoadStatus",
                "loadStatus",
              ]),
              isLive: true,
            };
          }

          return {
            ...simulateDependentBins(nextSnapshots, locationsRef.current),
          };
        });
        setTruck((previousTruck) => {
          const truckMatch = findTruckInData(snapshotValue);

          if (!truckMatch) {
            hasLiveTruckFeedRef.current = false;
            return previousTruck;
          }

          const latitude = extractLatitude(truckMatch);
          const longitude = extractLongitude(truckMatch);

          if (latitude === null || longitude === null) {
            hasLiveTruckFeedRef.current = false;
            return previousTruck;
          }

          hasLiveTruckFeedRef.current = true;

          return {
            label:
              extractStatus(truckMatch, ["name", "Name", "label", "Label"]) ??
              "Collection Truck",
            latitude,
            longitude,
            speedKmh: extractSpeed(truckMatch) ?? previousTruck?.speedKmh,
            status:
              extractStatus(truckMatch, [
                "status",
                "Status",
                "truckStatus",
                "vehicleStatus",
              ]) ?? "Live tracking",
            lastSeenLabel: `Updated: ${updatedTimeLabel}`,
            isLive: true,
          };
        });

        setConnectionState("live");
        setErrorMessage(null);
        setLastUpdatedLabel(`Updated: ${updatedTimeLabel}`);
      },
      (error) => {
        setConnectionState("error");
        setErrorMessage(error.message || "Unable to stream Firebase data.");
      },
    );

    const unsubscribeCustomLocations = onValue(
      ref(database, "/customLocations"),
      (snapshot) => {
        const value = snapshot.val() as Record<
          string,
          { name?: string; lat?: number; lng?: number }
        > | null;

        if (!value) {
          setCustomLocations([]);
          return;
        }

        const nextCustomLocations = Object.entries(value)
          .map(([id, location]) => ({
            id,
            name: location.name?.trim() || id,
            latitude: Number(location.lat) || 0,
            longitude: Number(location.lng) || 0,
            isDefault: false,
          }))
          .sort((firstLocation, secondLocation) =>
            firstLocation.id.localeCompare(secondLocation.id),
          );

        setCustomLocations(nextCustomLocations);
      },
      (error) => {
        setErrorMessage(error.message || "Unable to load custom locations.");
      },
    );

    const unsubscribeDeletedLocations = onValue(
      ref(database, "/deletedLocations"),
      (snapshot) => {
        const value = snapshot.val() as Record<string, boolean | null> | null;

        if (!value) {
          setDeletedLocationIds([]);
          return;
        }

        const nextDeletedLocationIds = Object.entries(value)
          .filter(([, isDeleted]) => Boolean(isDeleted))
          .map(([locationId]) => locationId)
          .sort((firstId, secondId) => firstId.localeCompare(secondId));

        setDeletedLocationIds(nextDeletedLocationIds);
      },
      (error) => {
        setErrorMessage(error.message || "Unable to load deleted locations.");
      },
    );

    return () => {
      unsubscribeRoot();
      unsubscribeCustomLocations();
      unsubscribeDeletedLocations();
    };
  }, []);

  const bins = sortBinsBySeverity(
    locations.map((location) => {
      const snapshot = sensorSnapshots[location.id] ?? {
        fill: 0,
        gas: 0,
        weightPercent: 0,
        isLive: false,
      };
      const fillSeverity = normalizeSeverity(snapshot.fillStatus, snapshot.fill);
      const gasSeverity = normalizeSeverity(snapshot.gasStatus, snapshot.gas);
      const weightSeverity = normalizeSeverity(
        snapshot.weightStatus,
        snapshot.weightPercent,
      );
      const overallSeverity =
        fillSeverity === "high" ||
        gasSeverity === "high" ||
        weightSeverity === "high"
          ? "high"
          : fillSeverity === "medium" ||
              gasSeverity === "medium" ||
              weightSeverity === "medium"
            ? "medium"
            : "low";

      return {
        ...location,
        fill: snapshot.fill,
        gas: snapshot.gas,
        weightPercent: snapshot.weightPercent,
        fillSeverity,
        gasSeverity,
        weightSeverity,
        overallSeverity,
        fillLabel: getSeverityLabel(fillSeverity),
        gasLabel: getSeverityLabel(gasSeverity),
        weightLabel: getSeverityLabel(weightSeverity),
        isLive: snapshot.isLive,
      };
    }),
  );

  const criticalBins = bins.filter((bin) => bin.overallSeverity === "high");

  async function addCustomLocation(input: CustomLocationInput) {
    const matchingIds = [...DEFAULT_CAMPUS_LOCATIONS, ...customLocations, ...localDemoLocations]
      .map((location) => location.id.match(/location(\d+)/i)?.[1])
      .filter(Boolean)
      .map((value) => Number(value));
    const nextNumericId =
      matchingIds.length > 0 ? Math.max(...matchingIds) + 1 : 1;
    const nextLocationId = `location${nextNumericId}`;

    const nextLocation: CampusLocation = {
      id: nextLocationId,
      name: input.name.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      isDefault: false,
    };

    if (!isFirebaseConfigured()) {
      setLocalDemoLocations((previous) => [...previous, nextLocation]);
      setSensorSnapshots((previous) => ({
        ...previous,
        [nextLocationId]: {
          fill: randomPercent(),
          gas: randomPercent(),
          weightPercent: randomPercent(),
          isLive: false,
        },
      }));
      return nextLocation.name;
    }

    await set(ref(getRealtimeDatabase(), `/customLocations/${nextLocationId}`), {
      name: nextLocation.name,
      lat: nextLocation.latitude,
      lng: nextLocation.longitude,
    });

    return nextLocation.name;
  }

  async function deleteCustomLocation(locationId: string) {
    const location = locationsRef.current.find((item) => item.id === locationId);

    if (!location) {
      throw new Error("Location not found.");
    }

    if (!isFirebaseConfigured()) {
      if (location.isDefault) {
        setDeletedLocationIds((previous) =>
          previous.includes(locationId) ? previous : [...previous, locationId],
        );
      } else {
        setLocalDemoLocations((previous) =>
          previous.filter((item) => item.id !== locationId),
        );
      }
      setSensorSnapshots((previous) => {
        const nextSnapshots = { ...previous };
        delete nextSnapshots[locationId];
        return nextSnapshots;
      });
      return location.name;
    }

    if (location.isDefault) {
      await set(ref(getRealtimeDatabase(), `/deletedLocations/${locationId}`), true);
    } else {
      await remove(ref(getRealtimeDatabase(), `/customLocations/${locationId}`));
      await remove(ref(getRealtimeDatabase(), `/deletedLocations/${locationId}`));
    }

    return location.name;
  }

  return (
    <CampusMonitoringContext.Provider
      value={{
        bins,
        criticalBins,
        truck,
        lastUpdatedLabel,
        connectionState,
        errorMessage,
        alertCount: criticalBins.length,
        addCustomLocation,
        deleteCustomLocation,
      }}
    >
      {children}
    </CampusMonitoringContext.Provider>
  );
}

export function useCampusMonitoring() {
  const context = useContext(CampusMonitoringContext);

  if (!context) {
    throw new Error(
      "useCampusMonitoring must be used within a CampusMonitoringProvider.",
    );
  }

  return context;
}
