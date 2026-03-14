"use client";

import Link from "next/link";
import { useAuth } from "@/app/AuthProvider";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

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
                    <div className="h-9 w-9 rounded-xl border border-white/15 bg-white/5 grid place-items-center font-bold text-lg text-white group-hover:bg-white/10 transition-colors">
                        E
                    </div>
                    <span className="font-semibold tracking-tight text-white group-hover:text-amber-500 transition-colors">
                        Echoes of Nepal
                    </span>
                </Link>

                {/* DESKTOP NAV */}
                <nav className="hidden md:flex items-center gap-1">
                    <NavLink href="/" label="Home" active={isActive("/")} />
                    <NavLink href="/explore" label="Explore" active={isActive("/explore")} />
                    <NavLink href="/dashboard" label="Stories" active={isActive("/dashboard")} />
                </nav>

                {/* AUTH ACTIONS */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-300">
                                Hi, <span className="font-medium text-white">{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
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
                                className="text-sm font-semibold px-4 py-2 rounded-xl text-white bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-lg shadow-orange-500/20 transition-all"
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
                        <MobileNavLink href="/dashboard" label="Stories" onClick={() => setMenuOpen(false)} />
                    </nav>
                    <div className="pt-4 border-t border-white/10">
                        {user ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <User size={16} />
                                    <span>{user.name}</span>
                                </div>
                                <button onClick={handleLogout} className="text-xs font-semibold text-red-400">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
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
                                    className="text-center py-2 rounded-lg bg-orange-600 text-sm font-medium text-white"
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
