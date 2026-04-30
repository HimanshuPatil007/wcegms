import type { GarbageBin } from "@/lib/firebase/types";

export const GAS_HAZARD_THRESHOLD = 70;

export type FillStatus = "Low" | "Medium" | "Full";
export type GasStatus = "Safe" | "Elevated" | "Hazard";

export function getFillStatus(fillLevel: number): FillStatus {
  if (fillLevel >= 80) {
    return "Full";
  }

  if (fillLevel >= 50) {
    return "Medium";
  }

  return "Low";
}

export function getGasStatus(gasLevel: number): GasStatus {
  if (gasLevel >= GAS_HAZARD_THRESHOLD) {
    return "Hazard";
  }

  if (gasLevel >= GAS_HAZARD_THRESHOLD * 0.6) {
    return "Elevated";
  }

  return "Safe";
}

export function isCriticalBin(bin: GarbageBin) {
  return getFillStatus(bin.fillLevel) === "Full" || getGasStatus(bin.gasLevel) === "Hazard";
}

export function getStatusTone(status: FillStatus | GasStatus) {
  switch (status) {
    case "Low":
    case "Safe":
      return "emerald";
    case "Medium":
    case "Elevated":
      return "amber";
    case "Full":
    case "Hazard":
      return "rose";
  }
}

export function getStatusClasses(tone: "emerald" | "amber" | "rose") {
  const classMap = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
  } satisfies Record<"emerald" | "amber" | "rose", string>;

  return classMap[tone];
}
