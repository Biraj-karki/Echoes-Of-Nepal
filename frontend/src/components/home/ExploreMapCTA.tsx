import Link from "next/link";
import { Map, ArrowRight } from "lucide-react";

export default function ExploreMapCTA() {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Map Graphic Suggestion */}
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                <Map size={600} className="text-blue-500 rotate-12" />
            </div>

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Explore Nepal on the Map</h2>
                
                <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Use our interactive map to explore Nepal district by district. Discover hidden destinations, epic trekking routes, and read inspiring travel stories from across the country.
                </p>
                
                <Link 
                    href="/explore"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl shadow-blue-900/20"
                >
                    <Map size={20} />
                    Open Interactive Map
                    <ArrowRight size={18} className="ml-1" />
                </Link>
            </div>
        </section>
    );
}
