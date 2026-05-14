"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import VendorListingCard, { VendorListing } from "@/components/vendor/VendorListingCard";
import VendorFilterBar from "@/components/vendor/VendorFilterBar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function ExploreStaysPage() {
    const router = useRouter();
    const [listings, setListings] = useState<VendorListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [type, setType] = useState("all");

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/vendors/all`);
                if (res.ok) {
                    const data = await res.json();
                    setListings(data.listings || []);
                }
            } catch (err) {
                console.error("Failed to fetch listings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, []);

    const filteredListings = useMemo(() => {
        return listings.filter(l => {
            const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 l.district_slug?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = type === "all" || l.listing_type === type;
            return matchesSearch && matchesType;
        });
    }, [listings, searchTerm, type]);

    const handleCardClick = (listing: VendorListing) => {
        router.push(`/explore/vendors/${listing.id}`);
    };

    return (
        <main className="min-h-screen bg-[#020617] pb-20">
            {/* Minimalist Header - Sticky below Global Navbar */}
            <div className="sticky top-16 z-40 bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 py-4">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Unified Search Input */}
                    <div className="relative w-full md:w-[450px] group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600/10 text-blue-500 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all">
                            <Search size={16} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search districts, hotels or guides..." 
                            className="w-full bg-white/[0.03] border border-white/10 rounded-full py-4 pl-16 pr-6 text-sm font-black uppercase tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-all italic shadow-2xl shadow-black/40"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <VendorFilterBar 
                        listingType={type}
                        onTypeChange={setType}
                        priceRange={[0, 10000]}
                        onPriceChange={() => {}}
                        minRating={0}
                        onRatingChange={() => {}}
                    />
                </div>
            </div>

            {/* Content Area - Full Width Grid */}
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 mt-12">
                {loading ? (
                    <div className="py-60 flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Filtering Local Echoes...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Explore Nepal</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{filteredListings.length} Curated Experiences Available</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredListings.map(listing => (
                                <VendorListingCard 
                                    key={listing.id} 
                                    listing={listing} 
                                    onClick={handleCardClick}
                                />
                            ))}
                        </div>

                        {filteredListings.length === 0 && (
                            <div className="py-40 text-center bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">No matches found</h3>
                                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Adjust your filters or destination to sync more stays</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
