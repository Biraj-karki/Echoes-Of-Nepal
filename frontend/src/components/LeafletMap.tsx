"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Coordinates for known places
export const NEPAL_LOCATIONS: Record<string, [number, number]> = {
    "Kathmandu": [27.7172, 85.3240],
    "Pokhara": [28.2096, 83.9856],
    "Chitwan": [27.5291, 84.3542],
    "Lalitpur": [27.6644, 85.3188],
    "Bhaktapur": [27.6710, 85.4298],
    "Lumbini": [27.4840, 83.2760],
    "Everest Base Camp": [28.0072, 86.8595],
    "Annapurna Base Camp": [28.5300, 83.8780],
    "Mustang": [29.1988, 83.9485],
    "Rara": [29.5353, 82.0863],
    "Illam": [26.9080, 87.9180],
    "Nagarkot": [27.7174, 85.5046],
    "Bandipur": [27.9250, 84.4070],
    "Ghandruk": [28.3760, 83.8070],
    "Manang": [28.6660, 84.0170],
    "Muktinath": [28.8168, 83.8710],
    "Janakpur": [26.7290, 85.9270],
    "Biratnagar": [26.4525, 87.2718],
    "Dharan": [26.8065, 87.2846],
    "Dhulikhel": [27.6253, 85.5410],
};

interface LeafletMapProps {
    destinations: any[];
    onSelect: (key: string) => void;
}

function MapController({ selectedKey }: { selectedKey: string | null }) {
    const map = useMap();
    useEffect(() => {
        if (selectedKey) {
            // Find matching coords? We don't have the object here easily unless passed properly
            // For now, this component just re-renders tile layer
        }
    }, [selectedKey, map]);
    return null;
}

export default function LeafletMap({ destinations, onSelect }: LeafletMapProps) {
    // Center of Nepal roughly
    const defaultCenter: [number, number] = [28.3949, 84.1240];

    // Bounds for Nepal (approximate box)
    const nepalBounds: [[number, number], [number, number]] = [
        [26.347, 80.058], // Southwest
        [30.447, 88.201]  // Northeast
    ];

    return (
        <MapContainer
            center={defaultCenter}
            zoom={7}
            minZoom={6}
            maxBounds={nepalBounds}
            maxBoundsViscosity={1.0}
            scrollWheelZoom={true} // Smoother experience usually allows scroll, maybe keep false if it interferes with page scroll
            style={{ height: "100%", width: "100%", zIndex: 0, background: "#0f172a" }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {destinations.map((d) => {
                // Try to match exact name or fuzzy?
                // We do simple exact string match from our dictionary
                let coords = NEPAL_LOCATIONS[d.name] || NEPAL_LOCATIONS[d.name.split(" ")[0]]; // Try "Kathmandu" if "Kathmandu City"

                // If not found, maybe random nearby offset? No, better to skip or put in center
                if (!coords) return null;

                return (
                    <Marker
                        key={d.key}
                        position={coords}
                        eventHandlers={{
                            click: () => onSelect(d.key),
                        }}
                    >
                        <Popup>
                            <div className="text-slate-900 font-semibold p-1">
                                {d.name}
                                <div className="text-xs font-normal text-slate-600">
                                    {d.storyCount} stories
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
