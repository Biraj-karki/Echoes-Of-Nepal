"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Briefcase, 
    CalendarCheck, 
    User, 
    ChevronLeft,
    LogOut
} from "lucide-react";
import { useAuth } from "@/app/AuthProvider";

export default function VendorSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();
    
    const navItems = [
        { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
        { label: "Listings", href: "/vendor/listings", icon: Briefcase },
        { label: "Bookings", href: "/vendor/bookings", icon: CalendarCheck },
        { label: "Profile", href: "/vendor/profile", icon: User },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-[60] transition-all">
            <div className="p-6 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg bg-blue-600 flex items-center justify-center">
                        <img 
                            src="/logo.png" 
                            alt="Echoes of Nepal Logo" 
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <span className="block font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors text-sm">
                            Vendor Portal
                        </span>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            Echoes of Nepal
                        </span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1.5 mt-4">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative ${
                                active
                                    ? "bg-blue-600/10 text-blue-400 shadow-sm"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {active && (
                                <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
                            )}
                            <item.icon size={18} className={active ? "text-blue-400" : "group-hover:text-blue-400 transition-colors"} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
                <Link 
                    href="/" 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                    <ChevronLeft size={16} /> Back to Site
                </Link>
                <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all"
                >
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
}
