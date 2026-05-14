"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Loader2, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LocationResult = {
    id: string | number;
    name: string;
    type: "district" | "destination";
    subtitle: string;
    lat: number | null;
    lng: number | null;
    distance?: number; // km, computed on frontend
};

export type SelectedLocation = {
    id: string | number;
    name: string;
    type: "district" | "destination";
    lat: number | null;
    lng: number | null;
};

interface LocationAutocompleteProps {
    value: string;                          // controlled input value
    onChange: (val: string) => void;        // raw text change
    onSelect: (loc: SelectedLocation) => void; // structured selection
    onClear?: () => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

// ─── Haversine distance (km) ──────────────────────────────────────────────────

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

function formatDistance(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km} km`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LocationAutocomplete({
    value,
    onChange,
    onSelect,
    onClear,
    placeholder = "Tag a location (e.g. Pokhara, Everest Base Camp)",
    disabled = false,
    className = "",
}: LocationAutocompleteProps) {
    const [results, setResults] = useState<LocationResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [gpsRequesting, setGpsRequesting] = useState(false);
    const [selected, setSelected] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    // ── GPS: request once on mount, silently fail ──────────────────────────
    useEffect(() => {
        if (!navigator.geolocation) return;
        setGpsRequesting(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setGpsRequesting(false);
            },
            () => {
                // silently ignore denial
                setGpsRequesting(false);
            },
            { timeout: 5000 }
        );
    }, []);

    // ── Close dropdown on outside click ───────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ── Debounced search ──────────────────────────────────────────────────
    const search = useCallback(async (q: string) => {
        if (!q || q.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        // Cancel any in-flight request
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        try {
            const res = await fetch(
                `${API_BASE}/api/tourism/search?q=${encodeURIComponent(q)}`,
                { signal: abortRef.current.signal }
            );
            if (!res.ok) throw new Error("search failed");
            const data = await res.json();

            let enriched: LocationResult[] = data.results || [];

            // Attach real road distances if GPS is available using OSRM Table API
            if (userLocation && enriched.length > 0) {
                const validDestinations = enriched.filter(r => r.lat != null && r.lng != null);

                if (validDestinations.length > 0) {
                    try {
                        const coords = [
                            `${userLocation.lng},${userLocation.lat}`,
                            ...validDestinations.map(r => `${r.lng},${r.lat}`)
                        ].join(';');

                        const osrmRes = await fetch(
                            `https://router.project-osrm.org/table/v1/driving/${coords}?sources=0&annotations=distance`,
                            { signal: abortRef.current?.signal }
                        );

                        if (osrmRes.ok) {
                            const osrmData = await osrmRes.json();
                            if (osrmData.code === "Ok" && osrmData.distances && osrmData.distances[0]) {
                                const distances = osrmData.distances[0];

                                enriched = enriched.map(r => {
                                    if (r.lat == null || r.lng == null) return r;
                                    const index = validDestinations.findIndex(vd => vd.id === r.id);
                                    
                                    if (index !== -1 && distances[index + 1] != null) {
                                        const distInKm = distances[index + 1] / 1000;
                                        return { ...r, distance: parseFloat(distInKm.toFixed(1)) };
                                    }
                                    return r;
                                });
                            }
                        }
                    } catch (osrmErr: any) {
                        if (osrmErr.name !== "AbortError") {
                            console.warn("OSRM routing failed, falling back to straight-line distance.", osrmErr);
                        }
                    }
                }

                // Fallback to Haversine for any missing points (e.g. no roads found)
                enriched = enriched.map((r: LocationResult) => {
                    if (r.lat != null && r.lng != null && r.distance == null) {
                        return { ...r, distance: getDistance(userLocation.lat, userLocation.lng, r.lat, r.lng) };
                    }
                    return r;
                });
            }

            // Sort by distance if GPS available
            if (userLocation) {
                enriched.sort((a, b) => {
                    if (a.distance == null && b.distance == null) return 0;
                    if (a.distance == null) return 1;
                    if (b.distance == null) return -1;
                    return a.distance - b.distance;
                });
            }

            setResults(enriched);
            setIsOpen(true);
        } catch (err: any) {
            if (err.name !== "AbortError") {
                setResults([]);
            }
        } finally {
            setLoading(false);
        }
    }, [userLocation]);

    // ── Handle input change with debounce ─────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        setSelected(false);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(val), 300);
    };

    // ── Handle selection ──────────────────────────────────────────────────
    const handleSelect = (loc: LocationResult) => {
        onChange(loc.name);
        setSelected(true);
        setIsOpen(false);
        setResults([]);
        onSelect({
            id: loc.id,
            name: loc.name,
            type: loc.type,
            lat: loc.lat,
            lng: loc.lng,
        });
    };

    // ── Clear ─────────────────────────────────────────────────────────────
    const handleClear = () => {
        onChange("");
        setSelected(false);
        setResults([]);
        setIsOpen(false);
        if (onClear) onClear();
    };

    const typeLabel: Record<string, string> = {
        district: "District",
        destination: "Destination",
    };

    const typeColor: Record<string, string> = {
        district: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        destination: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input */}
            <div className="relative group/input">
                <MapPin
                    size={15}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                        selected ? "text-emerald-400" : "text-slate-600 group-focus-within/input:text-emerald-400"
                    }`}
                />
                <input
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                    className={`w-full bg-emerald-500/[0.03] border rounded-2xl pl-10 pr-10 py-4 text-xs font-medium text-white 
                        focus:outline-none transition-all placeholder:text-slate-700 italic
                        ${selected
                            ? "border-emerald-500/40 bg-emerald-500/[0.05]"
                            : "border-emerald-500/20 focus:border-emerald-500/40 focus:bg-emerald-500/[0.04]"
                        }`}
                />
                {/* Right side: GPS pulse or clear */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {loading && <Loader2 size={14} className="text-slate-500 animate-spin" />}
                    {gpsRequesting && !loading && (
                        <span title="Requesting GPS...">
                            <Navigation size={13} className="text-blue-400 animate-pulse" />
                        </span>
                    )}
                    {userLocation && !gpsRequesting && !loading && !value && (
                        <span title="GPS active – distances enabled">
                            <Navigation size={13} className="text-emerald-400/50" />
                        </span>
                    )}
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-slate-600 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            {results.length} Location{results.length !== 1 ? "s" : ""}
                        </span>
                        {userLocation && (
                            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest">
                                <Navigation size={9} />
                                Near You
                            </span>
                        )}
                    </div>

                    {/* Results */}
                    <ul className="max-h-64 overflow-y-auto py-1.5 divide-y divide-white/[0.03]">
                        {results.map((r) => (
                            <li key={`${r.type}-${r.id}`}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(r)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors text-left group/item"
                                >
                                    {/* Pin icon */}
                                    <div className="shrink-0 w-8 h-8 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover/item:border-emerald-500/20 transition-colors">
                                        <MapPin size={14} className={r.type === "district" ? "text-blue-400" : "text-emerald-400"} />
                                    </div>

                                    {/* Text */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate leading-tight">
                                            {r.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                            {r.subtitle}
                                        </p>
                                    </div>

                                    {/* Right: type badge + distance */}
                                    <div className="shrink-0 flex flex-col items-end gap-1">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${typeColor[r.type]}`}>
                                            {typeLabel[r.type]}
                                        </span>
                                        {r.distance != null && (
                                            <span className="text-[9px] font-semibold text-slate-500">
                                                {formatDistance(r.distance)}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Footer hint */}
                    {!userLocation && !gpsRequesting && (
                        <div className="px-4 py-2 border-t border-white/5 text-[9px] text-slate-600 font-medium text-center">
                            Allow location access to see distances
                        </div>
                    )}
                </div>
            )}

            {/* No results */}
            {isOpen && !loading && results.length === 0 && value.length >= 2 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl px-4 py-4 text-center text-slate-500 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                    No locations matched "<span className="text-white font-bold">{value}</span>"
                </div>
            )}
        </div>
    );
}
