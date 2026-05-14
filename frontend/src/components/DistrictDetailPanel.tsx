import { useState, useEffect } from "react";
import { X, MapPin, MountainSnow, BookOpen, Navigation, Briefcase, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import DestinationCard from "./DestinationCard";
import SaveButton from "./SaveButton";
import CalendarPicker from "./CalendarPicker";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Alert } from "./ui/Alert";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type DistrictBase = {
    id: string; 
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

    // OTP States
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpStatus, setOtpStatus] = useState<{type: "error" | "success", msg: string} | null>(null);

    useEffect(() => {
        if (district && activeTab === "services") {
            fetchServices();
        }
    }, [activeTab, district]);

    const fetchServices = async () => {
        if (!district) return;
        setServicesLoading(true);
        try {
            const slug = district.slug || district.id;
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

    const handleSendOtp = async () => {
        if (!bookingForm.contact_email) {
            setOtpStatus({ type: "error", msg: "Please enter your email first." });
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(bookingForm.contact_email)) {
            setOtpStatus({ type: "error", msg: "Invalid email format." });
            return;
        }

        setSendingOtp(true);
        setOtpStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/otp/send`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: bookingForm.contact_email })
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                setOtpStatus({ type: "success", msg: "Verification code sent!" });
            } else {
                setOtpStatus({ type: "error", msg: data.error || "Failed to send code." });
            }
        } catch (e) {
            setOtpStatus({ type: "error", msg: "Connection error." });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue) return;
        setVerifyingOtp(true);
        setOtpStatus(null);
        try {
            const res = await fetch(`${API_BASE}/api/otp/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: bookingForm.contact_email, otp: otpValue })
            });
            const data = await res.json();
            if (res.ok) {
                setIsEmailVerified(true);
                setOtpStatus({ type: "success", msg: "Email verified successfully." });
            } else {
                setOtpStatus({ type: "error", msg: data.error || "Invalid code." });
            }
        } catch (e) {
            setOtpStatus({ type: "error", msg: "Verification error." });
        } finally {
            setVerifyingOtp(false);
        }
    };

    const validateBookingForm = () => {
        if (!bookingForm.travel_date || !bookingForm.contact_name || !bookingForm.contact_phone || !bookingForm.contact_email) {
            setBookingError("All fields marked with * are required.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(bookingForm.contact_email)) {
            setBookingError("Please enter a valid email address.");
            return false;
        }

        const selectedDate = new Date(bookingForm.travel_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            setBookingError("The travel date cannot be in the past.");
            return false;
        }

        return true;
    };

    const submitBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingError("");

        if (!validateBookingForm()) return;

        setSubmittingBooking(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setBookingError("Please log in to your account to confirm this booking.");
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
                }, 3500);
            } else {
                setBookingError(data.error || "Something went wrong while sending your request.");
            }
        } catch (e) {
            setBookingError("Network unreachable. Please check your connection and try again.");
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
        { id: "services", label: "Services", icon: Briefcase },
    ] as const;

    return (
        <div className="absolute top-0 right-0 h-full w-full sm:w-[400px] md:w-[450px] bg-[#0f172a]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-8 border-b border-white/5 relative shrink-0">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
                <div className="inline-flex px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-black tracking-widest text-blue-400 uppercase mb-2">
                    Region Detail
                </div>
                <h2 className="text-3xl font-bold text-white">
                    {district.name}
                </h2>
                <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                    <span className="flex items-center gap-1"><MapPin size={10} className="text-blue-500" /> {district.destinations?.length || 0} Places</span>
                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                    <span className="flex items-center gap-1"><BookOpen size={10} className="text-emerald-400" /> {district.stories?.length || 0} Stories</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 pt-2 border-b border-white/5 shrink-0 overflow-x-auto no-scrollbar bg-slate-900/40">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap text-xs font-bold uppercase tracking-widest ${
                                isActive 
                                ? "border-blue-500 text-blue-400 bg-blue-500/5" 
                                : "border-transparent text-slate-400 hover:text-slate-200"
                            }`}
                        >
                            <Icon size={14} className={isActive ? "text-blue-400" : "text-slate-500"} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                {activeTab === "overview" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">About the District</h3>
                            <p className="text-slate-300 leading-relaxed text-sm font-medium">
                                {district.description}
                            </p>
                        </div>
                        {(!district.destinations || district.destinations.length === 0) && (!district.stories || district.stories.length === 0) && (
                            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-200 text-xs font-medium leading-relaxed">
                                We are still gathering data for this district. Be the first to share a story from {district.name} and help fellow travelers!
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
                            <div className="text-center py-16">
                                <MapPin size={32} className="mx-auto text-slate-700 mb-4 opacity-20" />
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No destinations listed yet</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "stories" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {district.stories && district.stories.length > 0 ? (
                            district.stories.map((story, i) => (
                                <div key={i} className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl hover:bg-slate-800/60 hover:border-blue-500/30 transition-all cursor-pointer group shadow-sm">
                                    <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors text-lg leading-tight mb-2">{story.title}</h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4">
                                        <span>{story.author}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>{new Date(story.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-medium italic">"{story.excerpt}"</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <BookOpen size={32} className="mx-auto text-slate-700 mb-4 opacity-20" />
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No stories shared yet</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "treks" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {district.treks && district.treks.length > 0 ? (
                            district.treks.map((trek, i) => (
                                <Link href={`/trek/${trek.id}`} key={i} className="p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl flex justify-between items-center group hover:bg-emerald-500/[0.06] hover:border-emerald-500/30 transition-all cursor-pointer relative overflow-hidden">
                                     <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 opacity-50"></div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h4 className="font-bold text-emerald-50 text-base mb-1 truncate">{trek.name}</h4>
                                        <div className="flex items-center gap-3 text-[10px] text-emerald-400/60 font-black uppercase tracking-widest">
                                            <span>{trek.duration}</span>
                                            <span className="w-1 h-1 rounded-full bg-emerald-500/20" />
                                            <span>{trek.difficulty}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div onClick={(e) => e.preventDefault()}>
                                            <SaveButton itemType="trek" itemId={trek.id || trek.name} />
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg shadow-emerald-500/10">
                                            <MountainSnow size={18} />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <MountainSnow size={32} className="mx-auto text-slate-700 mb-4 opacity-20" />
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No treks discovered here</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "services" && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {servicesLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 animate-pulse">Finding local services...</p>
                            </div>
                        ) : services.length > 0 ? (
                            <>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Verified Local Stays</h4>
                                <Link href="/explore/vendors" className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:underline underline-offset-4 decoration-blue-500/50 transition-all">
                                    Browse all stays →
                                </Link>
                            </div>
                            {services.map((service, i) => (
                                <div key={i} className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all flex flex-col shadow-xl">
                                    <div className="h-40 bg-slate-800 relative overflow-hidden">
                                        {service.image_url ? (
                                            <img src={service.image_url} alt={service.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-slate-700">
                                                <Briefcase size={32} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] uppercase font-black tracking-[0.15em] text-white">
                                            {service.listing_type}
                                        </div>
                                    </div>
                                    <Link href={`/explore/vendors/${service.id}`} className="p-6 flex flex-col flex-1">
                                        <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-2">{service.business_name}</div>
                                        <h4 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">{service.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2 leading-relaxed italic">"{service.description}"</p>
                                        
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-tighter mb-0.5">Starting at</span>
                                                <span className="text-base font-black text-white italic">{service.price || 'Contact'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    size="sm"
                                                    variant="secondary"
                                                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    Details
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                            </>
                        ) : (
                            <div className="text-center py-16 bg-slate-900/20 border border-dashed border-white/10 rounded-[2rem] p-8">
                                <Briefcase size={32} className="mx-auto text-slate-700 mb-6 opacity-30" />
                                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">No Services Yet</h4>
                                <p className="text-xs text-slate-500 font-medium px-4">Our local vendor network is currently expanding. Check back soon for guides and stays!</p>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Booking Modal Overlay */}
            {bookingListing && (
                <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl z-[60] animate-in fade-in duration-300 flex flex-col items-center justify-center p-6">
                    {bookingSuccess ? (
                        <div className="text-center animate-in zoom-in-95 duration-500 bg-slate-900/50 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
                            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <h4 className="text-2xl font-black text-white leading-none mb-3 italic">Request Sent!</h4>
                            <p className="text-sm text-slate-400 font-medium">The vendor has been notified and will contact you directly to finalize your journey.</p>
                        </div>
                    ) : (
                        <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col relative animate-in slide-in-from-bottom-8 duration-500">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Secure Booking</h4>
                                <button onClick={() => setBookingListing(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all"><X size={18} /></button>
                            </div>
                            
                            <form onSubmit={submitBooking} className="p-8 flex flex-col gap-5 overflow-y-auto no-scrollbar">
                                <div className="space-y-5">
                                    <div className="text-center mb-4">
                                        <div className="text-white font-black text-xl italic tracking-tight leading-none uppercase mb-2">{bookingListing.title}</div>
                                        <div className="text-slate-500 text-[10px] font-bold tracking-widest uppercase italic">{bookingListing.business_name}</div>
                                    </div>

                                    <Alert 
                                        type="error" 
                                        message={bookingError} 
                                        className="mb-2" 
                                    />

                                    <div>
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3 block">Journey Date</label>
                                        <CalendarPicker 
                                            value={bookingForm.travel_date} 
                                            onChange={(date: string) => setBookingForm({...bookingForm, travel_date: date})} 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input 
                                            label="Guests"
                                            required 
                                            type="number" 
                                            min="1" 
                                            value={bookingForm.people_count} 
                                            onChange={(e) => setBookingForm({...bookingForm, people_count: parseInt(e.target.value)})} 
                                        />
                                        <Input 
                                            label="Your Name"
                                            required 
                                            type="text" 
                                            value={bookingForm.contact_name} 
                                            onChange={(e) => setBookingForm({...bookingForm, contact_name: e.target.value})} 
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-5">
                                        <Input 
                                            label="Phone"
                                            required 
                                            type="text" 
                                            value={bookingForm.contact_phone} 
                                            onChange={(e) => setBookingForm({...bookingForm, contact_phone: e.target.value})} 
                                            placeholder="+977" 
                                        />
                                        <div className="relative group/field">
                                            <Input 
                                                label="Email"
                                                required 
                                                type="email" 
                                                value={bookingForm.contact_email} 
                                                disabled={isEmailVerified || otpSent}
                                                className="pr-24"
                                                onChange={(e) => setBookingForm({...bookingForm, contact_email: e.target.value})} 
                                                placeholder="john@example.com" 
                                            />
                                            {!isEmailVerified && !otpSent && (
                                                <button 
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    disabled={sendingOtp || !bookingForm.contact_email}
                                                    className="absolute right-4 top-10 text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 disabled:opacity-30 transition-colors"
                                                >
                                                    {sendingOtp ? "Sending..." : "Send Code"}
                                                </button>
                                            )}
                                            {isEmailVerified && (
                                                <div className="absolute right-4 top-10 flex items-center gap-1.5 text-emerald-500">
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                                    <CheckCircle2 size={12} />
                                                </div>
                                            )}
                                        </div>

                                        {otpSent && !isEmailVerified && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="relative">
                                                    <Input 
                                                        label="Verification Code (Check Email)"
                                                        required 
                                                        type="text" 
                                                        maxLength={6}
                                                        className="pr-20"
                                                        value={otpValue} 
                                                        onChange={(e) => setOtpValue(e.target.value)} 
                                                        placeholder="000000" 
                                                    />
                                                    <button 
                                                        type="button"
                                                        onClick={handleVerifyOtp}
                                                        disabled={verifyingOtp || otpValue.length < 6}
                                                        className="absolute right-4 top-10 text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 disabled:opacity-30 transition-colors"
                                                    >
                                                        {verifyingOtp ? "Verifying..." : "Verify"}
                                                    </button>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => { setOtpSent(false); setOtpStatus(null); }}
                                                    className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                                >
                                                    Use different email
                                                </button>
                                            </div>
                                        )}

                                        {otpStatus && (
                                            <Alert 
                                                type={otpStatus.type} 
                                                message={otpStatus.msg} 
                                                className="mt-2"
                                            />
                                        )}
                                    </div>


                                    <div className={!isEmailVerified ? "opacity-30 pointer-events-none grayscale transition-all" : "transition-all"}>
                                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2.5 block">Message (Optional)</label>
                                        <textarea 
                                            value={bookingForm.message} 
                                            onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})} 
                                            rows={2} 
                                            className="w-full bg-[#020617] border border-white/5 rounded-2xl px-4 py-3 text-white text-xs font-medium focus:outline-none focus:border-blue-500/30 resize-none transition-all placeholder:text-slate-700" 
                                            placeholder="Any special requests or details?" 
                                        />
                                    </div>
                                </div>

                                <Button 
                                    type="submit" 
                                    loading={submittingBooking} 
                                    disabled={!isEmailVerified}
                                    fullWidth 
                                    className="py-4 text-[11px]"
                                >
                                    {submittingBooking ? "Sending Request..." : "Confirm Booking Request"}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
