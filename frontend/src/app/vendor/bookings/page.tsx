"use client";

import { useState, useEffect } from "react";
import { useVendor } from "../layout";
import Link from "next/link";
import {
    CalendarCheck,
    User,
    Mail,
    Phone,
    MessageSquare,
    Users,
    Check,
    X,
    Clock,
    CheckCircle2,
    XCircle,
    RotateCcw,
    AlertCircle,
    Calendar,
    ArrowRight,
    LayoutList,
    Tally3
} from "lucide-react";
import VendorCalendar from "@/components/vendor/VendorCalendar";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function VendorBookingsPage() {
    const { vendor, loading: vendorLoading } = useVendor();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

    useEffect(() => {
        if (!vendor) return;
        fetchBookings();
    }, [vendor]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/bookings/vendor`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        setUpdatingId(id);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // Optimistic UI or re-fetch
                fetchBookings();
            } else {
                alert("Failed to update booking status");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredBookings = bookings.filter(b => filterStatus === 'all' || b.status === filterStatus);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "confirmed": return <CheckCircle2 size={16} className="text-emerald-400" />;
            case "rejected": return <XCircle size={16} className="text-red-500" />;
            case "completed": return <CalendarCheck size={16} className="text-blue-400" />;
            default: return <Clock size={16} className="text-amber-500" />;
        }
    };

    if (vendorLoading || !vendor) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight leading-none">Booking Requests</h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-3">Manage your customer journey</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 p-1 bg-[#0f172a] border border-white/5 rounded-xl">
                        {["all", "pending", "confirmed", "completed", "rejected"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10"
                                        : "text-slate-500 hover:text-white"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 p-1 bg-[#0f172a] border border-white/5 rounded-xl ml-auto">
                        <button 
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="List View"
                        >
                            <LayoutList size={16} />
                        </button>
                        <button 
                            onClick={() => setViewMode("calendar")}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="Calendar View"
                        >
                            <Calendar size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-32 grid place-items-center">
                    <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : filteredBookings.length === 0 ? (
                <div className="text-center py-32 bg-[#0a0f1d] border border-white/5 rounded-[3rem]">
                    <div className="w-20 h-20 bg-emerald-500/5 text-emerald-500/30 rounded-3xl grid place-items-center mx-auto mb-6">
                        <CalendarCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white italic">Silence is golden?</h2>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">No booking requests matching your filter at the moment.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {viewMode === "list" ? (
                        filteredBookings.map((booking) => (
                            <div key={booking.id} className="group bg-[#0f172a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-blue-500/20 transition-all flex flex-col md:flex-row shadow-2xl shadow-black/50">
                                {/* Status Indicator Bar */}
                                <div className={`w-1.5 shrink-0 ${booking.status === 'confirmed' ? 'bg-emerald-500' :
                                        booking.status === 'rejected' ? 'bg-red-500' :
                                            booking.status === 'completed' ? 'bg-blue-600' : 'bg-amber-500'
                                    }`}></div>

                                <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-center md:text-left">
                                    {/* Listing Info */}
                                    <div className="lg:col-span-4 space-y-2">
                                        <h3 className="text-xl font-black text-white tracking-tight leading-none italic">{booking.listing_title}</h3>
                                        <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <Calendar size={12} className="text-blue-500" /> {new Date(booking.travel_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <Users size={12} className="text-blue-500" /> {booking.people_count} Guests
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center md:justify-start gap-2 pt-3">
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md
                                                ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    booking.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        booking.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                            'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                                            >
                                                {getStatusIcon(booking.status)} {booking.status}
                                            </span>
                                            
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md
                                                ${booking.payment_status === 'paid' ? 'bg-blue-600/10 text-blue-400 border-blue-600/20' : 'bg-slate-500/10 text-slate-500 border-white/5'}`}
                                            >
                                                {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-black text-white italic pt-2 flex justify-center md:justify-start">
                                            Revenue: NPR {parseFloat(booking.amount || 0).toLocaleString()}
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-white/[0.015] border border-white/5 rounded-[2rem] shadow-inner shadow-white/5">
                                        <div className="space-y-3">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-white/10 pb-1.5 flex items-center gap-2">
                                                <User size={12} /> Adventurer
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-white italic tracking-tight">{booking.contact_name}</p>
                                                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                    <Mail size={12} className="text-blue-500/50" /> {booking.contact_email}
                                                </div>
                                                <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                                    <Phone size={12} className="text-blue-500/50" /> {booking.contact_phone}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-white/10 pb-1.5 flex items-center gap-2">
                                                <MessageSquare size={12} /> Narrative
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-3">
                                                "{booking.message || "No special requirements provided."}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="lg:col-span-3 flex flex-row md:flex-col gap-3 justify-center">
                                        {booking.status === 'pending' ? (
                                            <>
                                                <button
                                                    disabled={updatingId === booking.id}
                                                    onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95 disabled:opacity-50"
                                                >
                                                    <Check size={16} /> Confirm
                                                </button>
                                                <button
                                                    disabled={updatingId === booking.id}
                                                    onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                                                    className="flex-1 md:flex-none flex items-center justify-center gap-3 py-3 px-6 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    <X size={16} /> Reject
                                                </button>
                                            </>
                                        ) : booking.status === 'confirmed' ? (
                                            <button
                                                disabled={updatingId === booking.id}
                                                onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-[1.25rem] transition-all shadow-xl shadow-blue-600/10 group overflow-hidden relative active:scale-95"
                                            >
                                                <span className="relative z-10">Mark Completed</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            </button>
                                        ) : (
                                            <button
                                                disabled={updatingId === booking.id}
                                                onClick={() => handleUpdateStatus(booking.id, 'pending')}
                                                className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/5"
                                            >
                                                <RotateCcw size={16} /> Reset Status
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <VendorCalendar bookings={filteredBookings} />
                    )}
                </div>
            )}

            {/* Quick Policy / Hint */}
            <div className="bg-blue-600/5 p-8 rounded-[3rem] border border-blue-500/10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl grid place-items-center shrink-0">
                    <AlertCircle size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="text-lg font-black text-white italic mb-2 tracking-tight">Professional Standards</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Responding to booking requests within 12 hours significantly increases your business ranking on the
                        <Link href="/explore" className="text-blue-400 font-bold hover:underline mx-1">Nepal Interactive Map</Link>.
                        Always confirm travel dates with guests via phone/email before hitting "Confirm".
                    </p>
                </div>
                <Link href="/vendor/profile" className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shrink-0">
                    Review Policies <ArrowRight size={14} className="inline ml-2" />
                </Link>
            </div>
        </div>
    );
}
