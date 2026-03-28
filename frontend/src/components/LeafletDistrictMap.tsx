"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletDistrictMapProps {
    selectedDistrictId: string | null;
    onSelectDistrict: (id: string, name: string) => void;
}

export default function LeafletDistrictMap({ selectedDistrictId, onSelectDistrict }: LeafletDistrictMapProps) {
    const [geoData, setGeoData] = useState<any>(null);

    // Center of Nepal
    const defaultCenter: [number, number] = [28.3949, 84.1240];
    const nepalBounds: [[number, number], [number, number]] = [
        [26.347, 80.058], 
        [30.447, 88.201]
    ];

    useEffect(() => {
        fetch("/data/nepal-districts.geojson")
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Error loading GeoJSON", err));
    }, []);

    const style = (feature: any) => {
        const isSelected = selectedDistrictId === feature.properties.DISTRICT;
        return {
            fillColor: isSelected ? "#3b82f6" : "#0f172a", // blue if selected
            weight: 1,
            opacity: 1,
            color: "#334155", // slate-700 lines
            dashArray: "3",
            fillOpacity: isSelected ? 0.6 : 0.4,
        };
    };

    const highlightFeature = (e: any) => {
        const layer = e.target;
        if (layer.feature.properties.DISTRICT !== selectedDistrictId) {
            layer.setStyle({
                weight: 2,
                color: "#94a3b8",
                dashArray: "",
                fillOpacity: 0.7,
                fillColor: "#1e293b",
            });
        }
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    };

    const resetHighlight = (e: any) => {
        const layer = e.target;
        if (layer.feature.properties.DISTRICT !== selectedDistrictId) {
            layer.setStyle(style(layer.feature));
        }
    };

    const onEachFeature = (feature: any, layer: any) => {
        const name = (feature.properties.DISTRICT || "").replace(/^\w/, (c: string) => c.toUpperCase());
        
        layer.bindTooltip(`<div class="font-bold text-slate-800">${name}</div>`, {
            sticky: true,
            className: "custom-tooltip"
        });

        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: (e: any) => {
                onSelectDistrict(feature.properties.DISTRICT, name);
                const map = e.target._map;
                map.flyToBounds(e.target.getBounds(), { padding: [50, 50], duration: 1.5 });
            }
        });
    };

    return (
        <MapContainer
            center={defaultCenter}
            zoom={7}
            minZoom={6}
            maxBounds={nepalBounds}
            maxBoundsViscosity={1.0}
            zoomControl={false}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", background: "#020617" }} // very dark slate
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            />
            {geoData && (
                <GeoJSON 
                    key={selectedDistrictId || 'base'} // Re-render trick sometimes needed for GeoJSON state, or use a custom hook to update layers. Re-rendering entire GeoJSON is easy for now.
                    data={geoData} 
                    style={style} 
                    onEachFeature={onEachFeature} 
                />
            )}
        </MapContainer>
    );
}
