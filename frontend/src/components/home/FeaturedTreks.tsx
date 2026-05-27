"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MountainSnow, Calendar, Compass, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/LanguageProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Trek = {
    id: number;
    featured?: boolean;
    created_at: string;
    image: string;
    name: string;
    difficulty: string;
    altitude?: string;
    duration?: string;
    district_name?: string;
    description?: string;
};

export default function FeaturedTreks() {
    const { t } = useLanguage();
    const [treks, setTreks] = useState<Trek[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/tourism/treks`);
            const data = await res.json();
            
            if (res.ok) {
                const list: Trek[] = data.treks || [];
                const sorted = list.sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }).slice(0, 3);
                
                setTreks(sorted);
            } else {
                setError(t("treks.error"));
            }
        } catch {
            setError(t("treks.connectionError"));
        } finally {
            setLoading(false);
        }
    };

    if (error) return null;

    const getDifficultyColor = (diff: string) => {
        const d = (diff || "").toLowerCase();
        if (d.includes("easy")) return "border-emerald-500/20 bg-emerald-500/5 text-emerald-400";
        if (d.includes("moderate")) return "border-amber-500/20 bg-amber-500/5 text-amber-400";
        return "border-rose-500/20 bg-rose-500/5 text-rose-400";
    };

    return (
        <section className="eon-section relative border-y border-white/5 bg-slate-950/40">
            <div className="mx-auto max-w-7xl px-6">
                <div className="mb-14 flex flex-col gap-4 text-center">
                    <div className="eon-pill mx-auto">{t("treks.badge")}</div>
                    <h2 className="eon-page-title">{t("treks.title")}</h2>
                    <p className="eon-page-subtitle mx-auto mt-1 max-w-2xl">
                        {t("treks.subtitle")}
                    </p>
                    <div>
                        <Link
                            href="/treks"
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-200 transition-all hover:border-white/20 hover:bg-white/10"
                        >
                            View all treks
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="eon-surface h-[420px] animate-pulse" />
                        ))
                    ) : (
                        treks.map((trek, i) => (
                            <Link 
                                href={`/trek/${trek.id}`} 
                                key={trek.id || i} 
                                className="group eon-surface flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="relative h-60 shrink-0 overflow-hidden bg-slate-800">
                                    <img 
                                        src={trek.image} 
                                        alt={trek.name} 
                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-85" />
                                    
                                    <div className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getDifficultyColor(trek.difficulty)}`}>
                                        {trek.difficulty}
                                    </div>
                                    
                                    {trek.altitude && (
                                        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-bold text-sky-400 backdrop-blur-md">
                                            <MountainSnow size={12} />
                                            <span>{trek.altitude}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    <h3 className="mb-2 text-xl font-black text-white transition-colors group-hover:text-blue-300">
                                        {trek.name}
                                    </h3>
                                    
                                    <div className="mb-4 flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-blue-400" />
                                            {trek.duration}
                                        </span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                                        <span className="flex items-center gap-1.5">
                                            <Compass size={14} className="text-emerald-400" />
                                            {trek.district_name || t("treks.defaultDistrict")}
                                        </span>
                                    </div>
                                    
                                    <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-300">
                                        {trek.description}
                                    </p>
                                    
                                    <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4 text-xs font-black uppercase tracking-wider text-blue-400 transition-colors group-hover:text-blue-300">
                                        <span>{t("treks.viewDetails")}</span>
                                        <span className="translate-x-0 transition-transform group-hover:translate-x-1">&rarr;</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
