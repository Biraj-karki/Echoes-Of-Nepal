"use client";

import { Filter, ChevronDown, Search } from "lucide-react";

interface VendorFilterBarProps {
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
    minRating: number;
    onRatingChange: (rating: number) => void;
    listingType: string;
    onTypeChange: (type: string) => void;
}

export default function VendorFilterBar({
    // priceRange,
    // onPriceChange,
    // minRating,
    // onRatingChange,
    listingType,
    onTypeChange
}: VendorFilterBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-4 py-2 animate-in fade-in duration-700">
            {/* Minimalist Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all group group relative">
                    <Filter size={14} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Filters</span>
                </button>
                
                <div className="h-4 w-[1px] bg-white/10 mx-1 shrink-0" />

                <div className="relative group/select">
                    <select 
                        value={listingType}
                        onChange={(e) => onTypeChange(e.target.value)}
                        className="appearance-none px-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-full text-slate-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none focus:border-blue-500/40 pr-10"
                    >
                        <option value="all">Type of Place</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Homestay">Homestay</option>
                        <option value="Guide">Guide</option>
                        <option value="Trekking Agency">Expedition</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                </div>

                <button className="px-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-full text-slate-300 hover:text-white transition-all flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest">Price Range</span>
                    <ChevronDown size={14} />
                </button>

                <button className="px-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-full text-slate-300 hover:text-white transition-all flex items-center gap-2 whitespace-nowrap">
                    <span className="text-[10px] font-black uppercase tracking-widest">Guest Rating</span>
                    <ChevronDown size={14} />
                </button>
            </div>
        </div>
    );
}
