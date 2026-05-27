"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, SlidersHorizontal } from "lucide-react";
import VendorListingCard, { VendorListing } from "@/components/vendor/VendorListingCard";
import VendorFilterBar from "@/components/vendor/VendorFilterBar";
import { API_BASE } from "@/lib/api";

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
        <main className="min-h-screen bg-[#020617] pb-24">
            <div className="sticky top-[5rem] z-40 border-b border-white/8 bg-[#020617]/92 backdrop-blur-2xl">
                <div className="mx-auto max-w-[1440px] px-4 py-4 lg:px-8">
                    <div className="eon-surface-strong flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
                        <div className="relative w-full lg:max-w-[520px] group">
                            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 p-2 text-blue-400 transition-all group-focus-within:bg-blue-500/20 group-focus-within:text-white">
                                <Search size={16} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search districts, stays or guides"
                                className="eon-input h-14 rounded-full pl-14 pr-5 text-sm font-medium tracking-wide placeholder:text-slate-500"
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
            </div>

            <div className="mx-auto max-w-[1440px] px-4 lg:px-8 mt-10">
                {loading ? (
                    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-500/10 border-t-blue-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                            Loading stays
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-10 flex flex-col gap-3">
                            <div className="eon-pill w-fit">Stays</div>
                            <div className="space-y-2">
                                <h1 className="eon-page-title">Explore Nepal</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                    {filteredListings.length} curated experiences available
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredListings.map(listing => (
                                <VendorListingCard 
                                    key={listing.id} 
                                    listing={listing} 
                                    onClick={handleCardClick}
                                />
                            ))}
                        </div>

                        {filteredListings.length === 0 && (
                            <div className="eon-surface py-28 text-center">
                                <h3 className="mb-2 text-2xl font-black uppercase tracking-tighter text-white">
                                    No matches found
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                                    Adjust your filters or search another district
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
