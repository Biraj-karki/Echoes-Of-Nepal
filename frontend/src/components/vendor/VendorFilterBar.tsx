"use client";

import { ChevronDown } from "lucide-react";

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
        </div>
    );
}
