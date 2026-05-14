"use client";

import { useState, useEffect, use } from "react";
import { 
    MapPin, 
    MountainSnow, 
    Clock, 
    BarChart3, 
    Calendar, 
    CheckCircle2, 
    ArrowLeft, 
    Briefcase,
    BookOpen,
    Loader2,
    Compass
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function TrekDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [trek, setTrek] = useState<any>(null);
    const [itinerary, setItinerary] = useState<any[]>([]);
    const [stories, setStories] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Trek
                const trekRes = await fetch(`${API_BASE}/api/tourism/treks/${id}`);
                if (!trekRes.ok) throw new Error("Trek not found");
                const trekData = await trekRes.json();
                setTrek(trekData.trek);

                // 2. Fetch Itinerary
                const itiRes = await fetch(`${API_BASE}/api/tourism/treks/${id}/itinerary`);
                if (itiRes.ok) {
                    const itiData = await itiRes.json();
                    setItinerary(itiData.itinerary || []);
                }

                // 3. Fetch Stories
                const storiesRes = await fetch(`${API_BASE}/api/stories/target?type=trek&id=${id}`);
                if (storiesRes.ok) {
                    const storiesData = await storiesRes.json();
                    setStories(storiesData.stories || []);
                }

                // 4. Fetch Vendors
                const vendorsRes = await fetch(`${API_BASE}/api/vendors/trek/${id}`);
                if (vendorsRes.ok) {
                    const vendorsData = await vendorsRes.json();
                    setVendors(vendorsData.listings || []);
                }

            } catch (err: any) {
                setError(err.message || "Failed to load trek details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Calculating altitude & terrain...</p>
            </div>
        );
    }

    if (error || !trek) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8">
                <h1 className="text-4xl font-black text-white mb-4 italic">Summit Not Found</h1>
                <p className="text-slate-400 mb-8">{error || "This trekking route is currently uncharted."}</p>
                <Link href="/explore">
                    <Button>Search Routes</Button>
                </Link>
            </div>
        );
    }

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

    const highlights = getArray(trek.highlights);
    const activities = getArray(trek.activities);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            
            {/* Hero Section */}
            <div className="relative h-[80vh] w-full overflow-hidden">
                <img 
                    src={trek.image} 
                    alt={trek.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 lg:px-20 lg:pb-20 text-center items-center">
                    <Link href="/explore" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-[0.4em] group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Global Hub
                    </Link>
                    
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-black tracking-[0.3em] text-emerald-400 uppercase">
                                {trek.difficulty} Grade
                            </div>
                            <div className="inline-flex px-4 py-1.5 rounded-full bg-white/10 border border-white/5 text-[10px] font-black tracking-[0.3em] text-slate-300 uppercase italic">
                                High Altitude
                            </div>
                        </div>
                        <h1 className="text-6xl lg:text-9xl font-black text-white leading-none mb-4 italic tracking-tighter uppercase drop-shadow-2xl">
                            {trek.name}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center gap-y-6 gap-x-12 text-xs font-black uppercase tracking-[0.3em] text-slate-300">
                            <span className="flex items-center gap-3"><MapPin size={20} className="text-emerald-500" /> {trek.district_name}</span>
                            <span className="flex items-center gap-3"><MountainSnow size={20} className="text-emerald-500" /> {trek.altitude}</span>
                            <span className="flex items-center gap-3"><Clock size={20} className="text-emerald-500" /> {trek.duration}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <main className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-3 gap-20">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-24">
                    
                    {/* Metrics Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] text-center flex flex-col items-center group hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all duration-500">
                            <BarChart3 className="text-emerald-400 mb-4 opacity-60" size={24} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Difficulty</span>
                            <span className="text-xl font-black text-white uppercase italic">{trek.difficulty}</span>
                         </div>
                         <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] text-center flex flex-col items-center group hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all duration-500">
                            <Compass className="text-emerald-400 mb-4 opacity-60" size={24} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Peak Height</span>
                            <span className="text-xl font-black text-white">{trek.altitude}</span>
                         </div>
                         <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] text-center flex flex-col items-center group hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all duration-500">
                            <Clock className="text-emerald-400 mb-4 opacity-60" size={24} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Est. Time</span>
                            <span className="text-xl font-black text-white">{trek.duration}</span>
                         </div>
                         <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] text-center flex flex-col items-center group hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all duration-500">
                            <Calendar className="text-emerald-400 mb-4 opacity-60" size={24} />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Best Season</span>
                            <span className="text-xs font-black text-white uppercase italic leading-tight text-center">
                                {trek.best_time || "March - May"}
                            </span>
                         </div>
                    </div>

                    {/* Description Section */}
                    <section className="animate-in fade-in duration-700">
                        <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-8">Base Camp Narrative</h2>
                        <p className="text-2xl text-slate-300 leading-relaxed font-medium mb-16">
                            {trek.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Highlights */}
                            <div className="p-10 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2.5rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-all" />
                                <h3 className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                                    <MountainSnow size={24} className="text-emerald-400" /> Trail Highlights
                                </h3>
                                <ul className="space-y-6">
                                    {highlights.length > 0 ? highlights.map((h: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 text-sm font-bold text-slate-400 uppercase tracking-tight">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_12px_#10b981]" /> {h}
                                        </li>
                                    )) : <li className="text-slate-600 italic">Exploring data...</li>}
                                </ul>
                            </div>

                            {/* Best Season */}
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                <h3 className="flex items-center gap-3 text-sm font-black text-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">
                                    <MapPin size={24} className="text-emerald-400" /> Route Overview
                                </h3>
                                <div className="space-y-6">
                                    <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Main Route</p>
                                        <p className="text-sm font-bold text-white italic">{trek.route || "NA"}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                        Altitude profiles and route points may vary based on weather and group capability. Always trek with a guide.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Itinerary Timeline */}
                    <section>
                        <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-12">Day-by-Day Journey</h2>
                        <div className="relative space-y-2 pl-4">
                            {/* Vertical Line */}
                            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-emerald-500/50 via-emerald-500/20 to-transparent" />
                            
                            {itinerary.length > 0 ? itinerary.map((day, i) => (
                                <div key={i} className="relative pl-14 py-8 group">
                                    {/* Timeline Node */}
                                    <div className="absolute left-[14px] top-9 w-5 h-5 rounded-full bg-[#020617] border-2 border-emerald-500 flex items-center justify-center outline outline-4 outline-emerald-500/10 group-hover:scale-125 transition-transform duration-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>
                                    
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group-hover:bg-emerald-500/5 group-hover:border-emerald-500/20 transition-all duration-700 shadow-sm">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
                                            <div>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2 block italic">Day {day.day_number}</span>
                                                <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{day.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full"><Compass size={12}/> {day.distance}</span>
                                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full"><MountainSnow size={12}/> {day.altitude}</span>
                                                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full"><Clock size={12}/> {day.duration}</span>
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed font-serif italic">
                                            {day.description}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-600 italic ml-10">Itinerary for this route is being compiled.</p>
                            )}
                        </div>
                    </section>

                    {/* Experiences Section */}
                    <section>
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-12">Trail Experiences</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activities.map((act: string, i: number) => (
                                <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col items-center text-center group cursor-default">
                                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        <Compass size={32} />
                                    </div>
                                    <span className="font-black text-white uppercase tracking-[0.2em] text-[11px]">{act}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stories Section */}
                    <section>
                        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                            <h2 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Echoes from the Trail</h2>
                            <Link href="/echoes" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all">View All Stories</Link>
                        </div>
                        {stories.length > 0 ? (
                            <div className="space-y-6">
                                {stories.map((story) => (
                                    <div key={story.id} className="p-8 bg-white/[0.01] border border-white/5 rounded-3xl hover:bg-white/[0.03] transition-all group">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full border border-emerald-500/30 overflow-hidden bg-emerald-500/10">
                                                    {story.author_profile_image && <img src={story.author_profile_image} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white uppercase tracking-widest text-lg group-hover:text-emerald-400 transition-colors uppercase italic leading-none">{story.title}</h4>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1 inline-block">{story.user_name} • {new Date(story.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-4 leading-relaxed font-serif italic">
                                            "{story.description}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 text-center rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01]">
                                <MountainSnow size={48} className="mx-auto text-slate-800 mb-6 opacity-30" />
                                <p className="text-slate-600 text-xs font-black uppercase tracking-widest">No trail echoes recorded for this route</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Vendors & CTA */}
                <div className="space-y-8">
                    
                    {/* Booking Control */}
                    <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl sticky top-28 border-emerald-500/10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-emerald-50 text-emerald-400 uppercase tracking-widest">Guide & Porter</h3>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Verified Experts</p>
                            </div>
                        </div>

                        <div className="space-y-5 mb-10">
                            {vendors.length > 0 ? vendors.map((v) => (
                                <div key={v.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-emerald-400">{v.listing_type}</span>
                                        <span className="text-white bg-white/10 px-2 py-0.5 rounded-md">{v.price}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors uppercase italic">{v.title}</h4>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic mb-4">Certifed by {v.business_name}</div>
                                    <Button size="sm" fullWidth className="h-10 text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500 text-slate-950 hover:bg-emerald-400">
                                        Secure Booking
                                    </Button>
                                </div>
                            )) : (
                                <div className="py-16 text-center opacity-40 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Route specific vendors<br/>under verification</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5">
                            <h4 className="text-sm font-black text-white uppercase tracking-[0.1em] mb-4 flex items-center gap-2">
                                <Compass size={16} className="text-emerald-400" /> Prep for high altitude
                            </h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
                                We strongly recommend hiring a verified guide for any trek above 3000m. Your safety is our priority.
                            </p>
                            <Link href="/explore">
                                <Button fullWidth variant="outline" className="border-white/10 text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest">
                                    Back to Global Hub
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
