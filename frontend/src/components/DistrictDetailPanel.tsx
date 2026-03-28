import { useState, useEffect } from "react";
import { X, MapPin, MountainSnow, BookOpen, Navigation, Briefcase, Calendar, Users, Phone, Mail, CheckCircle2 } from "lucide-react";
import DestinationCard from "./DestinationCard";
import SaveButton from "./SaveButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type DistrictBase = {
    id: string; // usually slug
    slug?: string;
    name: string;
    description: string;
    destinations: any[];
    stories: any[];
    treks: any[];
};

interface DistrictDetailPanelProps {
    district: DistrictBase | null;
    onClose: () => void;
}

export default function DistrictDetailPanel({ district, onClose }: DistrictDetailPanelProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "destinations" | "stories" | "treks" | "services">("overview");
    const [services, setServices] = useState<any[]>([]);
    const [servicesLoading, setServicesLoading] = useState(false);
    
    // Booking Modal State
    const [bookingListing, setBookingListing] = useState<any>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        travel_date: "",
        people_count: 1,
        contact_name: "",
        contact_phone: "",
        contact_email: "",
        message: ""
    });
    const [submittingBooking, setSubmittingBooking] = useState(false);
    const [bookingError, setBookingError] = useState("");

    useEffect(() => {
        if (district && activeTab === "services") {
            fetchServices();
        }
    }, [activeTab, district]);

    const fetchServices = async () => {
        if (!district) return;
        setServicesLoading(true);
        try {
            const slug = district.slug || district.id; // fallback to id if slug is missing
            const res = await fetch(`${API_BASE}/api/vendors/district/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setServices(data.listings || []);
            }
        } catch (e) {
            console.error("Failed to fetch services", e);
        } finally {
            setServicesLoading(false);
        }
    };

    const submitBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingBooking(true);
        setBookingError("");
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setBookingError("You must be logged in to request a booking.");
                setSubmittingBooking(false);
                return;
            }

            const res = await fetch(`${API_BASE}/api/bookings`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    vendor_id: bookingListing.vendor_id,
                    listing_id: bookingListing.id,
                    ...bookingForm
                })
            });

            const data = await res.json();
            if (res.ok) {
                setBookingSuccess(true);
                setTimeout(() => {
                    setBookingSuccess(false);
                    setBookingListing(null);
                }, 3000);
            } else {
                setBookingError(data.error || "Failed to submit request.");
            }
        } catch (e) {
            setBookingError("Network error. Please try again.");
        } finally {
            setSubmittingBooking(false);
        }
    };

    if (!district) return null;

    const tabs = [
        { id: "overview", label: "Overview", icon: Navigation },
        { id: "destinations", label: "Destinations", icon: MapPin },
        { id: "stories", label: "Stories", icon: BookOpen },
        { id: "treks", label: "Treks", icon: MountainSnow },
        { id: "services", label: "Local Services", icon: Briefcase },
    ] as const;

    return (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-slate-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-6 border-b border-white/5 relative shrink-0">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mt-2">
                    {district.name}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-medium tracking-wide uppercase">
                    <span>{district.destinations?.length || 0} Destinations</span>
                    <span>•</span>
                    <span>{district.stories?.length || 0} Stories</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 pt-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                                isActive 
                                ? "border-blue-400 text-blue-400" 
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                {activeTab === "overview" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">About</h3>
                            <p className="text-slate-300 leading-relaxed text-sm">
                                {district.description}
                            </p>
                        </div>
                        {(!district.destinations || district.destinations.length === 0) && (!district.stories || district.stories.length === 0) && (
                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm">
                                We are still gathering data for this district. Be the first to share a story from {district.name}!
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "destinations" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {district.destinations && district.destinations.length > 0 ? (
                            district.destinations.map((dest, i) => (
                                <DestinationCard key={i} destination={dest} />
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm italic text-center py-10">No popular destinations listed yet.</p>
                        )}
                    </div>
                )}

                {activeTab === "stories" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {district.stories && district.stories.length > 0 ? (
                            district.stories.map((story, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
                                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors text-base">{story.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1">By {story.author} • {new Date(story.date).toLocaleDateString()}</p>
                                    <p className="text-sm text-slate-300 mt-3 line-clamp-3 leading-relaxed">{story.excerpt}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-sm italic text-center py-10">No travel stories shared yet.</p>
                        )}
                    </div>
                )}

                {activeTab === "treks" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {district.treks && district.treks.length > 0 ? (
                            district.treks.map((trek, i) => (
                                <div key={i} className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex justify-between items-center group hover:bg-emerald-900/40 transition-colors cursor-pointer relative overflow-hidden">
                                     <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 rounded-l-xl"></div>
                                    <div>
                                        <h4 className="font-bold text-emerald-50">{trek.name}</h4>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-emerald-200/70 font-medium">
                                            <span>{trek.duration}</span>
                                            <span>•</span>
                                            <span>{trek.difficulty}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                        <MountainSnow size={16} />
                                    </div>
                                    <div className="ml-4 flex-shrink-0 z-10">
                                        <SaveButton itemType="trek" itemId={trek.id || trek.name} />
                                    </div>
                                </div>

                            ))
                        ) : (
                            <p className="text-slate-400 text-sm italic text-center py-10">No specific treks found in this district.</p>
                        )}
                    </div>
                )}

                {activeTab === "services" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {servicesLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <div className="h-8 w-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <p className="text-xs font-black uppercase tracking-widest text-blue-400 animate-pulse">Finding local services...</p>
                            </div>
                        ) : services.length > 0 ? (
                            services.map((service, i) => (
                                <div key={i} className="bg-slate-900/40 border border-white/10 rounded-[2rem] overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col">
                                    <div className="h-32 bg-slate-800 relative overflow-hidden">
                                        {service.image_url ? (
                                            <img src={service.image_url} alt={service.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-slate-500"><Briefcase size={24} /></div>
                                        )}
                                        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-md border border-white/10 text-[10px] uppercase font-black tracking-widest text-white">
                                            {service.listing_type}
                                        </div>
                                    </div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">{service.business_name}</div>
                                        <h4 className="text-lg font-black text-white leading-tight mb-2">{service.title}</h4>
                                        <p className="text-[10px] text-slate-400 font-medium mb-3 line-clamp-2">{service.description}</p>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-sm font-bold text-white">{service.price || 'Price on request'}</span>
                                            <button 
                                                onClick={() => setBookingListing(service)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20"
                                            >
                                                Request
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-slate-900/40 border border-dashed border-white/10 rounded-3xl p-6">
                                <Briefcase size={24} className="mx-auto text-slate-500 mb-3" />
                                <h4 className="text-sm font-bold text-white mb-1">No Local Services Yet</h4>
                                <p className="text-xs text-slate-400">Be the first to create a vendor listing in this district!</p>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Booking Modal Overlay */}
            {bookingListing && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 animate-in fade-in duration-300 flex flex-col items-center justify-center p-4">
                    {bookingSuccess ? (
                        <div className="text-center animate-in zoom-in-95 duration-500 bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} className="text-emerald-400" />
                            </div>
                            <h4 className="text-xl font-black text-white mb-2">Request Sent!</h4>
                            <p className="text-sm text-slate-400">The vendor will contact you to confirm the booking shortly.</p>
                        </div>
                    ) : (
                        <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom-8 duration-300">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Booking Request</h4>
                                <button onClick={() => setBookingListing(null)} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 transition-colors"><X size={16} /></button>
                            </div>
                            
                            <form onSubmit={submitBooking} className="p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar">
                                <div className="text-center mb-2">
                                    <div className="text-blue-400 text-xs font-black tracking-widest uppercase">{bookingListing.business_name}</div>
                                    <div className="text-white font-bold text-sm mt-1">{bookingListing.title}</div>
                                </div>

                                {bookingError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium rounded-xl text-center">
                                        {bookingError}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Date</label>
                                        <div className="relative">
                                            <input required type="date" value={bookingForm.travel_date} onChange={(e) => setBookingForm({...bookingForm, travel_date: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50 appearance-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">People</label>
                                        <div className="relative">
                                            <input required type="number" min="1" value={bookingForm.people_count} onChange={(e) => setBookingForm({...bookingForm, people_count: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50 appearance-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Full Name</label>
                                    <input required type="text" value={bookingForm.contact_name} onChange={(e) => setBookingForm({...bookingForm, contact_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50" placeholder="John Doe" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Phone</label>
                                        <input required type="text" value={bookingForm.contact_phone} onChange={(e) => setBookingForm({...bookingForm, contact_phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50" placeholder="+977..." />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Email</label>
                                        <input required type="email" value={bookingForm.contact_email} onChange={(e) => setBookingForm({...bookingForm, contact_email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50" placeholder="you@email.com" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Message (Optional)</label>
                                    <textarea value={bookingForm.message} onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500/50 resize-none" placeholder="Any special requirements?" />
                                </div>

                                <button type="submit" disabled={submittingBooking} className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 text-xs">
                                    {submittingBooking ? "Sending..." : "Send Request"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
