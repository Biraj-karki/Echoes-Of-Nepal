"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/AuthProvider";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { AlertTriangle, Clock, ShieldAlert, BookOpen, ExternalLink, HelpCircle, LayoutDashboard, Briefcase, CalendarCheck, User, ChevronLeft, LogOut, X } from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";

const VendorContext = createContext<{ vendor: any; loading: boolean }>({ vendor: null, loading: true });

export const useVendor = () => useContext(VendorContext);

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

    useEffect(() => {
        setMobileNavOpen(false);
    }, [pathname]);

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
    const mobileNavItems = [
        { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
        { label: "Listings", href: "/vendor/listings", icon: Briefcase },
        { label: "Bookings", href: "/vendor/bookings", icon: CalendarCheck },
        { label: "Profile", href: "/vendor/profile", icon: User },
    ];

    if (isPending || isRejected) {
        return (
            <div className="flex min-h-screen bg-[#020617] overflow-hidden">
                <VendorSidebar />
                <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                    <VendorHeader vendor={vendor} onMenuClick={() => setMobileNavOpen(true)} />
                    <main className="flex-1 px-4 py-6 sm:p-8 md:p-12 flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent">
                        <div className="max-w-xl w-full text-center space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className={`mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-3xl grid place-items-center mb-4 sm:mb-6 shadow-2xl ${isPending ? 'bg-amber-500/10 text-amber-500 shadow-amber-500/10' : 'bg-red-500/10 text-red-500 shadow-red-500/10'}`}>
                                {isPending ? <Clock size={40} className="sm:w-12 sm:h-12 animate-pulse" /> : <ShieldAlert size={40} className="sm:w-12 sm:h-12" />}
                            </div>
                            
                            <div className="space-y-4">
                                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                    {isPending ? "Application Under Review" : "Application Rejected"}
                                </h1>
                                <p className="text-slate-400 text-sm sm:text-lg leading-relaxed">
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-6">
                                <a href="mailto:support@echoesofnepal.com" className="flex items-center justify-center gap-3 px-5 sm:px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white hover:bg-white/10 transition-all">
                                    <HelpCircle size={18} className="text-slate-500" /> Contact Support
                                </a>
                                <button onClick={() => router.push("/")} className="flex items-center justify-center gap-3 px-5 sm:px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-blue-600/20">
                                    <ExternalLink size={18} /> Back to Site
                                </button>
                            </div>

                            <div className="pt-8 sm:pt-12 border-t border-white/5 flex flex-wrap justify-center gap-4 sm:gap-8">
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
            <div className="flex min-h-screen bg-[#020617] overflow-hidden">
                <VendorSidebar />
                <div className="flex-1 flex flex-col min-w-0 md:ml-64">
                    <VendorHeader vendor={vendor} onMenuClick={() => setMobileNavOpen(true)} />
                    <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 bg-[#020617]">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            {mobileNavOpen && (
                <div className="fixed inset-0 z-[80] md:hidden">
                    <button
                        aria-label="Close vendor menu"
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileNavOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm border-r border-white/10 bg-[#020617] shadow-2xl shadow-black/40 flex flex-col">
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                            <div>
                                <p className="text-sm font-black text-white">Vendor Portal</p>
                                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Echoes of Nepal</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
                                aria-label="Close vendor menu"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-2 p-4">
                            {mobileNavItems.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileNavOpen(false)}
                                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
                                            active
                                                ? "border-blue-500/20 bg-blue-500/10 text-white"
                                                : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/8"
                                        }`}
                                    >
                                        <item.icon size={18} className={active ? "text-blue-400" : "text-slate-400"} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="border-t border-white/10 p-4 space-y-2">
                            <Link
                                href="/"
                                onClick={() => setMobileNavOpen(false)}
                                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200"
                            >
                                <ChevronLeft size={16} /> Back to Site
                            </Link>
                            <button
                                onClick={() => {
                                    setMobileNavOpen(false);
                                    router.push("/vendor/login");
                                }}
                                className="flex w-full items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </VendorContext.Provider>
    );
}
