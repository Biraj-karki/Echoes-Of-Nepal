"use client";

import Link from "next/link";
import { Briefcase, ArrowRight, ShieldCheck, MapPin, TrendingUp } from "lucide-react";

export default function VendorCTASection() {
    return (
        <section className="relative py-24 sm:py-32 overflow-hidden border-b border-white/5">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[#020617] -z-20"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            <div className="mx-auto max-w-7xl px-5 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Left Copy */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-widest">
                            <Briefcase size={14} /> For Businesses
                        </div>
                        
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                            List Your Business on <br />
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Echoes of Nepal</span>
                        </h2>
                        
                        <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                            Own a hotel, homestay, guide service, trekking agency, transport service, or local tourism business? Join Echoes of Nepal as a verified vendor and connect with travelers exploring the Himalayas across 77 districts.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link href="/vendor/apply" className="px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group">
                                Apply Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/vendor/login" className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center">
                                Vendor Login
                            </Link>
                        </div>
                    </div>

                    {/* Right Features/Visuals */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-orange-500/5 rounded-3xl transform rotate-3 scale-105 border border-amber-500/20 -z-10"></div>
                        
                        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-8 relative">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Verified Partner Status</h4>
                                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">Gain trust instantly. Our admin verification ensures that travelers know your business is legitimate and highly rated.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">District & Trek Targeting</h4>
                                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">Pinpoint your services directly to the districts, destinations, and trekking routes that travelers are actively searching for.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Direct Booking Requests</h4>
                                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">Manage your capacity. Receive inquiries directly to your Vendor Dashboard and confirm bookings on your own terms.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
