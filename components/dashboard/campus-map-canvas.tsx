"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type { MonitoringBin, MonitoringSeverity } from "@/hooks/use-campus-monitoring";

type CampusMapCanvasProps = {
  bins: MonitoringBin[];
  interactive?: boolean;
  zoom?: number;
};

function getMarkerColor(severity: MonitoringSeverity) {
  if (severity === "high") {
    return "#ff3b3b";
  }

  if (severity === "medium") {
    return "#ff9500";
  }

  return "#34c759";
}

function createMarkerIcon(severity: MonitoringSeverity, small = false) {
  const color = getMarkerColor(severity);
  const size = small ? 16 : 24;

  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid rgba(255,255,255,0.92);box-shadow:0 0 0 5px ${color}20,0 6px 20px rgba(15,23,42,0.45);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function getMapCenter(bins: MonitoringBin[]) {
  if (bins.length === 0) {
    return [16.8448, 74.6015] as [number, number];
  }

  const totalLatitude = bins.reduce((sum, bin) => sum + bin.latitude, 0);
  const totalLongitude = bins.reduce((sum, bin) => sum + bin.longitude, 0);

  return [
    totalLatitude / bins.length,
    totalLongitude / bins.length,
  ] as [number, number];
}

export function CampusMapCanvas({
  bins,
  interactive = true,
  zoom,
}: CampusMapCanvasProps) {
  const center = getMapCenter(bins);
  const resolvedZoom = zoom ?? (interactive ? 17 : 16);

  return (
    <MapContainer
      attributionControl={interactive}
      center={center}
      className="h-full min-h-[240px] w-full"
      doubleClickZoom={interactive}
      dragging={interactive}
      scrollWheelZoom={interactive}
      touchZoom={interactive}
      zoom={resolvedZoom}
      zoomControl={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {bins.map((bin) => (
        <Marker
          key={bin.id}
          icon={createMarkerIcon(bin.overallSeverity, !interactive)}
          position={[bin.latitude, bin.longitude]}
        >
          <Popup>
            <div className="min-w-[190px] space-y-2 font-sans text-sm text-slate-800">
              <p className="text-base font-semibold text-slate-950">{bin.name}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {bin.id}
              </p>
              <div className="flex items-center justify-between">
                <span>Fill</span>
                <span>{bin.fill.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gas</span>
                <span>{bin.gas.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Source</span>
                <span>{bin.isLive ? "Live" : "Simulated"}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
