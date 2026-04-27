"use client";

import { useEffect, useRef } from "react";
import type { Solicitor } from "@/lib/solicitorData";

interface Props {
  solicitors:    Solicitor[];
  withDistance:  (s: Solicitor) => number | null;
  hoveredId:     string | null;
  onPinClick:    (id: string) => void;
  searchLat:     number | null;
  searchLng:     number | null;
}

export default function SolicitorMap({
  solicitors, withDistance, hoveredId, onPinClick, searchLat, searchLng,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef       = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef   = useRef<Map<string, any>>(new Map());

  /* ── Boot Leaflet once ── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      /* Default icon path fix for webpack */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const center: [number, number] = searchLat && searchLng
        ? [searchLat, searchLng]
        : [52.5, -1.5];

      const map = L.map(containerRef.current!).setView(center, searchLat ? 10 : 6);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      /* Add search location marker */
      if (searchLat && searchLng) {
        L.circleMarker([searchLat, searchLng], {
          radius: 8, color: "#0f6e56", fillColor: "#0f6e56", fillOpacity: 1, weight: 2,
        }).addTo(map).bindPopup("Your search location");
      }

      /* Add solicitor pins */
      solicitors.forEach((s) => {
        const dist = withDistance(s);
        const marker = L.marker([s.lat, s.lng])
          .addTo(map)
          .bindPopup(
            `<strong>${s.firmName}</strong><br/>${s.solicitorName}<br/>${s.city}${dist !== null ? `<br/>${dist.toFixed(1)} miles away` : ""}`
          );
        marker.on("click", () => onPinClick(s.id));
        markersRef.current.set(s.id, marker);
      });
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Highlight hovered pin ── */
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then(({ default: L }) => {
      markersRef.current.forEach((marker, id) => {
        const isHovered = id === hoveredId;
        const icon = L.icon({
          iconUrl: isHovered
            ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
            : "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: isHovered
            ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
            : "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize:    isHovered ? [30, 49] : [25, 41],
          iconAnchor:  isHovered ? [15, 49] : [12, 41],
          popupAnchor: [1, -34],
          shadowSize:  [41, 41],
        });
        marker.setIcon(icon);
        if (isHovered) marker.openPopup();
      });
    });
  }, [hoveredId]);

  /* ── Sync markers when solicitors list changes ── */
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then(({ default: L }) => {
      /* Remove old markers not in new list */
      const currentIds = new Set(solicitors.map(s => s.id));
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove();
          markersRef.current.delete(id);
        }
      });
      /* Add new markers */
      solicitors.forEach((s) => {
        if (!markersRef.current.has(s.id)) {
          const dist = withDistance(s);
          const marker = L.marker([s.lat, s.lng])
            .addTo(mapRef.current)
            .bindPopup(
              `<strong>${s.firmName}</strong><br/>${s.solicitorName}<br/>${s.city}${dist !== null ? `<br/>${dist.toFixed(1)} miles away` : ""}`
            );
          marker.on("click", () => onPinClick(s.id));
          markersRef.current.set(s.id, marker);
        }
      });

      /* Fit bounds */
      if (solicitors.length > 0) {
        const bounds = L.latLngBounds(solicitors.map(s => [s.lat, s.lng] as [number, number]));
        if (searchLat && searchLng) bounds.extend([searchLat, searchLng]);
        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitors]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: "420px", borderRadius: "12px", overflow: "hidden" }}
    />
  );
}
