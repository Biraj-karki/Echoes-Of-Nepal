"use client";

import { MapPin, Star, Heart } from "lucide-react";

export type VendorListing = {
    id: number;
    vendor_id: number;
    title: string;
    listing_type: string;
    district_slug: string;
    description: string;
    price: string;
    image_url?: string;
    rating?: number;
    review_count?: number;
    amenities?: string[];
    is_active: boolean;
};

interface VendorListingCardProps {
    listing: VendorListing;
    onClick?: (listing: VendorListing) => void;
    onHover?: (listing: VendorListing | null) => void;
    isHighlighted?: boolean;
}

export default function VendorListingCard({ 
    listing, 
    onClick, 
    onHover,
    isHighlighted 
}: VendorListingCardProps) {
    const rating = listing.rating;

    return (
        <div 
            onClick={() => onClick?.(listing)}
            onMouseEnter={() => onHover?.(listing)}
            onMouseLeave={() => onHover?.(null)}
            className={`group cursor-pointer rounded-[2rem] p-4 transition-all duration-500 hover:-translate-y-1
                ${isHighlighted ? 'bg-white/10 ring-1 ring-white/20 shadow-2xl shadow-blue-500/10' : 'bg-white/[0.03] hover:bg-white/[0.05]'}`}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/5 bg-slate-800">
                {listing.image_url ? (
                    <img 
                        src={listing.image_url} 
                        alt={listing.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900 italic font-black text-xs">
                        No Preview Available
                    </div>
                )}
                
                {/* Heart/Save Button Overlay */}
                <button className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-md transition-all active:scale-90 hover:bg-black/60 hover:text-red-400">
                    <Heart size={18} />
                </button>

                {/* Listing Type Tag */}
                <div className="absolute left-4 top-4 rounded-xl border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md">
                    <span className="text-[9px] font-black leading-none tracking-[0.18em] text-white uppercase">
                        {listing.listing_type}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2 px-1 py-2">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-tight text-white transition-colors group-hover:text-blue-300">
                        {listing.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-1 pt-0.5">
                        <Star size={14} className="text-blue-400 fill-current" />
                        <span className="text-[12px] font-black text-white">
                            {rating ? Number(rating).toFixed(1) : "NEW"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={12} className="text-blue-500/60" />
                    <span className="line-clamp-1 text-[11px] font-black uppercase tracking-[0.18em]">
                        {listing.district_slug || "Across Nepal"}
                    </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-white">{listing.price || "Contact"}</span>
                    {listing.price && (
                        <span className="text-[10px] font-bold italic uppercase tracking-[0.2em] text-slate-500">
                            / Journey
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
