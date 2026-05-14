"use client";

import { useState, useEffect } from "react";
import { useVendor } from "../layout";
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Search, 
    Filter, 
    MapPin, 
    Eye, 
    EyeOff,
    LayoutGrid,
    List,
    X,
    Upload,
    Briefcase
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const AMENITY_OPTIONS = [
    "Wifi", "Breakfast", "Parking", "Hot Shower", "Mountain View", 
    "Guide Service", "Trekking Gear", "Pick-up Service", "Eco Friendly"
];

export default function VendorListingsPage() {
    const { vendor, loading: vendorLoading } = useVendor();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    
    // Reference data
    const [districts, setDistricts] = useState<any[]>([]);
    const [destinations, setDestinations] = useState<any[]>([]);
    const [treks, setTreks] = useState<any[]>([]);

    const [form, setForm] = useState({
        title: "",
        listing_type: "Hotel",
        district_slug: "",
        destination_id: "",
        trek_id: "",
        description: "",
        price: "",
        is_active: true,
        rating: 4.5,
        amenities: [] as string[]
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        if (!vendor) return;
        fetchData();
    }, [vendor]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const [listRes, distRes, destRes, trekRes] = await Promise.all([
                fetch(`${API_BASE}/api/vendors/listings`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/api/tourism/districts`),
                fetch(`${API_BASE}/api/tourism/destinations`),
                fetch(`${API_BASE}/api/tourism/treks`)
            ]);

            if (listRes.ok) setListings((await listRes.json()).listings || []);
            if (distRes.ok) setDistricts((await distRes.json()).districts || []);
            if (destRes.ok) setDestinations((await destRes.json()).destinations || []);
            if (trekRes.ok) setTreks((await trekRes.json()).treks || []);
        } catch (e) {
            console.error("Failed to fetch listings data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== "") {
                    const val = (typeof value === 'object' && value !== null) 
                        ? JSON.stringify(value) 
                        : String(value);
                    formData.append(key, val);
                }
            });
            if (imageFile) formData.append("image", imageFile);

            const url = editingListing 
                ? `${API_BASE}/api/vendors/listings/${editingListing.id}` 
                : `${API_BASE}/api/vendors/listings`;
            
            const res = await fetch(url, {
                method: editingListing ? "PUT" : "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
                setEditingListing(null);
                setImageFile(null);
            } else {
                const err = await res.json();
                alert(err.error || "Save failed");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/vendors/listings/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const openCreate = () => {
        setEditingListing(null);
        setForm({
            title: "",
            listing_type: "Hotel",
            district_slug: vendor?.district_slug || "",
            destination_id: "",
            trek_id: "",
            description: "",
            price: "",
            is_active: true,
            rating: 4.5,
            amenities: []
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEdit = (listing: any) => {
        setEditingListing(listing);
        setForm({
            title: listing.title || "",
            listing_type: listing.listing_type || "Hotel",
            district_slug: listing.district_slug || "",
            destination_id: listing.destination_id || "",
            trek_id: listing.trek_id || "",
            description: listing.description || "",
            price: listing.price || "",
            is_active: listing.is_active,
            rating: listing.rating || 4.5,
            amenities: Array.isArray(listing.amenities) ? listing.amenities : []
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const filteredListings = listings.filter(l => 
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.listing_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (vendorLoading || !vendor) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight leading-none">Your Services</h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-3">Manage and update your offerings</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-[#0f172a] border border-white/5 rounded-xl p-1">
                        <button 
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={openCreate}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={16} /> New Listing
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by title, type, or location..." 
                        className="w-full bg-[#0a0f1d] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-6 py-3.5 bg-[#0a0f1d] border border-white/5 rounded-2xl text-slate-400 hover:text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                    <Filter size={16} /> Filter
                </button>
            </div>

            {loading ? (
                <div className="py-32 grid place-items-center">
                    <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : filteredListings.length === 0 ? (
                <div className="text-center py-32 bg-[#0a0f1d] border border-white/5 rounded-[3rem]">
                    <div className="w-20 h-20 bg-blue-500/5 text-blue-500/30 rounded-3xl grid place-items-center mx-auto mb-6">
                        <Plus size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white italic">No listings found</h2>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">Start reaching travelers by adding your first business listing.</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredListings.map(listing => (
                        <div key={listing.id} className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-blue-500/30 transition-all shadow-2xl shadow-black/20 flex flex-col">
                            <div className="h-56 relative bg-slate-800 overflow-hidden shrink-0">
                                {listing.image_url ? (
                                    <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full grid place-items-center text-slate-600">
                                        <Plus size={32} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-white border border-white/10">{listing.listing_type}</span>
                                    {!listing.is_active && <span className="px-3 py-1 bg-red-500/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-white">Inactive</span>}
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(listing)} className="p-2 bg-white text-blue-600 rounded-lg shadow-xl hover:scale-105 transition-transform"><Edit2 size={16} /></button>
                                </div>
                            </div>
                            <div className="p-7 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-white mb-2 line-clamp-1">{listing.title}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">{listing.description}</p>
                                    
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <div className="flex items-center gap-1.5"><MapPin size={12} className="text-blue-500" /> {listing.district_slug || "Across Nepal"}</div>
                                        <div className="text-emerald-400">{listing.price || "Contact for Price"}</div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
                                    <button onClick={() => openEdit(listing)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black text-white transition-all uppercase tracking-widest">Edit Details</button>
                                    <button onClick={() => handleDelete(listing.id)} className="p-3 bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20"><Trash2 size={18} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="p-6 pl-8 text-[10px] uppercase font-black tracking-widest text-slate-500">Listing</th>
                                <th className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-500">Service Type</th>
                                <th className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-500">Location</th>
                                <th className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-500">Status</th>
                                <th className="p-6 pr-8 text-[10px] uppercase font-black tracking-widest text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredListings.map(listing => (
                                <tr key={listing.id} className="hover:bg-white/[0.01] transition-colors group">
                                    <td className="p-6 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                                                {listing.image_url ? <img src={listing.image_url} className="w-full h-full object-cover" /> : <Plus size={16} className="mx-auto mt-4 text-slate-600" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{listing.title}</div>
                                                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-[0.1em] mt-0.5">{listing.price || "Varies"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-sm text-slate-300 font-medium">{listing.listing_type}</td>
                                    <td className="p-6 text-sm text-slate-500 font-medium">/districts/{listing.district_slug || "Nepal"}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${listing.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {listing.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-6 pr-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(listing)} className="p-2 text-slate-400 hover:text-white transition-colors"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(listing.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0a0f1d] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.02]">
                            <div>
                                <h3 className="text-2xl font-black text-white italic">{editingListing ? "Edit Service" : "Elevate Your Business"}</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Provide quality details to attract more travelers</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white/10 text-slate-400 rounded-2xl transition-all"><X size={24} /></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 block">Listing Headline</label>
                                    <input required type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-medium" placeholder="Ex: Sunrise Trekking in Annapurna" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 block">Category</label>
                                        <select required value={form.listing_type} onChange={(e) => setForm({...form, listing_type: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none font-bold">
                                            {["Hotel", "Homestay", "Guide", "Trekking Agency", "Transport", "Local Experience"].map(t => (
                                                <option key={t} value={t} className="bg-slate-900">{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 block">Estimated Price</label>
                                        <input type="text" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 font-medium" placeholder="Ex: NPR 12,000 / trip" />
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-600/5 border border-white/5 rounded-[2.5rem] space-y-6">
                                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Regional Attribution</h4>
                                    
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2.5 block">Primary District</label>
                                        <select 
                                            value={form.district_slug} 
                                            onChange={(e) => setForm({...form, district_slug: e.target.value, destination_id: "", trek_id: ""})} 
                                            className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900 text-slate-500 italic">Global / Not Specified</option>
                                            {districts.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2.5 block">Affiliated Destination</label>
                                            <select value={form.destination_id} onChange={(e) => setForm({...form, destination_id: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none appearance-none">
                                                <option value="" className="bg-slate-900 text-slate-500 font-bold uppercase italic tracking-tighter">None</option>
                                                {destinations
                                                    .filter(d => !form.district_slug || d.district_id === form.district_slug)
                                                    .map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)
                                                }
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2.5 block">Affiliated Trek</label>
                                            <select value={form.trek_id} onChange={(e) => setForm({...form, trek_id: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none appearance-none">
                                                <option value="" className="bg-slate-900 text-slate-500 font-bold uppercase italic tracking-tighter">None</option>
                                                {treks
                                                    .filter(t => !form.district_slug || t.district_id === form.district_slug)
                                                    .map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>)
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2.5 block">Detailed Narrative</label>
                                    <textarea required value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={4} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 resize-none font-medium leading-relaxed" placeholder="Describe your service in detail. Focus on what makes it unique..." />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Amenities</label>
                                        <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">{form.amenities.length} Selected</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {AMENITY_OPTIONS.map(a => {
                                            const isSelected = form.amenities.includes(a);
                                            return (
                                                <button
                                                    key={a}
                                                    type="button"
                                                    onClick={() => {
                                                        const next = isSelected 
                                                            ? form.amenities.filter(x => x !== a)
                                                            : [...form.amenities, a];
                                                        setForm({...form, amenities: next});
                                                    }}
                                                    className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        isSelected 
                                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                                                        : "bg-black/20 border-white/5 text-slate-500 hover:border-white/20"
                                                    }`}
                                                >
                                                    {a}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 block">Claimed Quality Rating (Internal)</label>
                                    <div className="flex items-center gap-4">
                                        <input 
                                            type="range" 
                                            min="1" 
                                            max="5" 
                                            step="0.1" 
                                            value={form.rating} 
                                            onChange={(e) => setForm({...form, rating: parseFloat(e.target.value)})}
                                            className="flex-1 accent-blue-600 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center font-black text-blue-400">
                                            {form.rating}
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-3 italic">This helps us categorize your service for the premium explore gallery.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Thumbnail Image</label>
                                    <div className="relative border-2 border-dashed border-white/10 rounded-[2rem] p-10 group hover:border-blue-500/30 transition-all text-center">
                                        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl grid place-items-center mx-auto group-hover:scale-110 transition-transform">
                                                <Upload size={28} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-white italic">{imageFile ? imageFile.name : "Choose an aesthetic cover"}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">JPG, PNG or WEBP up to 5MB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 py-4 px-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 bg-slate-700">
                                        <input 
                                            type="checkbox" 
                                            checked={form.is_active} 
                                            onChange={(e) => setForm({...form, is_active: e.target.checked})} 
                                            className="absolute h-5 w-5 translate-x-0 cursor-pointer opacity-0 z-20"
                                        />
                                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.is_active ? 'translate-x-5' : 'translate-x-0'}`}></span>
                                    </div>
                                    <label className="text-sm font-black text-white uppercase tracking-widest cursor-pointer">Live Visibility</label>
                                </div>
                            </div>
                            
                            <div className="pt-10 border-t border-white/5">
                                <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-2xl shadow-blue-600/20 disabled:opacity-50 text-xs active:scale-95">
                                    {saving ? "Processing Transaction..." : editingListing ? "Commit Changes" : "Publish Listing"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
