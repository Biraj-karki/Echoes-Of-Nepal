"use client";

import { Check, ArrowRight, BookOpen, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BookingSuccessPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <div className="max-w-[500px] w-full text-center space-y-10 animate-in fade-in zoom-in duration-1000">
                
                {/* Visual Celebration */}
                <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping duration-1000"></div>
                    <div className="relative w-full h-full bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                        <Check size={64} className="text-white" strokeWidth={3} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">Journey Locked</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] leading-relaxed max-w-[300px] mx-auto">
                        Your payment was verified. The local echo is now synchronized with your scheduled exploration.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-10">
                    <Link 
                        href="/my-bookings"
                        className="w-full py-5 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-blue-600/30 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 group"
                    >
                        <span>Manage Your Bookings</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex gap-4">
                        <Link 
                            href="/dashboard"
                            className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <BookOpen size={14} />
                            <span>Feed</span>
                        </Link>
                        <button 
                            className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Share2 size={14} />
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em] pt-20">
                    A confirmation echo has been sent to your registered email address.
                </p>
            </div>
        </main>
    );
}
