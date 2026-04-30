import { DEFAULT_CAMPUS_LOCATIONS } from "@/lib/campus-locations";

const binLocationNames = Object.fromEntries(
  DEFAULT_CAMPUS_LOCATIONS.flatMap((location) => [
    [location.id, location.name],
    [
      location.id.charAt(0).toUpperCase() + location.id.slice(1),
      location.name,
    ],
    [location.id.toUpperCase(), location.name],
  ]),
) as Record<string, string>;

export function getBinLocationName(binId: string) {
  return binLocationNames[binId as keyof typeof binLocationNames] ?? null;
}
