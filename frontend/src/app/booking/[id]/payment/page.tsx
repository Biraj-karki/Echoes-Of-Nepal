"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ArrowLeft, CreditCard } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function BookingPaymentPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id;

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        const fetchBooking = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setBooking(data.booking);
                } else {
                    setError("Failed to fetch booking details.");
                }
            } catch (err) {
                setError("Connection error.");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    const handleKhaltiPayment = async () => {
        if (!booking) return;

        setVerifying(true);
        setError("");
        
        try {
            const authToken = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/bookings/${id}/initiate-khalti`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`
                }
            });

            const data = await res.json();
            
            if (res.ok && data.success && data.payment_url) {
                // Redirect user to Khalti Official Payment Page
                window.location.href = data.payment_url;
            } else {
                setError(data.error || "Failed to initiate payment gateway.");
                setVerifying(false);
            }
        } catch (err) {
            setError("Network error bridging to payment gateway.");
            setVerifying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
    );

    if (error || !booking) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
            <p className="text-red-400 font-bold mb-4 uppercase tracking-widest text-xs">{error || "Unauthorized"}</p>
            <button onClick={() => router.push("/explore/vendors")} className="text-blue-400 underline underline-offset-4 text-xs font-black uppercase">Return to explore</button>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#020617] pt-32 pb-20">
            <div className="max-w-[1000px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* Left: Summary */}
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to details</span>
                    </button>
                    
                    <div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Secure Your Echo</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Complete your transaction to finalize your journey</p>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                <img src={booking.listing_image} alt={booking.listing_title} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1 py-1">
                                <p className="text-xs text-blue-400 font-black uppercase tracking-widest">{booking.business_name}</p>
                                <h3 className="text-white font-black italic">{booking.listing_title}</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{booking.vendor_district}</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest italic">
                                <span className="text-slate-500">Scheduled Date</span>
                                <span className="text-white">{new Date(booking.travel_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest italic">
                                <span className="text-slate-500">Group Size</span>
                                <span className="text-white">{booking.people_count} Adventures</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-sm font-black text-white uppercase tracking-widest italic">
                                <span>Total Contribution</span>
                                <span className="text-xl">NPR {booking.amount.toLocaleString()}</span>
                            </div>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">Tax and local fees are bundled into your echo contribution.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Payment Logic */}
                <div className="lg:mt-24 space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000">
                    <div className="p-8 rounded-[3rem] bg-blue-600 border border-blue-500 shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                        
                        <div className="relative z-10 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="p-3 rounded-2xl bg-white/20 text-white">
                                    <CreditCard size={24} />
                                </div>
                                <ShieldCheck size={28} className="text-white/40" />
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Instant Gateway Sync</p>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Pay securely via local echo</h2>
                            </div>

                            <div className="space-y-4 pt-4">
                                <button 
                                    onClick={handleKhaltiPayment}
                                    disabled={verifying}
                                    className="w-full py-5 bg-white text-blue-600 font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group/btn"
                                >
                                    {verifying ? <Loader2 className="animate-spin" size={20} /> : (
                                        <>
                                            <img src="https://khalti.com/static/img/logo1.png" alt="Khalti" className="h-6" />
                                            <span>Pay with Khalti</span>
                                        </>
                                    )}
                                </button>

                                <button 
                                    disabled
                                    className="w-full py-5 bg-white/10 border border-white/20 text-white font-black uppercase tracking-[0.2em] rounded-2xl opacity-40 cursor-not-allowed italic text-[10px]"
                                >
                                    eSewa Gateway (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Buyer Protection Echo</p>
                            <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider">Your transaction is encrypted and secured. Funds are only settled after check-in confirmation to ensure your safety.</p>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
