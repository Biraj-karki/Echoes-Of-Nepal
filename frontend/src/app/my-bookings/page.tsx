"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { 
    ShoppingBag, 
    MapPin, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Users, 
    ArrowRight,
    RefreshCcw
} from "lucide-react";
import Link from "next/link";

export default function MyBookingsPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    
    const API_BASE = useMemo(
        () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
        []
    );

    const [bookings, setBookings] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);

    const getToken = () => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem("token") || "";
    };

    const fetchBookings = async () => {
        setFetching(true);
        try {
            const token = getToken();
            const res = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (!loading && !user) router.replace("/login");
        if (!loading && user) fetchBookings();
    }, [loading, user]);

    if (loading || !user) {
        return <div className="min-h-screen grid place-items-center text-slate-400">Loading your reservations...</div>;
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100 pb-20">
            <main className="max-w-3xl mx-auto px-5 pt-8">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white tracking-tight italic">
                            My <span className="text-blue-500">Reservations</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Manage your upcoming journeys and booking history.</p>
                    </div>

                    <button
                        onClick={fetchBookings}
                        disabled={fetching}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 group active:scale-95"
                    >
                        <RefreshCcw size={14} className={fetching ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500 text-blue-400"} />
                        {fetching ? "Syncing..." : "Refresh"}
                    </button>
                </div>

                {/* LISTING CONTENT */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {fetching && bookings.length === 0 ? (
                        <div className="py-20 text-center text-slate-500 animate-pulse font-black uppercase tracking-widest text-[10px]">Retrieving reservations...</div>
                    ) : bookings.length === 0 ? (
                        <div className="py-24 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem] p-12">
                            <ShoppingBag size={48} className="mx-auto text-slate-700 mb-6" />
                            <p className="text-2xl font-black text-slate-500 italic">Empty suitcase?</p>
                            <p className="text-slate-600 mt-2 text-sm">Head over to the <Link href="/explore" className="text-blue-500 font-bold hover:underline">Explore</Link> page to book local services.</p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <div key={booking.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/20 transition-all flex flex-col md:flex-row shadow-2xl shadow-black/50">
                                {/* Image / Icon */}
                                <div className="w-full md:w-48 h-48 bg-slate-900 shrink-0 relative overflow-hidden">
                                    {booking.listing_image ? (
                                        <img src={booking.listing_image} alt={booking.listing_title} className="w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <div className="w-full h-full grid place-items-center text-slate-700"><ShoppingBag size={40} /></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md border ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                booking.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    booking.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            }`}>
                                            {booking.status === 'confirmed' ? <CheckCircle2 size={12} /> :
                                                booking.status === 'rejected' ? <XCircle size={12} /> :
                                                    booking.status === 'completed' ? <CheckCircle2 size={12} /> :
                                                        <Clock size={12} />}
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Info Content */}
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 uppercase tracking-widest text-emerald-400">{booking.business_name}</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                                                <MapPin size={10} className="text-blue-500" /> Nepal
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white italic tracking-tight">{booking.listing_title}</h3>

                                        <div className="flex flex-wrap items-center gap-6 pt-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                <Calendar size={14} className="text-blue-500" /> {new Date(booking.travel_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                <Users size={14} className="text-blue-500" /> {booking.people_count} People
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="text-sm font-bold text-white">RESERVATION #{booking.id}</div>
                                        <Link href={`/explore`} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 group">
                                            View on Map <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
