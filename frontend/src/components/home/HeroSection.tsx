import Link from "next/link";
import { Map, BookOpen, ArrowRight } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 z-10" />
                <img 
                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=2000" 
                    alt="Himalayan Mountains" 
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                    <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent">
                        Welcome to
                    </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
                    Echoes of Nepal
                </h1>
                
                <p className="text-lg md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                    Discover destinations, travel stories, treks, and hidden gems from across Nepal.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        href="/explore"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    >
                        <Map size={20} />
                        Explore Nepal Map
                        <ArrowRight size={18} className="ml-1" />
                    </Link>
                    
                    <Link 
                        href="/dashboard"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105"
                    >
                        <BookOpen size={20} />
                        Browse Stories
                    </Link>
                </div>
            </div>
            
            {/* Scroll indicator overlay at bottom */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce text-white/50">
                <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                </div>
            </div>
        </section>
    );
}
