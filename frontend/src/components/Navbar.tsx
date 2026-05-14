"use client";

import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, Settings, Bookmark, BookOpen, ShoppingBag } from "lucide-react";
import SOSButton from "./SOSButton";

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    
    // Hide navbar on admin routes
    if (pathname?.startsWith("/admin")) return null;

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
    };

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        await logout();
        router.push("/login"); // or home
    };

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between">
                {/* LOGO */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg">
                        <img 
                            src="/logo.png" 
                            alt="Echoes of Nepal Logo" 
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <span className="font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                        Echoes of Nepal
                    </span>
                </Link>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex items-center gap-1">
                    <NavLink href="/" label="Home" active={isActive("/")} />
                    <NavLink href="/explore" label="Explore" active={isActive("/explore")} />
                    <NavLink href="/explore/vendors" label="Stays" active={isActive("/explore/vendors")} />
                    <NavLink href="/dashboard" label="Feed" active={isActive("/dashboard")} />
                    <NavLink href="/assistant" label="AI Assistant ✨" active={isActive("/assistant")} />
                    
                    {user ? (
                        user.verification_status === "approved" ? (
                            <Link 
                                href="/vendor/dashboard" 
                                className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all shadow-lg ${pathname?.startsWith("/vendor") ? "bg-blue-600 text-white shadow-blue-600/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:scale-105"}`}
                            >
                                Dashboard
                            </Link>
                        ) : null
                    ) : (
                        <div className="relative group ml-1">
                            <button className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${pathname?.startsWith("/vendor") ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                                For Vendors
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-left transform scale-95 group-hover:scale-100 z-50">
                                <Link href="/vendor/apply" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">List Your Business</Link>
                                <Link href="/vendor/login" className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">Vendor Login</Link>
                            </div>
                        </div>
                    )}
                </nav>

                {/* AUTH ACTIONS */}
                <div className="hidden md:flex items-center gap-3">
                    {user && <SOSButton />}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
                                aria-label="Open profile menu"
                            >
                                <span className="hidden lg:block text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                                    {user.name}
                                </span>
                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg border border-white/10 overflow-hidden">
                                    {(user as any).profileImage ? (
                                        <img src={(user as any).profileImage} alt={user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        getInitials(user.name)
                                    )}
                                </div>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1 relative">
                                        <DropdownLink href="/profile" icon={<User size={16} />} label="Profile" onClick={() => setDropdownOpen(false)} />
                                        <DropdownLink href="/my-bookings" icon={<ShoppingBag size={16} />} label="My Bookings" onClick={() => setDropdownOpen(false)} />
                                        <DropdownLink href="/profile?tab=stories" icon={<BookOpen size={16} />} label="My Stories" onClick={() => setDropdownOpen(false)} />
                                        <DropdownLink href="/profile?tab=saved" icon={<Bookmark size={16} />} label="Saved" onClick={() => setDropdownOpen(false)} />
                                        <DropdownLink href="/profile?tab=settings" icon={<Settings size={16} />} label="Settings" onClick={() => setDropdownOpen(false)} />
                                    </div>
                                    <div className="py-1 border-t border-white/10">
                                        <button
                                            onClick={() => { setDropdownOpen(false); handleLogout(); }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                                        >
                                            <LogOut size={16} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/login"
                                className="text-sm font-semibold px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* MOBILE MENU BTN */}
                <button
                    className="md:hidden p-2 text-slate-300"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    <div className="space-y-1.5">
                        <span className={`block w-6 h-0.5 bg-current transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-current transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
                        <span className={`block w-6 h-0.5 bg-current transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                    </div>
                </button>
            </div>

            {/* MOBILE DROPDOWN */}
            {menuOpen && (
                <div className="md:hidden border-t border-white/10 bg-[#020617] px-5 py-4 space-y-4">
                    <nav className="flex flex-col gap-2">
                        <MobileNavLink href="/" label="Home" onClick={() => setMenuOpen(false)} />
                        <MobileNavLink href="/explore" label="Explore" onClick={() => setMenuOpen(false)} />
                        <MobileNavLink href="/dashboard" label="Feed" onClick={() => setMenuOpen(false)} />
                        <MobileNavLink href="/assistant" label="AI Assistant ✨" onClick={() => setMenuOpen(false)} />
                        <MobileNavLink href="/my-bookings" label="My Bookings" onClick={() => setMenuOpen(false)} />
                        
                        {user ? (
                            user.verification_status === "approved" ? (
                                <div className="py-2 border-t border-white/5 mt-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">For Vendors</p>
                                    <MobileNavLink href="/vendor/dashboard" label="Vendor Dashboard" onClick={() => setMenuOpen(false)} />
                                </div>
                            ) : null
                        ) : (
                            <div className="py-2 border-t border-white/5 mt-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">For Vendors</p>
                                <MobileNavLink href="/vendor/apply" label="List Your Business" onClick={() => setMenuOpen(false)} />
                                <MobileNavLink href="/vendor/login" label="Vendor Login" onClick={() => setMenuOpen(false)} />
                            </div>
                        )}
                    </nav>
                    <div className="pt-4 border-t border-white/10">
                        {user ? (
                            <div className="space-y-4">
                                <SOSButton />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <User size={16} />
                                        <span>{user.name}</span>
                                    </div>
                                    <button onClick={handleLogout} className="text-xs font-semibold text-red-400">
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 text-center">
                                <Link
                                    href="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="text-center py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="text-center py-2 rounded-lg bg-blue-600 text-sm font-medium text-white"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${active ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
        >
            {label}
        </Link>
    );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block py-2 text-base font-medium text-slate-300 hover:text-white"
        >
            {label}
        </Link>
    );
}

function DropdownLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
        >
            <span className="text-slate-400">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}
