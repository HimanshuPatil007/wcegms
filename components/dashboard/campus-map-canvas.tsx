"use client";

import L from "leaflet";
import { LayersControl, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import type {
  LiveTruck,
  MonitoringBin,
  MonitoringSeverity,
} from "@/hooks/use-campus-monitoring";

type CampusMapCanvasProps = {
  bins: MonitoringBin[];
  truck: LiveTruck | null;
  interactive?: boolean;
  heightClass?: string;
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
  const halo = small ? 4 : 7;

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${size}px"><div style="position:absolute;inset:-${halo}px;border-radius:9999px;background:${color}20;box-shadow:0 0 24px ${color}55;"></div><div style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid rgba(255,255,255,0.92);box-shadow:0 0 0 1px rgba(255,255,255,0.15),0 10px 24px rgba(15,23,42,0.45);"></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createTruckIcon(small = false) {
  const size = small ? 20 : 28;
  const halo = small ? 5 : 8;
  const truckWidth = small ? 13 : 18;
  const truckHeight = small ? 9 : 12;

  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:${size}px;height:${size}px"><div style="position:absolute;inset:-${halo}px;border-radius:9999px;background:rgba(56,189,248,0.18);box-shadow:0 0 24px rgba(34,211,238,0.45);"></div><div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;background:linear-gradient(135deg,#38bdf8,#14b8a6);border:3px solid rgba(255,255,255,0.96);box-shadow:0 0 0 1px rgba(255,255,255,0.15),0 10px 24px rgba(15,23,42,0.42);"><svg width="${truckWidth}" height="${truckHeight}" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 7.5C2 6.12 3.12 5 4.5 5H18.5C19.88 5 21 6.12 21 7.5V16H2V7.5Z" fill="#082F49"/><path d="M21 9H26.8C27.54 9 28.24 9.33 28.71 9.9L32.4 14.31C32.79 14.78 33 15.37 33 15.98V16H21V9Z" fill="#0F766E"/><circle cx="10" cy="18.5" r="3.5" fill="#F8FAFC"/><circle cx="10" cy="18.5" r="1.7" fill="#082F49"/><circle cx="26.5" cy="18.5" r="3.5" fill="#F8FAFC"/><circle cx="26.5" cy="18.5" r="1.7" fill="#082F49"/><path d="M24 11.25H27.2L29.4 13.9H24V11.25Z" fill="#BAE6FD"/><path d="M5.25 9.1H17.8" stroke="#67E8F9" stroke-width="1.7" stroke-linecap="round"/></svg></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function getMapCenter(bins: MonitoringBin[], truck: LiveTruck | null) {
  if (bins.length === 0 && !truck) {
    return [16.8448, 74.6015] as [number, number];
  }

  const totalLatitude =
    bins.reduce((sum, bin) => sum + bin.latitude, 0) + (truck?.latitude ?? 0);
  const totalLongitude =
    bins.reduce((sum, bin) => sum + bin.longitude, 0) + (truck?.longitude ?? 0);
  const totalPoints = bins.length + (truck ? 1 : 0);

  return [
    totalLatitude / Math.max(totalPoints, 1),
    totalLongitude / Math.max(totalPoints, 1),
  ] as [number, number];
}

export function CampusMapCanvas({
  bins,
  truck,
  interactive = true,
  heightClass,
  zoom,
}: CampusMapCanvasProps) {
  const center = getMapCenter(bins, truck);
  const resolvedZoom = zoom ?? (interactive ? 17 : 16);
  const mapHeightClass =
    heightClass ?? (interactive ? "min-h-[720px]" : "min-h-[360px]");

  return (
    <MapContainer
      attributionControl={interactive}
      center={center}
      className={`h-full w-full bg-[#091121] ${mapHeightClass}`}
      doubleClickZoom={interactive}
      dragging={interactive}
      scrollWheelZoom={interactive}
      touchZoom={interactive}
      zoom={resolvedZoom}
      zoomControl={interactive}
    >
      {interactive ? (
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Hybrid">
            <>
              <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                attribution='Labels &copy; Esri'
                opacity={0.9}
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
            </>
          </LayersControl.BaseLayer>
        </LayersControl>
      ) : (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      )}

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
                <span>Weight</span>
                <span>{bin.weightPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Source</span>
                <span>{bin.isLive ? "Live" : "Feed"}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {truck ? (
        <Marker
          icon={createTruckIcon(!interactive)}
          position={[truck.latitude, truck.longitude]}
        >
          <Popup>
            <div className="min-w-[210px] space-y-2 font-sans text-sm text-slate-800">
              <p className="text-base font-semibold text-slate-950">{truck.label}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Live GPS Tracker
              </p>
              <div className="flex items-center justify-between">
                <span>Latitude</span>
                <span>{truck.latitude.toFixed(5)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Longitude</span>
                <span>{truck.longitude.toFixed(5)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span>{truck.status ?? "Tracking"}</span>
              </div>
              {truck.speedKmh !== undefined ? (
                <div className="flex items-center justify-between">
                  <span>Speed</span>
                  <span>{truck.speedKmh.toFixed(0)} km/h</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between">
                <span>Source</span>
                <span>{truck.isLive ? "Live" : "Demo"}</span>
              </div>
              <div className="text-xs text-slate-500">{truck.lastSeenLabel}</div>
            </div>
          </Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
}
