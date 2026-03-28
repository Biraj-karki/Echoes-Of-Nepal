"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    
    // Hide footer on admin or pure auth routes if desired
    if (pathname?.startsWith("/admin")) return null;

    return (
        <footer className="border-t border-white/10 bg-[#020617] py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-1">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg border border-white/15 bg-white/5 grid place-items-center text-sm font-black">E</div>
                        Echoes of Nepal
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Discover, plan, and share your adventures across the beautiful landscapes of the Himalayas.
                    </p>
                </div>
                
                <div>
                    <h4 className="text-white font-bold mb-4 text-[10px] tracking-widest uppercase">Explore</h4>
                    <ul className="space-y-2 text-sm text-slate-400 font-medium">
                        <li><Link href="/explore" className="hover:text-amber-500 transition-colors">Destinations</Link></li>
                        <li><Link href="/explore" className="hover:text-amber-500 transition-colors">Treks</Link></li>
                        <li><Link href="/dashboard" className="hover:text-amber-500 transition-colors">Travel Stories</Link></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="text-amber-500 font-bold mb-4 text-[10px] tracking-widest uppercase">For Businesses</h4>
                    <ul className="space-y-2 text-sm text-slate-400 font-medium">
                        <li><Link href="/vendor/apply" className="hover:text-amber-400 transition-colors">Become a Partner</Link></li>
                        <li><Link href="/vendor/login" className="hover:text-amber-400 transition-colors">Vendor Login</Link></li>
                        <li><Link href="/vendor/login" className="hover:text-amber-400 transition-colors">Vendor Dashboard</Link></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="text-white font-bold mb-4 text-[10px] tracking-widest uppercase">Travelers</h4>
                    <ul className="space-y-2 text-sm text-slate-400 font-medium">
                        <li><Link href="/login" className="hover:text-blue-400 transition-colors">User Login</Link></li>
                        <li><Link href="/login" className="hover:text-blue-400 transition-colors">Sign Up</Link></li>
                        <li><Link href="/profile" className="hover:text-blue-400 transition-colors">My Profile</Link></li>
                    </ul>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-5 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
                <p>&copy; {new Date().getFullYear()} Echoes of Nepal. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <Link href="#" className="hover:text-slate-300 transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
