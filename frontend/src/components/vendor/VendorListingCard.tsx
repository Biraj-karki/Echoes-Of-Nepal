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
            className={`flex flex-col gap-4 cursor-pointer group transition-all duration-500 rounded-[2rem] p-4 
                ${isHighlighted ? 'bg-white/10 ring-1 ring-white/20 shadow-2xl shadow-blue-500/10' : 'hover:bg-white/[0.04]'}`}
        >
            {/* Image Container */}
            <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-800 border border-white/5">
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
                <button className="absolute top-4 right-4 p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-red-400 hover:bg-black/60 transition-all active:scale-90 z-10">
                    <Heart size={18} />
                </button>

                {/* Listing Type Tag */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">
                        {listing.listing_type}
                    </span>
                </div>
            </div>

            {/* Info Container */}
            <div className="px-1 py-1 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-black text-white leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors uppercase tracking-tight italic">
                        {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <Star size={14} className="text-blue-400 fill-current" />
                        <span className="text-[12px] font-black text-white">
                            {rating ? Number(rating).toFixed(1) : "NEW"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={12} className="text-blue-500/60" />
                    <span className="text-[11px] font-black uppercase tracking-widest line-clamp-1">
                        {listing.district_slug || "Across Nepal"}
                    </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-white">{listing.price || "Contact"}</span>
                    {listing.price && (
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] italic">
                            / Journey
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
