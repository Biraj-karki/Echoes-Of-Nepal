"use client";

import { useAuth } from "@/app/AuthProvider";
import { Search, MapPin, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

interface VendorHeaderProps {
    vendor: any;
}

export default function VendorHeader({ vendor }: VendorHeaderProps) {
    const { user } = useAuth();
    
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10">
                        <CheckCircle size={12} /> Approved
                    </div>
                );
            case "rejected":
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/10">
                        <XCircle size={12} /> Rejected
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/10">
                        <AlertCircle size={12} /> Pending Review
                    </div>
                );
        }
    };

    return (
        <header className="h-20 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-[50]">
            <div className="flex items-center gap-6">
                <div>
                    <h2 className="text-lg font-black text-white tracking-tight leading-none">{vendor?.business_name || "Business Name"}</h2>
                    <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> {vendor?.district_slug || "Location"}
                        </p>
                        {getStatusBadge(vendor?.verification_status)}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl">
                    <Search size={14} className="text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search dashboard..." 
                        className="bg-transparent border-none focus:outline-none text-xs text-slate-300 w-32 placeholder:text-slate-600 font-medium"
                    />
                </div>

                <div className="w-[1px] h-8 bg-white/10 mx-2 hidden md:block"></div>

                <div className="rounded-xl bg-white/5 border border-white/10 px-0.5">
                    <NotificationBell />
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-white uppercase tracking-widest leading-none">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-tighter italic">Vendor Owner</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-600 border border-blue-400/20 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/10">
                        {user?.name?.[0].toUpperCase() || "V"}
                    </div>
                </div>
            </div>
        </header>
    );
}
