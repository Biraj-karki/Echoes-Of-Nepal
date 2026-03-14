"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search, RefreshCcw, ArrowRight } from "lucide-react";
import MapWrapper from "@/components/Map";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Destination = {
    key: string;
    name: string;
    storyCount: number;
    latestAt: string | null;
    coverUrl: string | null;
    lat?: number;
    lng?: number;
};

const normalizeKey = (name: string) =>
    name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

const resolveUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function MapHome() {
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");

    const fetchStories = async () => {
        setLoading(true);
        try {
            const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
            const res = await fetch(`${API_BASE}/api/stories`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            setStories(Array.isArray(data?.stories) ? data.stories : []);
        } catch (e) {
            console.error(e);
            setStories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const destinations = useMemo(() => {
        const map = new Map<string, Destination>();

        for (const s of stories) {
            const loc = (s.location_tag || "").trim();
            if (!loc) continue;

            const key = normalizeKey(loc);
            const when = s.createdAt || s.created_at || null;

            // Attempt to find image
            const media = Array.isArray(s.media) ? s.media : [];
            const firstImage = media.find((m: any) => {
                const url = m.media_url || "";
                const type = (m.media_type || "").toLowerCase();
                return !!url && !(type.includes("video") || /\.(mp4|mov|webm)$/i.test(url));
            });

            const existing = map.get(key);
            if (!existing) {
                map.set(key, {
                    key,
                    name: loc,
                    storyCount: 1,
                    latestAt: when,
                    coverUrl: firstImage?.media_url ? resolveUrl(firstImage.media_url) : null,
                });
            } else {
                existing.storyCount += 1;
                if (when && (!existing.latestAt || new Date(when) > new Date(existing.latestAt))) {
                    existing.latestAt = when;
                }
                if (!existing.coverUrl && firstImage?.media_url) {
                    existing.coverUrl = resolveUrl(firstImage.media_url);
                }
            }
        }

        let list = Array.from(map.values());
        const q = query.trim().toLowerCase();
        if (q) {
            list = list.filter((d) => d.name.toLowerCase().includes(q));
        }

        // Sort by count
        return list.sort((a, b) => b.storyCount - a.storyCount);
    }, [stories, query]);

    // Handle map selection to scroll to grid
    const onMapSelect = (key: string) => {
        const el = document.getElementById(`dest-${key}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col">
            <div className="relative h-[45vh] w-full border-b border-white/10">
                <MapWrapper destinations={destinations} onSelect={onMapSelect} />

                {/* Overlay Title */}
                <div className="absolute bottom-6 left-6 z-[400] bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl max-w-sm shadow-2xl">
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Explore Nepal</h1>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        Discover hidden stories from the Himalayas. Click markers to explore.
                    </p>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="sticky top-16 z-30 bg-[#020617]/80 backdrop-blur-md border-b border-white/5 py-5 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
                    <div className="flex-1 flex items-center gap-3 bg-white/[0.07] border border-white/10 rounded-2xl px-5 py-3 focus-within:bg-white/[0.1] focus-within:border-white/20 transition-all hover:bg-white/[0.09]">
                        <Search size={20} className="text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search destinations (e.g. Pokhara, Everest)..."
                            className="bg-transparent border-none text-white text-base font-medium w-full focus:outline-none placeholder:text-slate-500"
                        />
                    </div>
                    <div className="text-sm text-slate-400 font-medium whitespace-nowrap hidden sm:block">
                        {destinations.length} Places Found
                    </div>
                </div>
            </div>

            {/* GRID */}
            <div className="flex-1 max-w-7xl mx-auto px-5 py-10 w-full">
                {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">Loading destinations...</div>
                ) : destinations.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        No destinations found. Try posting a story!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {destinations.map((d) => (
                            <Link
                                key={d.key}
                                id={`dest-${d.key}`}
                                href={`/explore/${d.key}`}
                                className="group relative h-[280px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900"
                            >
                                {d.coverUrl ? (
                                    <img
                                        src={d.coverUrl}
                                        alt={d.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-slate-800 grid place-items-center text-slate-600">
                                        <MapPin size={32} />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                                        {d.name}
                                    </h3>
                                    <div className="flex items-center justify-between text-sm text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                                            {d.storyCount} Stories
                                        </span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 flex items-center gap-1 text-white font-medium">
                                            Explore <ArrowRight size={14} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
