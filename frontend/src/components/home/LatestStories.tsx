"use client";

import { useEffect, useState } from "react";
import { BookOpen, MapPin, User, Calendar } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type Story = {
    id: number;
    title: string;
    description: string;
    location_tag?: string;
    createdAt?: string;
    created_at?: string;
    user_name?: string;
    media?: any[];
    user?: {
        name: string;
    }
};

export default function LatestStories() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/stories`, { cache: "no-store" });
                const data = await res.json();
                if (res.ok && Array.isArray(data.stories)) {
                    // Get only top 3 recent
                    setStories(data.stories.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch recent stories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    // Helper to get first image
    const getCoverImageUrl = (story: Story) => {
        if (!story.media || story.media.length === 0) return null;
        const img = story.media.find(m => {
            const type = (m.media_type || "").toLowerCase();
            return !type.includes("video") && !/\.(mp4|mov|webm)$/i.test(m.media_url || "");
        });
        if (!img?.media_url) return null;
        
        const url = img.media_url;
        if (url.startsWith("http")) return url;
        return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
    };

    if (loading || stories.length === 0) {
        return null; // Don't show section if empty or loading to keep it clean
    }

    return (
        <section className="py-24 bg-slate-950 border-t border-white/5 relative">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-emerald-400 font-semibold tracking-wider text-sm uppercase mb-2 block">Community</span>
                    <h2 className="text-3xl md:text-5xl font-black text-white">Latest Travel Stories</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stories.map((story) => {
                        const coverUrl = getCoverImageUrl(story);
                        const authorName = story.user?.name || story.user_name || "Unknown Traveler";
                        const date = story.createdAt || story.created_at || new Date().toISOString();
                        
                        return (
                            <div key={story.id} className="group bg-slate-900/60 rounded-3xl border border-white/5 overflow-hidden hover:border-white/20 transition-all duration-300 shadow-xl flex flex-col h-full">
                                {coverUrl && (
                                    <div className="relative h-48 overflow-hidden bg-slate-800 shrink-0">
                                        <img 
                                            src={coverUrl} 
                                            alt={story.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                                        &quot;{story.title}&quot;
                                    </h3>
                                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                                        {story.description}
                                    </p>
                                    
                                    <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2 text-xs text-slate-500 font-medium">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1.5 text-slate-300">
                                                <User size={14} className="text-blue-400" /> 
                                                By {authorName}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {new Date(date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {story.location_tag && (
                                            <div className="flex items-center gap-1.5 text-emerald-400/80 mt-1">
                                                <MapPin size={14} />
                                                {story.location_tag}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
