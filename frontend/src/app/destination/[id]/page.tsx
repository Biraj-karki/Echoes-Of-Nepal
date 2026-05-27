"use client";

import { useState, useEffect, use } from "react";
import { 
    MapPin, 
    Star, 
    Clock, 
    Mountain, 
    Calendar, 
    CheckCircle2, 
    ArrowLeft, 
    Briefcase,
    BookOpen,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { API_BASE } from "@/lib/api";

const getFirstImage = (story: any) => {
    if (!Array.isArray(story?.media)) return null;

    return story.media.find((item: any) => {
        const type = String(item?.media_type || "").toLowerCase();
        const url = String(item?.media_url || "");
        return type !== "video" && !/\.(mp4|mov|webm)$/i.test(url);
    }) || null;
};

export default function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [destination, setDestination] = useState<any>(null);
    const [stories, setStories] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Destination
                const destRes = await fetch(`${API_BASE}/api/tourism/destinations/${id}`);
                if (!destRes.ok) throw new Error("Destination not found");
                const destData = await destRes.json();
                setDestination(destData.destination);

                // 2. Fetch Stories
                const storiesRes = await fetch(`${API_BASE}/api/stories/target?type=destination&id=${id}`);
                if (storiesRes.ok) {
                    const storiesData = await storiesRes.json();
                    setStories(storiesData.stories || []);
                }

                // 3. Fetch Vendors
                const vendorsRes = await fetch(`${API_BASE}/api/vendors/destination/${id}`);
                if (vendorsRes.ok) {
                    const vendorsData = await vendorsRes.json();
                    setVendors(vendorsData.listings || []);
                }

            } catch (err: any) {
                setError(err.message || "Failed to load destination");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Preparing your journey...</p>
            </div>
        );
    }

    if (error || !destination) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-black text-white mb-4 italic">Oops!</h1>
                <p className="text-slate-400 mb-8">{error || "Destination could not be found."}</p>
                <Link href="/explore">
                    <Button>Back to Explore</Button>
                </Link>
            </div>
        );
    }

    // Handle JSONB or string fields
    const getArray = (val: any) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return val.split(",").map((s: string) => s.trim()).filter(Boolean);
        }
    };

    const highlights = getArray(destination.highlights);
    const thingsToDo = getArray(destination.things_to_do);
    const tips = getArray(destination.tips);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            
            {/* Hero Section */}
            <div className="relative min-h-[560px] h-[72vh] sm:h-[75vh] w-full overflow-hidden">
                <img 
                    src={destination.image} 
                    alt={destination.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-end px-4 pb-8 sm:px-6 sm:pb-12 lg:px-20 lg:pb-20">
                    <Link href="/explore" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-[10px] sm:mb-8 sm:text-xs font-bold uppercase tracking-widest group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Explore
                    </Link>
                    
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        <div>
                            <div className="inline-flex px-3 py-1 rounded bg-blue-500/20 border border-blue-500/30 text-[10px] font-black tracking-widest text-blue-400 uppercase mb-4">
                                {destination.category}
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-8xl font-black text-white leading-[0.95] mb-5 sm:mb-6 italic tracking-tight uppercase break-words">
                                {destination.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] text-slate-300">
                                <span className="flex items-center gap-2.5"><MapPin size={18} className="text-blue-500" /> {destination.district_name}</span>
                                <span className="flex items-center gap-2.5"><Star size={18} className="text-yellow-400 fill-yellow-400" /> {destination.rating} Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-16 sm:space-y-24">
                    
                    {/* About Section */}
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8">Discovery & Overview</h2>
                        <p className="text-lg sm:text-2xl text-slate-300 leading-relaxed font-medium mb-10 sm:mb-16">
                            {destination.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Highlights */}
                            <div className="p-6 sm:p-10 bg-slate-900/40 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all" />
                                <h3 className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                                    <Mountain size={20} className="text-emerald-400" /> Main Highlights
                                </h3>
                                <ul className="space-y-5">
                                    {highlights.length > 0 ? highlights.map((h: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-400 uppercase tracking-tight">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_10px_#10b981]" /> {h}
                                        </li>
                                    )) : <li className="text-slate-600 italic">No specific highlights listed yet.</li>}
                                </ul>
                            </div>

                            {/* Best Season */}
                            <div className="p-6 sm:p-10 bg-slate-900/40 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem]">
                                <h3 className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                                    <Calendar size={20} className="text-blue-400" /> Optimal Window
                                </h3>
                                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center mb-6">
                                    <span className="text-blue-100 font-black text-xl uppercase italic tracking-wider">
                                        {destination.best_time || destination.best_season || "March to June"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Weather in this region is best during non-monsoon months. We recommend checking local forecasts before departure.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Things To Do */}
                    <section>
                        <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-12">Experiences & Activities</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {(thingsToDo.length > 0 ? thingsToDo : destination.activities?.split(",") || []).map((act: string, i: number) => (
                                <div key={i} className="flex items-center gap-5 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] transition-all group cursor-default">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-500">
                                        <Star size={20} />
                                    </div>
                                    <span className="font-black text-slate-200 uppercase tracking-[0.15em] text-[11px]">{act}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Rich Info: Tips & Travel */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
                        <div>
                            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8">Traveler Guidelines</h2>
                            <div className="space-y-6">
                                {tips.length > 0 ? tips.map((tip: string, i: number) => (
                                    <div key={i} className="flex gap-4 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                                        <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xs">
                                            {i+1}
                                        </div>
                                        <p className="text-sm font-medium text-slate-400 leading-relaxed italic">{tip}</p>
                                    </div>
                                )) : <p className="text-slate-600 italic">No travel tips available.</p>}
                            </div>
                        </div>
                        <div className="space-y-10">
                             <div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MapPin size={16} className="text-red-500" /> How to Reach
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                    {destination.how_to_reach || "Contact local transport services for the best route to this destination."}
                                </p>
                             </div>
                             <div>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Clock size={16} className="text-yellow-500" /> Entry Fee & Hours
                                </h3>
                                <div className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                                    <p className="text-lg font-black text-white italic underline underline-offset-8 decoration-yellow-500/50">
                                        {destination.entry_fee || "Typically Free"}
                                    </p>
                                    <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pricing may vary for international visitors</p>
                                </div>
                             </div>
                        </div>
                    </section>

                    {/* Stories Section */}
                    <section>
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12 border-b border-white/5 pb-6">
                            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Echoes from Travelers</h2>
                            <Link href="/echoes" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest border-b border-transparent hover:border-white/20 transition-all">Explore Entire Feed</Link>
                        </div>
                        {stories.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {stories.map((story) => (
                                    <div key={story.id} className="p-5 sm:p-8 bg-slate-900/40 border border-white/5 rounded-[1.75rem] sm:rounded-[2rem] hover:bg-slate-800/60 hover:border-amber-500/30 transition-all group cursor-pointer shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full" />
                                        {getFirstImage(story)?.media_url && (
                                            <div className="mb-6 overflow-hidden rounded-[1.5rem] border border-white/5 bg-black/30">
                                                <img
                                                    src={getFirstImage(story).media_url}
                                                    alt={story.title}
                                                    className="h-48 sm:h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>
                                        )}
                                        <h4 className="font-black text-white group-hover:text-amber-400 transition-colors text-xl leading-tight mb-4 italic">"{story.title}"</h4>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                                                {story.author_profile_image && <img src={story.author_profile_image} className="w-full h-full object-cover" />}
                                            </div>
                                            <span>{story.user_name}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                            <span>{new Date(story.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-4 leading-relaxed font-serif italic opacity-70">
                                            {story.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center rounded-[3rem] border border-dashed border-white/10 bg-white/[0.01]">
                                <BookOpen size={48} className="mx-auto text-slate-800 mb-6 opacity-30" />
                                <p className="text-slate-600 text-xs font-black uppercase tracking-widest">Silence on the trail. No stories yet.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Vendors & CTA */}
                <div className="space-y-8">
                    
                    {/* Verified Services Section */}
                    <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl lg:sticky lg:top-28">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                <Briefcase size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Local Experts</h3>
                                <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">Verified Services</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto no-scrollbar">
                            {vendors.length > 0 ? vendors.map((v) => (
                                <div key={v.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{v.listing_type}</span>
                                        <span className="text-[10px] font-bold text-white">{v.price}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-1">{v.title}</h4>
                                    <p className="text-[10px] text-slate-500 mb-4">{v.business_name}</p>
                                    <Button size="sm" fullWidth className="h-8 text-[9px] font-black tracking-widest">
                                        Book Hub
                                    </Button>
                                </div>
                            )) : (
                                <div className="py-12 text-center opacity-40">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No active local experts found</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-blue-500/5 rounded-3xl border border-blue-500/20">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2 italic underline underline-offset-4 decoration-blue-500/50">Plan your trip</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                                Connect with verified local guides and accommodation owners directly through Echoes of Nepal.
                            </p>
                            <Link href="/explore">
                                <Button fullWidth variant="outline" className="text-xs font-black tracking-widest">
                                    Explore Map Hub
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
