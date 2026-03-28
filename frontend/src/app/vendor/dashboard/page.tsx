"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Briefcase, 
    MapPin, 
    Plus, 
    Edit2, 
    Trash2, 
    CalendarCheck, 
    User, 
    Phone, 
    Mail, 
    X, 
    Check, 
    AlertCircle,
    LayoutDashboard
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function VendorDashboard() {
    const router = useRouter();
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("listings"); // 'listings', 'bookings', 'profile'
    
    // Data states
    const [listings, setListings] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    
    // Form data states
    const [districts, setDistricts] = useState<any[]>([]);
    const [destinations, setDestinations] = useState<any[]>([]);
    const [treks, setTreks] = useState<any[]>([]);

    // Modal states
    const [isListingModalOpen, setIsListingModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<any>(null);
    const [listingForm, setListingForm] = useState({
        title: "",
        listing_type: "Hotel",
        district_slug: "",
        destination_id: "",
        trek_id: "",
        description: "",
        price: "",
        is_active: true
    });
    const [listingImage, setListingImage] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            
            // Fetch Profile
            const profileRes = await fetch(`${API_BASE}/api/vendors/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (!profileRes.ok) {
                // If not applied, redirect
                router.push("/vendor/apply");
                return;
            }
            const profileData = await profileRes.json();
            setVendor(profileData.vendor);

            // Fetch Listings
            const listingsRes = await fetch(`${API_BASE}/api/vendors/listings`, { headers: { Authorization: `Bearer ${token}` } });
            if (listingsRes.ok) {
                const listData = await listingsRes.json();
                setListings(listData.listings || []);
            }

            // Fetch Bookings
            const bookingsRes = await fetch(`${API_BASE}/api/bookings/vendor`, { headers: { Authorization: `Bearer ${token}` } });
            if (bookingsRes.ok) {
                const bookData = await bookingsRes.json();
                setBookings(bookData.bookings || []);
            }

            // Fetch Reference Data (for dropdowns)
            const [distRes, destRes, trekRes] = await Promise.all([
                fetch(`${API_BASE}/api/tourism/districts`),
                fetch(`${API_BASE}/api/tourism/destinations`),
                fetch(`${API_BASE}/api/tourism/treks`)
            ]);
            
            if (distRes.ok) setDistricts((await distRes.json()).districts || []);
            if (destRes.ok) setDestinations((await destRes.json()).destinations || []);
            if (trekRes.ok) setTreks((await trekRes.json()).treks || []);

        } catch (e) {
            console.error("Dashboard error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveListing = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const data = new FormData();
            Object.entries(listingForm).forEach(([key, value]) => {
                if (value !== "") data.append(key, String(value));
            });
            if (listingImage) data.append("image", listingImage);

            const url = editingListing 
                ? `${API_BASE}/api/vendors/listings/${editingListing.id}`
                : `${API_BASE}/api/vendors/listings`;
            
            const method = editingListing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                setIsListingModalOpen(false);
                setListingImage(null);
                fetchDashboardData();
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to save listing");
            }
        } catch (e) {
            console.error("Save listing error", e);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteListing = async (id: number) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/vendors/listings/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const handleUpdateBookingStatus = async (id: number, status: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchDashboardData();
            }
        } catch (e) {
            console.error("Status update failed", e);
        }
    };

    const openModalForNew = () => {
        setEditingListing(null);
        setListingForm({
            title: "",
            listing_type: "Hotel",
            district_slug: "",
            destination_id: "",
            trek_id: "",
            description: "",
            price: "",
            is_active: true
        });
        setListingImage(null);
        setIsListingModalOpen(true);
    };

    const openModalForEdit = (listing: any) => {
        setEditingListing(listing);
        setListingForm({
            title: listing.title || "",
            listing_type: listing.listing_type || "Hotel",
            district_slug: listing.district_slug || "",
            destination_id: listing.destination_id || "",
            trek_id: listing.trek_id || "",
            description: listing.description || "",
            price: listing.price || "",
            is_active: listing.is_active
        });
        setListingImage(null);
        setIsListingModalOpen(true);
    };

    if (loading && !vendor) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-slate-950">
                <div className="h-12 w-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!vendor) return null; // Or some fallback

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 bg-slate-950">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Dashboard Header */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
                    
                    {vendor.image_url ? (
                        <img src={vendor.image_url} alt={vendor.business_name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-xl" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-500/10 text-blue-400 border-4 border-slate-800 flex items-center justify-center shadow-xl">
                            <Briefcase size={32} />
                        </div>
                    )}
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-white tracking-tight">{vendor.business_name}</h1>
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border mx-auto md:mx-0
                                ${vendor.verification_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                    vendor.verification_status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                    'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                            `}>
                                {vendor.verification_status}
                            </span>
                        </div>
                        <p className="text-slate-400 max-w-2xl">{vendor.description}</p>
                    </div>

                    <div className="flex gap-4 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-6 w-full md:w-auto overflow-x-auto no-scrollbar justify-center md:justify-start">
                        <button onClick={() => setActiveTab("listings")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[100px] transition-all hover:bg-white/5 ${activeTab === 'listings' ? 'bg-white/5 border border-white/10 shadow-lg' : 'border border-transparent'}`}>
                            <LayoutDashboard size={20} className={activeTab === 'listings' ? 'text-blue-400' : 'text-slate-500'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'listings' ? 'text-white' : 'text-slate-500'}`}>Listings</span>
                        </button>
                        <button onClick={() => setActiveTab("bookings")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[100px] transition-all hover:bg-white/5 ${activeTab === 'bookings' ? 'bg-white/5 border border-white/10 shadow-lg' : 'border border-transparent'}`}>
                            <CalendarCheck size={20} className={activeTab === 'bookings' ? 'text-blue-400' : 'text-slate-500'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'bookings' ? 'text-white' : 'text-slate-500'}`}>Bookings</span>
                        </button>
                        <button onClick={() => setActiveTab("profile")} className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[100px] transition-all hover:bg-white/5 ${activeTab === 'profile' ? 'bg-white/5 border border-white/10 shadow-lg' : 'border border-transparent'}`}>
                            <User size={20} className={activeTab === 'profile' ? 'text-blue-400' : 'text-slate-500'} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'profile' ? 'text-white' : 'text-slate-500'}`}>Profile</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* LISTINGS TAB */}
                    {activeTab === "listings" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white tracking-tight">Your Services & Inventory</h3>
                                {vendor.verification_status === 'approved' ? (
                                    <button onClick={openModalForNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20">
                                        <Plus size={16} /> Add Listing
                                    </button>
                                ) : (
                                    <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle size={16} /> Approval Required
                                    </div>
                                )}
                            </div>

                            {listings.length === 0 ? (
                                <div className="text-center py-20 bg-slate-900/40 border border-dashed border-white/10 rounded-3xl">
                                    <Briefcase size={32} className="mx-auto text-slate-500 mb-4" />
                                    <h4 className="text-lg font-bold text-white mb-2">No Listings Yet</h4>
                                    <p className="text-slate-400 text-sm">Create your first service listing to start receiving booking requests.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {listings.map(listing => (
                                        <div key={listing.id} className="bg-slate-900/60 border border-white/10 rounded-[2rem] overflow-hidden group hover:border-blue-500/30 transition-all">
                                            <div className="h-48 relative overflow-hidden bg-slate-800">
                                                {listing.image_url ? (
                                                    <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
                                                )}
                                                <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest flex gap-2 border border-white/10 shadow-sm text-white">
                                                    {listing.listing_type}
                                                </div>
                                                {!listing.is_active && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-red-500 font-black uppercase tracking-widest border border-red-500/50 rounded-[2rem]">
                                                        Inactive
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6">
                                                <h4 className="text-xl font-black text-white mb-1 truncate">{listing.title}</h4>
                                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-3">{listing.price}</p>
                                                
                                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-6 h-10">{listing.description}</p>
                                                
                                                <div className="flex gap-2">
                                                    <button onClick={() => openModalForEdit(listing)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors border border-white/10">
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteListing(listing.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* BOOKINGS TAB */}
                    {activeTab === "bookings" && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white tracking-tight mb-6">Booking Requests</h3>
                            
                            {bookings.length === 0 ? (
                                <div className="text-center py-20 bg-slate-900/40 border border-dashed border-white/10 rounded-3xl">
                                    <CalendarCheck size={32} className="mx-auto text-slate-500 mb-4" />
                                    <h4 className="text-lg font-bold text-white mb-2">No Bookings Yet</h4>
                                    <p className="text-slate-400 text-sm">When users request your services, they will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map(book => (
                                        <div key={book.id} className="bg-slate-900/60 border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                                            <div className="flex-1 space-y-4 w-full">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-black text-white">{book.listing_title}</h4>
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Requested Date: {new Date(book.travel_date).toLocaleDateString()}</div>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest border
                                                        ${book.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                        book.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                                        book.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'}
                                                    `}>
                                                        {book.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Customer</div>
                                                        <div className="text-sm font-medium text-white">{book.contact_name}</div>
                                                        <div className="text-xs text-slate-400 mt-1">{book.contact_email}</div>
                                                        <div className="text-xs text-slate-400 mt-0.5">{book.contact_phone}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Details</div>
                                                        <div className="text-sm font-medium text-white">{book.people_count} People</div>
                                                        <div className="text-sm text-slate-400 mt-1 italic border-l-2 border-white/20 pl-2">"{book.message || "No message."}"</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex md:flex-col gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                                                {book.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleUpdateBookingStatus(book.id, 'confirmed')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 md:w-40 min-w-[140px]">
                                                            <Check size={14} /> Confirm
                                                        </button>
                                                        <button onClick={() => handleUpdateBookingStatus(book.id, 'rejected')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-xs font-black uppercase tracking-widest rounded-xl transition-all md:w-40 min-w-[140px]">
                                                            <X size={14} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {book.status === 'confirmed' && (
                                                    <button onClick={() => handleUpdateBookingStatus(book.id, 'completed')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/20 md:w-40 min-w-[140px]">
                                                        Mark Completed
                                                    </button>
                                                )}
                                                {(book.status === 'rejected' || book.status === 'completed') && (
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold text-center w-full md:w-40 py-2">
                                                        No Actions Available
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <div className="max-w-2xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                            <h3 className="text-xl font-black text-white tracking-tight border-b border-white/5 pb-4">Business Credentials</h3>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Email</div>
                                    <div className="text-sm font-medium text-white flex items-center gap-2"><Mail size={14}/> {vendor.email}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Phone</div>
                                    <div className="text-sm font-medium text-white flex items-center gap-2"><Phone size={14}/> {vendor.phone}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Location</div>
                                    <div className="text-sm font-medium text-white flex items-center gap-2"><MapPin size={14}/> {vendor.district_slug || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Type</div>
                                    <div className="text-sm font-medium text-white flex items-center gap-2"><Briefcase size={14}/> {vendor.vendor_type}</div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-6">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">PAN Number</div>
                                    <div className="text-sm font-medium text-white font-mono">{vendor.pan_number || 'N/A'}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Registration</div>
                                    <div className="text-sm font-medium text-white font-mono">{vendor.registration_number || 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Add/Edit Listing */}
            {isListingModalOpen && (
                <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
                            <h3 className="text-xl font-black text-white">{editingListing ? "Edit Listing" : "New Listing"}</h3>
                            <button onClick={() => setIsListingModalOpen(false)} className="p-2 hover:bg-white/10 text-slate-400 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveListing} className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Listing Title</label>
                                    <input required type="text" value={listingForm.title} onChange={(e) => setListingForm({...listingForm, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" placeholder="e.g. Deluxe Room with Mountain View" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Listing Type</label>
                                        <select required value={listingForm.listing_type} onChange={(e) => setListingForm({...listingForm, listing_type: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                                            {["Hotel", "Homestay", "Guide", "Trekking Agency", "Transport", "Local Experience"].map(t => (
                                                <option key={t} value={t} className="bg-slate-900">{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Price (Optional)</label>
                                        <input type="text" value={listingForm.price} onChange={(e) => setListingForm({...listingForm, price: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50" placeholder="Rs 5000 / night" />
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Link to Locations</h4>
                                    <p className="text-xs text-slate-500">Choosing a specific destination or trek will show your service there.</p>
                                    
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">District</label>
                                        <select value={listingForm.district_slug} onChange={(e) => setListingForm({...listingForm, district_slug: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                                            <option value="" className="bg-slate-900">Select District...</option>
                                            {districts.map(d => <option key={d.id} value={d.slug} className="bg-slate-900">{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Destination (Optional)</label>
                                            <select value={listingForm.destination_id} onChange={(e) => setListingForm({...listingForm, destination_id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                                                <option value="" className="bg-slate-900">None</option>
                                                {destinations.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Trek (Optional)</label>
                                            <select value={listingForm.trek_id} onChange={(e) => setListingForm({...listingForm, trek_id: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer">
                                                <option value="" className="bg-slate-900">None</option>
                                                {treks.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Description</label>
                                    <textarea required value={listingForm.description} onChange={(e) => setListingForm({...listingForm, description: e.target.value})} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none" placeholder="Provide details about what you offer..." />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Listing Image</label>
                                    <input type="file" accept="image/*" onChange={(e) => setListingImage(e.target.files?.[0] || null)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 file:bg-blue-500/20 file:text-blue-400 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-black file:uppercase file:text-[10px] file:cursor-pointer" />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input type="checkbox" id="isActive" checked={listingForm.is_active} onChange={(e) => setListingForm({...listingForm, is_active: e.target.checked})} className="w-4 h-4 rounded border-white/10 bg-black/40 accent-blue-500 cursor-pointer" />
                                    <label htmlFor="isActive" className="text-sm text-slate-300 font-medium cursor-pointer">Listing is Active & Visible</label>
                                </div>
                            </div>
                            
                            <div className="pt-6 border-t border-white/10">
                                <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 text-xs">
                                    {saving ? "Saving..." : "Save Listing"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
