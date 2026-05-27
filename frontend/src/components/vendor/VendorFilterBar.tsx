"use client";

import { Filter, ChevronDown } from "lucide-react";

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
        <div className="flex flex-wrap items-center gap-3 animate-in fade-in duration-700">
            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
                <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:bg-white/8 hover:text-white">
                    <Filter size={14} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Global Filters</span>
                </button>

                <div className="mx-1 h-4 w-px shrink-0 bg-white/10" />

                <div className="relative group/select">
                    <select
                        value={listingType}
                        onChange={(e) => onTypeChange(e.target.value)}
                        className="eon-select appearance-none rounded-full px-5 py-2.5 pr-10 text-[13px] font-semibold tracking-[0.08em] text-slate-200 cursor-pointer"
                    >
                        <option value="all">Type of Place</option>
                        <option value="Hotel">Hotel</option>
                        <option value="Homestay">Homestay</option>
                        <option value="Guide">Guide</option>
                        <option value="Trekking Agency">Expedition</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                </div>

                <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:bg-white/8 hover:text-white">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Price Range</span>
                    <ChevronDown size={14} />
                </button>

                <button className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:bg-white/8 hover:text-white">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">Guest Rating</span>
                    <ChevronDown size={14} />
                </button>
            </div>
        </div>
    );
}
