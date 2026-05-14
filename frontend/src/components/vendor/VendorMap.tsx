"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { VendorListing } from "./VendorListingCard";

// Fix for default Leaflet icon issues in Next.js
const iconConfig = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
};

// Mock coordinates for districts if listing doesn't have them
// To be replaced with real data in production
const DISTRICT_COORDS: Record<string, [number, number]> = {
    "kathmandu": [27.7172, 85.3240],
    "pokhara": [28.2096, 83.9856],
    "chitwan": [27.5291, 84.3542],
    "mustang": [28.9985, 83.8473],
    "solukhumbu": [27.8000, 86.7200],
    "kaski": [28.2667, 83.9667],
};

interface VendorMapProps {
    listings: VendorListing[];
    selectedId?: number | null;
    onMarkerClick?: (id: number) => void;
    hoveredId?: number | null;
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom?: number }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || map.getZoom(), { animate: true });
        }
    }, [center, zoom, map]);
    return null;
}

export default function VendorMap({ listings, selectedId, onMarkerClick, hoveredId }: VendorMapProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        iconConfig();
    }, []);

    if (!isClient) return <div className="w-full h-full bg-slate-900 animate-pulse" />;

    const defaultCenter: [number, number] = [28.3949, 84.1240];
    
    // Determine active center
    let activeCenter = defaultCenter;
    let activeZoom = 7;

    if (selectedId) {
        const selected = listings.find(l => l.id === selectedId);
        if (selected) {
            const coords = (selected as any).lat && (selected as any).lng 
                ? [parseFloat((selected as any).lat), parseFloat((selected as any).lng)]
                : DISTRICT_COORDS[selected.district_slug?.toLowerCase() || ""] || defaultCenter;
            activeCenter = coords as [number, number];
            activeZoom = 13;
        }
    }

    return (
        <MapContainer
            center={defaultCenter}
            zoom={7}
            zoomControl={false}
            style={{ height: "100%", width: "100%", background: "#020617" }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <ZoomControl position="bottomright" />
            <MapUpdater center={activeCenter} zoom={activeZoom} />

            {listings.map((l, idx) => {
                // Generate slightly offset coordinates if multiple listings share a district
                const baseCoords = (l as any).lat && (l as any).lng 
                    ? [parseFloat((l as any).lat), parseFloat((l as any).lng)]
                    : DISTRICT_COORDS[l.district_slug?.toLowerCase() || ""] || defaultCenter;
                
                // Add jitter
                const coords: [number, number] = [
                    baseCoords[0] + (Math.sin(idx * 1.5) * 0.015),
                    baseCoords[1] + (Math.cos(idx * 1.5) * 0.015)
                ];

                const isHovered = hoveredId === l.id;
                const isSelected = selectedId === l.id;

                // Simple custom price tag icon
                const priceTagIcon = L.divIcon({
                    className: "custom-div-icon",
                    html: `
                        <div class="px-2 py-1 rounded-full border-2 transition-all duration-300 transform shadow-xl
                            ${isSelected ? 'bg-white text-black border-blue-500 scale-125 z-[1000]' : 
                               isHovered ? 'bg-blue-600 text-white border-white scale-110 z-[500]' : 
                               'bg-slate-900/90 text-white border-white/20'}" 
                             style="font-family: var(--font-inter); font-weight: 900; font-size: 10px; white-space: nowrap;">
                            ${l.price || '??'}
                        </div>
                    `,
                    iconSize: [40, 24],
                    iconAnchor: [20, 12]
                });

                return (
                    <Marker 
                        key={l.id} 
                        position={coords} 
                        icon={priceTagIcon}
                        eventHandlers={{
                            click: () => onMarkerClick?.(l.id)
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px] bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
                                {l.image_url && <img src={l.image_url} className="w-full h-24 object-cover rounded-lg mb-2" />}
                                <div className="text-white font-black text-xs uppercase italic">{l.title}</div>
                                <div className="text-blue-400 font-bold text-[10px] mt-1">{l.price}</div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
