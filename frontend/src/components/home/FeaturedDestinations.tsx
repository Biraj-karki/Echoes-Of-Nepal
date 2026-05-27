"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/LanguageProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Destination = {
    id: number;
    featured?: boolean;
    created_at: string;
    image: string;
    name: string;
    category?: string;
    rating?: string | number;
    district_name?: string;
    districtName?: string;
    description?: string;
};

export default function FeaturedDestinations() {
    const { t } = useLanguage();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/tourism/destinations`);
            const data = await res.json();
            
            if (res.ok) {
                const list: Destination[] = data.destinations || [];
                const sorted = list.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }).slice(0, 6);
                
                setDestinations(sorted);
            } else {
                setError(t("destinations.error"));
            }
        } catch {
            setError(t("destinations.connectionError"));
        } finally {
            setLoading(false);
        }
    };

    if (error) return null;

    return (
        <section className="eon-section relative">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-14 flex flex-col gap-4 text-center">
                    <div className="eon-pill mx-auto">{t("destinations.badge")}</div>
                    <h2 className="eon-page-title">{t("destinations.title")}</h2>
                    <p className="eon-page-subtitle mx-auto mt-1 max-w-2xl">
                        {t("destinations.subtitle")}
                    </p>
                    <div>
                        <Link
                            href="/destinations"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-200 transition-all hover:border-white/20 hover:bg-white/10"
                        >
                            View all destinations
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="eon-surface h-[400px] animate-pulse" />
                        ))
                    ) : (
                        destinations.map((dest, i) => (
                            <Link href={`/destination/${dest.id}`} key={dest.id || i} className="group eon-surface overflow-hidden transition-all duration-300 hover:-translate-y-1">
                                <div className="relative h-56 overflow-hidden bg-slate-800">
                                    <img 
                                        src={dest.image} 
                                        alt={dest.name} 
                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                                    
                                    <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                                        {dest.category}
                                    </div>
                                    {dest.rating && (
                                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1.5 text-xs font-bold text-yellow-400 backdrop-blur-md">
                                            <Star size={12} className="fill-current" />
                                            <span>{dest.rating}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <h3 className="mb-2 text-xl font-black text-white transition-colors group-hover:text-blue-300">
                                        {dest.name}
                                    </h3>
                                    <div className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-400">
                                        <MapPin size={16} className="text-emerald-400" />
                                        {dest.district_name || dest.districtName} {t("destinations.districtSuffix")}
                                    </div>
                                    <p className="line-clamp-2 text-sm leading-relaxed text-slate-300">
                                        {dest.description}
                                    </p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
