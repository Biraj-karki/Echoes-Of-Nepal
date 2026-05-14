"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Star, AlertCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function FeaturedDestinations() {
    const [destinations, setDestinations] = useState<any[]>([]);
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
                // Priority to featured, then most recent, limit to 6
                const list = data.destinations || [];
                const sorted = list.sort((a: any, b: any) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }).slice(0, 6);
                
                setDestinations(sorted);
            } else {
                setError("Failed to load featured places.");
            }
        } catch (e) {
            setError("Connection error.");
        } finally {
            setLoading(false);
        }
    };

    if (error) return null; // Gracefully hide if error

    return (
        <section className="py-24 bg-[#060a16] relative">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-blue-400 font-semibold tracking-wider text-sm uppercase mb-2 block">Highlights</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white">Popular Destinations</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-[400px] bg-white/5 rounded-3xl border border-white/5 animate-pulse" />
                        ))
                    ) : (
                        destinations.map((dest, i) => (
                            <div key={dest.id || i} className="group bg-slate-900/40 rounded-3xl border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-2xl shadow-black/50">
                                {/* Image Header */}
                                <div className="relative h-56 overflow-hidden bg-slate-800">
                                    <img 
                                        src={dest.image} 
                                        alt={dest.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"; // Fallback to a nice Nepal image
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                                    
                                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                                        {dest.category}
                                    </div>
                                    {dest.rating && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-full text-xs font-bold text-yellow-400 border border-white/10">
                                            <Star size={12} className="fill-current" />
                                            <span>{dest.rating}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                        {dest.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 font-medium mb-4">
                                        <MapPin size={16} className="text-emerald-400" />
                                        {dest.district_name || dest.districtName} District
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">
                                        {dest.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

