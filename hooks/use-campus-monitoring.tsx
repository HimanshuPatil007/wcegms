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
  fillStatus?: string;
  gasStatus?: string;
  isLive: boolean;
};

export type MonitoringBin = CampusLocation & {
  fill: number;
  gas: number;
  fillSeverity: MonitoringSeverity;
  gasSeverity: MonitoringSeverity;
  overallSeverity: MonitoringSeverity;
  fillLabel: string;
  gasLabel: string;
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

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

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

function extractStatus(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const resolved = pickMapValue(value as Record<string, unknown>, keys);

  return typeof resolved === "string" && resolved.trim() ? resolved : undefined;
}

function createSeededSensors(locations: CampusLocation[]) {
  const seeded: Record<string, SensorSnapshot> = {};

  for (const location of locations) {
    seeded[location.id] = {
      fill: randomPercent(),
      gas: randomPercent(),
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
      (extractFill(directMatch) !== null || extractGas(directMatch) !== null)
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
  let liveCount = 0;

  for (const liveId of LIVE_LOCATION_IDS) {
    const liveBin = nextSensors[liveId];

    if (!liveBin) {
      continue;
    }

    totalFill += liveBin.fill;
    totalGas += liveBin.gas;
    liveCount += 1;
  }

  const averageFill = liveCount > 0 ? totalFill / liveCount : 50;
  const averageGas = liveCount > 0 ? totalGas / liveCount : 50;

  for (const location of locations) {
    if (LIVE_LOCATION_IDS.includes(location.id as (typeof LIVE_LOCATION_IDS)[number])) {
      continue;
    }

    const existing = nextSensors[location.id] ?? {
      fill: randomPercent(),
      gas: randomPercent(),
      isLive: false,
    };

    if (Math.random() < 0.45 || !nextSensors[location.id]) {
      const fillDelta =
        Math.random() < 0.1 ? Math.random() * 18 - 5 : Math.random() * 7 - 3;
      const gasDelta =
        Math.random() < 0.1 ? Math.random() * 18 - 5 : Math.random() * 7 - 3;
      const simulatedFill = clampPercent(
        (existing.fill + fillDelta) * 0.9 + averageFill * 0.1,
      );
      const simulatedGas = clampPercent(
        (existing.gas + gasDelta) * 0.9 + averageGas * 0.1,
      );

      nextSensors[location.id] = {
        ...existing,
        fill: Math.round(simulatedFill * 10) / 10,
        gas: Math.round(simulatedGas * 10) / 10,
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
  const [sensorSnapshots, setSensorSnapshots] = useState<Record<string, SensorSnapshot>>(
    () => createSeededSensors(DEFAULT_CAMPUS_LOCATIONS),
  );
  const [connectionState, setConnectionState] =
    useState<ConnectionState>(isFirebaseConfigured() ? "connecting" : "demo");
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState(
    isFirebaseConfigured() ? "--" : "Demo mode",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const locationsRef = useRef<CampusLocation[]>(DEFAULT_CAMPUS_LOCATIONS);

  const locations = isFirebaseConfigured()
    ? [...DEFAULT_CAMPUS_LOCATIONS, ...customLocations]
    : [...DEFAULT_CAMPUS_LOCATIONS, ...localDemoLocations];

  useEffect(() => {
    locationsRef.current = isFirebaseConfigured()
      ? [...DEFAULT_CAMPUS_LOCATIONS, ...customLocations]
      : [...DEFAULT_CAMPUS_LOCATIONS, ...localDemoLocations];
  }, [customLocations, localDemoLocations]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSensorSnapshots((previous) => {
        const nextSnapshots = simulateDependentBins(
          { ...previous },
          locationsRef.current,
        );

        return { ...nextSnapshots };
      });
      setLastUpdatedLabel(
        `Updated: ${new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}`,
      );
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
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

        setSensorSnapshots((previous) => {
          const nextSnapshots = { ...previous };

          for (const liveId of LIVE_LOCATION_IDS) {
            const match = findBinInData(snapshotValue, liveId);

            if (!match) {
              continue;
            }

            const fill = extractFill(match);
            const gas = extractGas(match);

            nextSnapshots[liveId] = {
              fill: fill ?? nextSnapshots[liveId]?.fill ?? 0,
              gas: gas ?? nextSnapshots[liveId]?.gas ?? 0,
              fillStatus: extractStatus(match, ["LevelStatus", "levelStatus"]),
              gasStatus: extractStatus(match, ["GasStatus", "gasStatus"]),
              isLive: true,
            };
          }

          return {
            ...simulateDependentBins(nextSnapshots, locationsRef.current),
          };
        });

        setConnectionState("live");
        setErrorMessage(null);
        setLastUpdatedLabel(
          `Updated: ${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}`,
        );
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

    return () => {
      unsubscribeRoot();
      unsubscribeCustomLocations();
    };
  }, []);

  const bins = sortBinsBySeverity(
    locations.map((location) => {
      const snapshot = sensorSnapshots[location.id] ?? {
        fill: 0,
        gas: 0,
        isLive: false,
      };
      const fillSeverity = normalizeSeverity(snapshot.fillStatus, snapshot.fill);
      const gasSeverity = normalizeSeverity(snapshot.gasStatus, snapshot.gas);
      const overallSeverity =
        fillSeverity === "high" || gasSeverity === "high"
          ? "high"
          : fillSeverity === "medium" || gasSeverity === "medium"
            ? "medium"
            : "low";

      return {
        ...location,
        fill: snapshot.fill,
        gas: snapshot.gas,
        fillSeverity,
        gasSeverity,
        overallSeverity,
        fillLabel: getSeverityLabel(fillSeverity),
        gasLabel: getSeverityLabel(gasSeverity),
        isLive: snapshot.isLive,
      };
    }),
  );

  const criticalBins = bins.filter((bin) => bin.overallSeverity === "high");

  async function addCustomLocation(input: CustomLocationInput) {
    const matchingIds = locationsRef.current
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

    if (!location || location.isDefault) {
      throw new Error("Only custom locations can be deleted.");
    }

    if (!isFirebaseConfigured()) {
      setLocalDemoLocations((previous) =>
        previous.filter((item) => item.id !== locationId),
      );
      setSensorSnapshots((previous) => {
        const nextSnapshots = { ...previous };
        delete nextSnapshots[locationId];
        return nextSnapshots;
      });
      return location.name;
    }

    await remove(ref(getRealtimeDatabase(), `/customLocations/${locationId}`));

    return location.name;
  }

  return (
    <CampusMonitoringContext.Provider
      value={{
        bins,
        criticalBins,
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
