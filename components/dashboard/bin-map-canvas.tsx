"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { GarbageBin } from "@/lib/firebase/types";

type BinMapCanvasProps = {
  bins: GarbageBin[];
};

const defaultCenter: [number, number] = [22.5726, 88.3639];

const binMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getMapCenter(bins: GarbageBin[]) {
  if (bins.length === 0) {
    return defaultCenter;
  }

  const totalLatitude = bins.reduce((sum, bin) => sum + bin.location.latitude, 0);
  const totalLongitude = bins.reduce(
    (sum, bin) => sum + bin.location.longitude,
    0,
  );

  return [
    totalLatitude / bins.length,
    totalLongitude / bins.length,
  ] as [number, number];
}

function formatWeight(weightInGrams: number) {
  if (weightInGrams >= 1000) {
    return `${(weightInGrams / 1000).toFixed(2)} kg`;
  }

  return `${weightInGrams.toFixed(0)} g`;
}

export function BinMapCanvas({ bins }: BinMapCanvasProps) {
  const center = getMapCenter(bins);
  const zoom = bins.length > 1 ? 12 : 13;

  return (
    <MapContainer
      center={center}
      className="h-full min-h-[420px] w-full rounded-[28px]"
      scrollWheelZoom
      zoom={zoom}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {bins.map((bin) => (
        <Marker
          key={bin.binId}
          icon={binMarkerIcon}
          position={[bin.location.latitude, bin.location.longitude]}
        >
          <Popup>
            <div className="min-w-[180px] space-y-2 text-sm text-slate-800">
              <p className="text-base font-semibold text-slate-950">{bin.binId}</p>
              {bin.locationName ? (
                <p className="font-medium text-slate-700">{bin.locationName}</p>
              ) : null}
              <p>Fill Level: {bin.fillLevel.toFixed(0)}%</p>
              <p>Gas Level: {bin.gasLevel.toFixed(0)}</p>
              <p>Weight: {bin.weight.toFixed(0)} g</p>
              <p className="text-slate-500">{formatWeight(bin.weight)}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
