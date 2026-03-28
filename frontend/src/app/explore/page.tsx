"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import DistrictDetailPanel from "@/components/DistrictDetailPanel";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Import Map dynamically to avoid SSR issues
const NepalMap = dynamic(() => import("@/components/NepalMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full grid place-items-center bg-[#020617] text-slate-500">
            <p className="animate-pulse tracking-widest text-sm font-semibold uppercase">Loading Map...</p>
        </div>
    )
});

type Story = {
    id: number;
    title: string;
    description?: string;
    location_tag?: string;
    created_at?: string;
    createdAt?: string;
    user_name?: string;
    user?: { name?: string };
};


export default function ExplorePage() {
    const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
    const [realStories, setRealStories] = useState<Story[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                const [storiesRes, tourismRes] = await Promise.all([
                    fetch(`${API_BASE}/api/stories`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                        cache: "no-store",
                    }),
                    fetch(`${API_BASE}/api/tourism/districts`)
                ]);
                
                const storiesData = await storiesRes.json();
                const tourismData = await tourismRes.json();

                if (storiesRes.ok) setRealStories(storiesData.stories || []);
                if (tourismRes.ok) setDistricts(tourismData.districts || []);
            } catch (e) {
                console.error("Failed to load data", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectDistrict = (id: string, name: string) => {
        setSelectedDistrictId(id);
    };

    const handleClosePanel = () => {
        setSelectedDistrictId(null);
    };

    // Filter real stories for the selected district
    const districtStories = selectedDistrictId 
        ? realStories
            .filter(s => s.location_tag?.toLowerCase() === selectedDistrictId.toLowerCase())
            .map(s => ({
                id: s.id,
                title: s.title,
                author: s.user?.name || s.user_name || "Unknown Adventurer",
                date: s.createdAt || s.created_at || new Date().toISOString(),
                excerpt: s.description || "No description provided."
            }))
        : [];

    const activeDistrictData = districts.find((d) => d.id === selectedDistrictId);
    
    const activeDistrict = selectedDistrictId && activeDistrictData
        ? {
            ...activeDistrictData,
            stories: [...districtStories, ...(activeDistrictData.stories || [])]
        } 
        : selectedDistrictId ? {
            id: selectedDistrictId,
            name: selectedDistrictId.replace(/^\w/, c => c.toUpperCase()),
            description: `Explore the local culture, mountains, and pristine landscapes of the beautiful ${selectedDistrictId.toLowerCase()} region.`,
            destinations: [],
            treks: [],
            stories: districtStories
        } : null;


    return (
         <div className="relative w-full h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-hidden bg-[#020617]">
             
             {/* Map Layer */}
             <div className="absolute inset-0 z-0">
                 <NepalMap 
                     selectedDistrictId={selectedDistrictId} 
                     onSelectDistrict={handleSelectDistrict} 
                 />
             </div>

             {/* UI Overlay Container pointer-events-none so it doesn't block map */}
             <div className="absolute inset-0 pointer-events-none z-10 flex justify-between p-6">
                 
                 {/* Floating Header */}
                 <div className="pointer-events-auto w-full md:w-auto h-fit">
                    <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl max-w-sm">
                        <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent transform transition-all duration-300">
                            Discover Nepal
                        </h1>
                        <p className="mt-2 text-sm text-slate-300">
                            Hover over and click any district on the map to explore destinations, real user stories, and hiking trails.
                        </p>
                    </div>
                 </div>

             </div>
             
             {/* Side Panel Overlay */}
             <div className="absolute top-0 right-0 h-full pointer-events-auto z-50">
                 {activeDistrict && (
                     <DistrictDetailPanel 
                         district={activeDistrict} 
                         onClose={handleClosePanel} 
                     />
                 )}
             </div>
         </div>
    );
}
