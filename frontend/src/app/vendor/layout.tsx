"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/AuthProvider";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { AlertTriangle, Clock, ShieldAlert, BookOpen, ExternalLink, HelpCircle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const VendorContext = createContext<{ vendor: any; loading: boolean }>({ vendor: null, loading: true });

export const useVendor = () => useContext(VendorContext);

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        
        // Skip auth check for login and apply pages (if they were nested, but they are siblings)
        // However, this layout wraps /vendor/* if not careful.
        // Actually, this layout will be in /vendor/layout.tsx, so it wraps everything.
        if (pathname === "/vendor/login" || pathname === "/vendor/apply") {
            setLoading(false);
            return;
        }

        if (!user) {
            router.push("/vendor/login");
            return;
        }

        fetchVendorProfile();
    }, [user, authLoading, pathname]);

    const fetchVendorProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/vendors/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                setVendor(data.vendor);
            } else if (res.status === 404) {
                // Not a vendor yet
                router.push("/vendor/apply");
            }
        } catch (e) {
            console.error("Failed to fetch vendor profile", e);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="mt-6 text-slate-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Loading Business Portal</p>
            </div>
        );
    }

    // Skip layout for login/apply
    if (pathname === "/vendor/login" || pathname === "/vendor/apply") {
        return <>{children}</>;
    }

    // Access Control Overlays
    const isPending = vendor?.verification_status === "pending";
    const isRejected = vendor?.verification_status === "rejected";

    if (isPending || isRejected) {
        return (
            <div className="flex h-screen bg-[#020617] overflow-hidden">
                <VendorSidebar />
                <div className="flex-1 flex flex-col min-w-0 ml-64">
                    <VendorHeader vendor={vendor} />
                    <main className="flex-1 p-12 flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent">
                        <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className={`mx-auto w-24 h-24 rounded-3xl grid place-items-center mb-6 shadow-2xl ${isPending ? 'bg-amber-500/10 text-amber-500 shadow-amber-500/10' : 'bg-red-500/10 text-red-500 shadow-red-500/10'}`}>
                                {isPending ? <Clock size={48} className="animate-pulse" /> : <ShieldAlert size={48} />}
                            </div>
                            
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black text-white tracking-tight">
                                    {isPending ? "Application Under Review" : "Application Rejected"}
                                </h1>
                                <p className="text-slate-400 text-lg leading-relaxed">
                                    {isPending 
                                        ? "Our team is currently verifying your business credentials. This usually takes 24-48 hours. You'll receive full access once approved."
                                        : "We've reviewed your application and unfortunately couldn't approve it at this time. Please see the reason below."
                                    }
                                </p>
                            </div>

                            {isRejected && (
                                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-[2rem] text-left">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-red-500 mb-3 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Rejection Reason
                                    </h2>
                                    <p className="text-red-400/80 text-sm font-medium leading-relaxed italic">
                                        "{vendor?.rejection_reason || "Document verification failed. Please ensure all details are clear and match your official records."}"
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <a href="mailto:support@echoesofnepal.com" className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white hover:bg-white/10 transition-all">
                                    <HelpCircle size={18} className="text-slate-500" /> Contact Support
                                </a>
                                <button onClick={() => router.push("/")} className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20">
                                    <ExternalLink size={18} /> Back to Site
                                </button>
                            </div>

                            <div className="pt-12 border-t border-white/5 flex justify-center gap-8">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <BookOpen size={14} /> Guidelines
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <ShieldAlert size={14} /> Compliance
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <VendorContext.Provider value={{ vendor, loading }}>
            <div className="flex h-screen bg-[#020617] overflow-hidden">
                <VendorSidebar />
                <div className="flex-1 flex flex-col min-w-0 ml-64">
                    <VendorHeader vendor={vendor} />
                    <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#020617]">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </VendorContext.Provider>
    );
}
