"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ArrowLeft, 
    MapPin, 
    Star, 
    ShieldCheck, 
    Calendar,
    Users,
    MessageCircle,
    Info,
    Share2,
    Heart,
    Check,
    Loader2,
    QrCode,
    X
} from "lucide-react";
import StoryCard from "@/components/StoryCard";
import { API_BASE } from "@/lib/api";

export default function VendorListingDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = params?.id;

    const [listing, setListing] = useState<any>(null);
    const [relatedStories, setRelatedStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isQrOpen, setIsQrOpen] = useState(false);

    // Safe, localized check-in date validation to block past bookings
    const todayString = useMemo(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    // Booking & Verification States
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [submittingBooking, setSubmittingBooking] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [bookingForm, setBookingForm] = useState({
        travel_date: "",
        people_count: 1,
        contact_name: "",
        contact_phone: "",
        contact_email: "",
        message: ""
    });

    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otpStatus, setOtpStatus] = useState<{type: "error" | "success", msg: string} | null>(null);

    const galleryImages = useMemo(() => {
        if (!listing) return [];
        if (Array.isArray(listing.image_urls) && listing.image_urls.length > 0) return listing.image_urls;
        if (listing.image_url) return [listing.image_url];
        return [];
    }, [listing]);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch listing details
                const res = await fetch(`${API_BASE}/api/vendors/listing/${id}`);
                const data = await res.json();
                
                if (res.ok && data.listing) {
                    setListing(data.listing);
                    
                    // Fetch stories for the same district
                    const storyRes = await fetch(`${API_BASE}/api/stories`);
                    const storyData = await storyRes.json();
                    if (storyRes.ok) {
                        const filtered = (storyData.stories || []).filter((s: any) => 
                            s.location_tag?.toLowerCase() === data.listing.district_slug?.toLowerCase()
                        );
                        setRelatedStories(filtered);
                    }
                }
            } catch (err) {
                console.error("Failed to load listing detail", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSendOtp = async () => {
        if (!bookingForm.contact_email) {
            setOtpStatus({ type: "error", msg: "Please enter your email first." });
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

    const submitBooking = async () => {
        setBookingError("");
        if (!bookingForm.travel_date || !bookingForm.contact_name || !bookingForm.contact_phone) {
            setBookingError("Please fill all required fields.");
            return;
        }

        setSubmittingBooking(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setBookingError("Please log in to your account to confirm this booking.");
                return;
            }

            const res = await fetch(`${API_BASE}/api/bookings`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({
                    vendor_id: listing.vendor_id,
                    listing_id: listing.id,
                    ...bookingForm
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Redirect to payment page instead of showing success here
                router.push(`/booking/${data.booking.id}/payment`);
            } else {
                const data = await res.json();
                setBookingError(data.error || "Booking failed.");
            }
        } catch (e) {
            setBookingError("Network error.");
        } finally {
            setSubmittingBooking(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    if (!listing) return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-500 pt-20">
            <Info size={48} className="mb-4 opacity-20" />
            <h2 className="text-xl font-black uppercase tracking-widest italic">Listing not found</h2>
            <button onClick={() => router.back()} className="mt-6 text-blue-400 font-bold uppercase tracking-widest text-xs underline underline-offset-8">Return to Explore</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-slate-100">
            <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-12 pt-10 sm:pt-16 pb-24 sm:pb-32 animate-in fade-in duration-1000">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to stays</span>
                </button>

                {/* Listing Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-4">
                            {listing.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-1.5">
                                <Star size={16} className="text-blue-400 fill-current" />
                                <span className="font-bold">{listing.rating ? Number(listing.rating).toFixed(1) : "NEW"}</span>
                                <span className="text-slate-500 text-sm italic underline underline-offset-4 cursor-pointer hover:text-white transition-colors">{listing.review_count || 0} Review Echoes</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                                <MapPin size={16} className="text-blue-500" />
                                <span className="font-black uppercase tracking-widest text-xs underline underline-offset-4 cursor-pointer">{listing.district_slug || "Across Nepal"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => setIsQrOpen(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-500/20 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition-all text-xs font-black uppercase tracking-widest" title="Send to Phone / View QR">
                            <QrCode size={16} /> Send to Phone
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest">
                            <Share2 size={16} /> Share
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest">
                            <Heart size={16} /> Save
                        </button>
                    </div>
                </div>

                {/* Hero Gallery */}
                <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-4 h-auto lg:h-[600px] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl mb-12 sm:mb-16 group/gallery">
                    <div className="col-span-1 lg:col-span-2 row-span-1 lg:row-span-2 relative overflow-hidden bg-slate-800 min-h-[280px] sm:min-h-[360px] lg:min-h-0">
                        {galleryImages[0] ? (
                            <img src={galleryImages[0]} alt={listing.title} className="w-full h-full object-cover group-hover/gallery:scale-105 transition-transform duration-1000" />
                        ) : (
                            <div className="w-full h-full grid place-items-center text-slate-600 font-black italic">FEATURE_IMAGE</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        <div className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em]">
                            {galleryImages.length} Image{galleryImages.length === 1 ? "" : "s"} Uploaded
                        </div>
                    </div>
                    {galleryImages.slice(1, 5).map((imageUrl: string, index: number) => (
                        <div
                            key={`${imageUrl}-${index}`}
                            className={`hidden lg:block col-span-1 row-span-1 bg-slate-800 border-l border-white/10 overflow-hidden ${index > 2 ? "border-t" : ""}`}
                        >
                            <img src={imageUrl} alt={`${listing.title} ${index + 2}`} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>

                {/* Content Layout */}
                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Main Content */}
                    <div className="flex-1 space-y-16">
                        {/* Summary & Tags */}
                        <section className="border-b border-white/5 pb-12">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">
                                Stay with <span className="text-blue-400">{listing.business_name}</span>
                            </h2>
                            <div className="flex gap-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                <span>2 Guests</span> • <span>1 Bedroom</span> • <span>1 Bed</span> • <span>1 Private Bath</span>
                            </div>
                            
                            <div className="mt-10 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 flex gap-6 italic">
                                <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-400 shrink-0 h-fit">
                                    <ShieldCheck size={28} />
                                </div>
                                <div className="space-y-1 text-sm">
                                    <p className="text-white font-black">Echoes Verified Property</p>
                                    <p className="text-slate-500 font-medium leading-relaxed">This property has been manually verified by our local guides to ensure authentic Himalayan hospitality and safety compliance.</p>
                                </div>
                            </div>
                        </section>

                        {/* Description */}
                        <section className="border-b border-white/5 pb-12">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8">Narrative Detail</h3>
                            <p className="text-xl text-slate-200 font-medium leading-[1.8] italic">
                                {listing.description}
                            </p>
                        </section>

                        {/* Amenities */}
                        <section className="border-b border-white/5 pb-12">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-8">What this stay echoes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6">
                                {(listing.amenities?.length > 0 ? listing.amenities : ["Local Hospitality", "Authentic Experience"]).map((label: string, i: number) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="p-3 rounded-xl bg-white/5 text-slate-400 group-hover:text-blue-400 transition-colors">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <span className="text-slate-300 font-bold tracking-wide italic">{label}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-10 px-8 py-4 rounded-2xl border border-white/10 hover:border-white/30 transition-all text-xs font-black uppercase tracking-widest bg-transparent">Show all 32 amenities</button>
                        </section>

                        {/* Stories from this Place */}
                        <section>
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-2">Social Proof</h3>
                                    <h4 className="text-4xl font-black text-white italic uppercase tracking-tighter">Traveler Echoes</h4>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center gap-3">
                                    <MessageCircle size={24} />
                                    <span className="font-black text-xl">{relatedStories.length}</span>
                                </div>
                            </div>

                            <div className="grid gap-8">
                                {relatedStories.length > 0 ? (
                                    relatedStories.slice(0, 3).map((story) => (
                                        <StoryCard 
                                            key={story.id} 
                                            story={story} 
                                            onLike={() => {}} 
                                            onDelete={() => {}} 
                                            onToggleComments={() => {}} 
                                            commentsOpen={false} 
                                            commentDraft="" 
                                            setCommentDraft={() => {}} 
                                            onPostComment={() => {}} 
                                            comments={[]} 
                                            loadingComments={false} 
                                            isOwner={false} 
                                        />
                                    ))
                                ) : (
                                    <div className="py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem] text-center italic text-slate-500">
                                        No traveler echoes found for this district yet. Be the first to share your journey!
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Booking Panel Sticky Side */}
                    <aside className="w-full lg:w-[400px] shrink-0">
                        <div className="lg:sticky lg:top-32 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] bg-slate-900 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-t-white/20">
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-1">
                                    <span className="text-3xl font-black text-white italic">{listing.price || "Contact"}</span>
                                    {listing.price && <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1"> / Experience</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-blue-400 fill-current" />
                                    <span className="text-sm font-black text-white">{listing.rating ? Number(listing.rating).toFixed(1) : "N"}</span>
                                </div>
                            </div>

                            {bookingSuccess ? (
                                <div className="py-12 text-center animate-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic uppercase mb-2">Sync Successful!</h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Your journey request is locked. The vendor will echo back soon via email.</p>
                                    <button onClick={() => setBookingSuccess(false)} className="mt-8 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] underline underline-offset-8">Book another echo</button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-8">
                                        <div className="grid grid-cols-2 bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden">
                                            <div className="p-5 border-r border-white/10 hover:bg-white/5 transition-all">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Check-in</div>
                                                <input 
                                                    type="date" 
                                                    value={bookingForm.travel_date}
                                                    min={todayString}
                                                    onChange={(e) => setBookingForm({...bookingForm, travel_date: e.target.value})}
                                                    className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none w-full [color-scheme:dark]" 
                                                />
                                            </div>
                                            <div className="p-5 hover:bg-white/5 transition-all">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Guests</div>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    value={bookingForm.people_count || ""}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        setBookingForm({...bookingForm, people_count: isNaN(val) ? 0 : val});
                                                    }}
                                                    className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none w-full" 
                                                />
                                            </div>
                                            <div className="col-span-2 p-5 border-t border-white/10 hover:bg-white/5 transition-all">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Full Name *</div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter your name"
                                                    value={bookingForm.contact_name}
                                                    onChange={(e) => setBookingForm({...bookingForm, contact_name: e.target.value})}
                                                    className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none w-full placeholder:text-slate-700" 
                                                />
                                            </div>
                                            <div className="col-span-2 p-5 border-t border-white/10 hover:bg-white/5 transition-all">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Contact Phone *</div>
                                                <input 
                                                    type="tel" 
                                                    placeholder="+977 98..."
                                                    value={bookingForm.contact_phone}
                                                    onChange={(e) => setBookingForm({...bookingForm, contact_phone: e.target.value})}
                                                    className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none w-full placeholder:text-slate-700" 
                                                />
                                            </div>
                                            <div className="col-span-2 p-5 border-t border-white/10 hover:bg-white/5 transition-all">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Journey Email *</div>
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="email" 
                                                        placeholder="email@example.com"
                                                        value={bookingForm.contact_email}
                                                        onChange={(e) => setBookingForm({...bookingForm, contact_email: e.target.value})}
                                                        disabled={isEmailVerified}
                                                        className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none flex-1 placeholder:text-slate-700 disabled:opacity-50" 
                                                    />
                                                    {!isEmailVerified && (
                                                        <button 
                                                            onClick={handleSendOtp}
                                                            disabled={sendingOtp || !bookingForm.contact_email}
                                                            className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors disabled:opacity-30"
                                                        >
                                                            {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Verify"}
                                                        </button>
                                                    )}
                                                    {isEmailVerified && <Check size={16} className="text-emerald-500" />}
                                                </div>
                                            </div>

                                            {otpSent && !isEmailVerified && (
                                                <div className="col-span-2 p-5 border-t border-blue-500/30 bg-blue-500/5 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Enter code sent to email</div>
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="000000"
                                                            maxLength={6}
                                                            value={otpValue}
                                                            onChange={(e) => setOtpValue(e.target.value)}
                                                            className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none flex-1 placeholder:text-slate-800 tracking-[0.5em]" 
                                                        />
                                                        <button 
                                                            onClick={handleVerifyOtp}
                                                            disabled={verifyingOtp || otpValue.length < 6}
                                                            className="text-[9px] font-black uppercase tracking-widest text-white bg-blue-600 px-3 py-1 rounded-lg disabled:opacity-30"
                                                        >
                                                            {verifyingOtp ? "..." : "Verify"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {otpStatus && (
                                        <div className={`mb-6 text-[10px] font-bold uppercase tracking-widest italic ${otpStatus.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {otpStatus.msg}
                                        </div>
                                    )}

                                    {bookingError && (
                                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold leading-relaxed">
                                            {bookingError}
                                        </div>
                                    )}

                                    <button 
                                        onClick={submitBooking}
                                        disabled={submittingBooking || !isEmailVerified}
                                        className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all active:scale-[0.98] mb-6 disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {submittingBooking && <Loader2 size={18} className="animate-spin" />}
                                            <span>{isEmailVerified ? "Reserve Experience" : "Verify Email to Book"}</span>
                                        </div>
                                    </button>

                                    <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-10">Secure Journey Sync via Echoes</p>

                                    <div className="space-y-6">
                                        <div className="flex justify-between text-slate-400 text-sm italic font-medium">
                                            <span className="underline underline-offset-4 cursor-help">Local Tax</span>
                                            <span>Included</span>
                                        </div>
                                        <div className="pt-6 border-t border-white/10 flex justify-between font-black text-white uppercase tracking-widest">
                                            <span>Total Echo</span>
                                            <span className="italic">{listing.price || "TBD"}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="mt-12 flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                <div className="w-12 h-12 rounded-full border border-blue-500/30 overflow-hidden bg-slate-800 shrink-0">
                                   {listing.vendor_image ? <img src={listing.vendor_image} className="w-full h-full object-cover" /> : null}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Echo Verified Host</p>
                                    <p className="text-xs font-black text-white tracking-widest italic">{listing.business_name}</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Send to Phone QR Modal */}
            {isQrOpen && (
                <div className="fixed inset-0 z-[120] grid place-items-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0a0f1d] border border-white/10 rounded-[3rem] w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h3 className="text-lg font-black text-white italic">Send to Phone</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Scan to open on your mobile</p>
                            </div>
                            <button onClick={() => setIsQrOpen(false)} className="p-3 hover:bg-white/10 text-slate-400 rounded-2xl transition-all"><X size={20} /></button>
                        </div>
                        
                        <div className="p-8 flex flex-col items-center text-center space-y-6">
                            <div className="bg-white p-6 rounded-[2rem] shadow-inner shadow-black/40 border border-white/20">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`} 
                                    alt="Listing QR Code"
                                    className="w-48 h-48 block"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <h4 className="text-md font-black text-white italic uppercase">{listing.title}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider max-w-[240px] leading-relaxed">
                                    Take this stay/guide listing with you on the trail! Scan to save details offline.
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => setIsQrOpen(false)}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
