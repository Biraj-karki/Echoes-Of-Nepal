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

type District = {
    id: string | number;
    slug?: string;
    name: string;
    description?: string;
    destinations?: Record<string, unknown>[];
    treks?: Record<string, unknown>[];
    stories?: Record<string, unknown>[];
};

const normalizeDistrictKey = (value?: string | number | null) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s*\(.*?\)\s*/g, "")
        .replace(/[^a-z0-9]+/g, "");


export default function ExplorePage() {
    const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
    const [selectedDistrictName, setSelectedDistrictName] = useState<string | null>(null);
    const [realStories, setRealStories] = useState<Story[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
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
        setSelectedDistrictName(name);
    };

    const handleClosePanel = () => {
        setSelectedDistrictId(null);
        setSelectedDistrictName(null);
    };

    const selectedDistrictKey = normalizeDistrictKey(selectedDistrictId);

    // Filter real stories for the selected district
    const districtStories = selectedDistrictId 
        ? realStories
            .filter((story) => normalizeDistrictKey(story.location_tag) === selectedDistrictKey)
            .map(s => ({
                id: s.id,
                title: s.title,
                author: s.user?.name || s.user_name || "Unknown Adventurer",
                date: s.createdAt || s.created_at || new Date().toISOString(),
                excerpt: s.description || "No description provided."
            }))
        : [];

    const activeDistrictData = districts.find((district) => {
        const districtKeys = [
            normalizeDistrictKey(district.id),
            normalizeDistrictKey(district.slug),
            normalizeDistrictKey(district.name),
        ];
        return districtKeys.includes(selectedDistrictKey);
    });

    const activeDistrict = selectedDistrictId && activeDistrictData
        ? {
            ...activeDistrictData,
            stories: [...districtStories, ...(activeDistrictData.stories || [])]
        } 
        : selectedDistrictId ? {
            id: selectedDistrictId,
            name: selectedDistrictName || selectedDistrictId.replace(/^\w/, c => c.toUpperCase()),
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
              <div className="absolute inset-0 pointer-events-none z-10 flex justify-between p-8">
                  
                  {/* Floating Header */}
                  <div className="pointer-events-auto w-full md:w-auto h-fit">
                     <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl max-w-sm">
                        <div className="inline-flex px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black tracking-[0.2em] text-blue-400 uppercase mb-4">
                            Interactive Map
                        </div>
                        <h1 className="text-3xl font-black text-white leading-tight mb-4">
                            Explore <br />
                            <span className="italic">Echoes of Nepal</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Interact with the map to discover hidden destinations, read authenticated traveler stories, and plan your next Himalayan adventure.
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
