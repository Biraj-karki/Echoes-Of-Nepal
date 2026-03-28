"use client";

import { useState, useEffect } from "react";
import { Search, Edit2, X, Upload, Map, Layout, ChevronDown } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminDistricts() {
    const [districts, setDistricts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("All Provinces");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDistrict, setEditingDistrict] = useState<any>(null);
    const [formData, setFormData] = useState({
        description: "",
        highlights: "",
        province: "",
        banner_image: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const provinces = [
        "All Provinces",
        "Koshi Province",
        "Madhesh Province",
        "Bagmati Province",
        "Gandaki Province",
        "Lumbini Province",
        "Karnali Province",
        "Sudurpashchim Province"
    ];

    useEffect(() => {
        fetchDistricts();
    }, []);

    const fetchDistricts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/districts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setDistricts(data.districts || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("admin_token");
            const data = new FormData();
            data.append("description", formData.description);
            data.append("highlights", formData.highlights);
            data.append("province", formData.province);
            data.append("banner_image", formData.banner_image);
            if (imageFile) data.append("image", imageFile);

            const res = await fetch(`${API_BASE}/api/admin/districts/${editingDistrict.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                setIsModalOpen(false);
                setImageFile(null);
                fetchDistricts();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const filteredDistricts = districts.filter(d => 
        (d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedProvince === "All Provinces" || d.province === selectedProvince)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search all 77 districts..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="relative">
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                        <ChevronDown size={14} />
                    </div>
                    <select 
                        className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-slate-300 font-bold appearance-none cursor-pointer hover:bg-white/10"
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                    >
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>

                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest hidden lg:block">
                    {districts.length} Official Districts
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="h-48 bg-white/5 rounded-[2.5rem] border border-white/10 animate-pulse"></div>
                    ))
                ) : filteredDistricts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10">
                        No districts found for your search/filter.
                    </div>
                ) : filteredDistricts.map((dist) => (
                    <div key={dist.id} className="group bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-emerald-500/30 transition-all duration-500 p-6 flex flex-col gap-4 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Map size={20} />
                                </div>
                                <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest mt-3">{dist.province || "N/A"}</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setEditingDistrict(dist);
                                    setFormData({
                                        description: dist.description || "",
                                        highlights: dist.highlights || "",
                                        province: dist.province || "",
                                        banner_image: dist.banner_image || ""
                                    });
                                    setIsModalOpen(true);
                                }}
                                className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-xl"
                            >
                                <Edit2 size={16} />
                            </button>
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{dist.name}</h4>
                            <p className="text-[10px] text-slate-500 font-bold mt-1 tracking-[0.2em]">{dist.id}</p>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed h-10">
                            {dist.description || "No overview content provided yet."}
                        </p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h3 className="text-2xl font-black text-white">{editingDistrict.name}</h3>
                                <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest mt-1">{editingDistrict.province || "Assign Province"}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Province</label>
                                    <div className="relative">
                                        <select 
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                                            value={formData.province}
                                            onChange={(e) => setFormData({...formData, province: e.target.value})}
                                        >
                                            <option value="" className="bg-slate-900">Select Province</option>
                                            {provinces.slice(1).map(p => <option key={p} value={p} className="bg-slate-900">{p}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Highlights (comma separated)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50" 
                                        value={formData.highlights}
                                        onChange={(e) => setFormData({...formData, highlights: e.target.value})}
                                        placeholder="Temples, Lakes, Culture"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Overview Description</label>
                                <textarea 
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 h-32 resize-none leading-relaxed" 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Tell the story of this district..."
                                />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <Upload className="text-emerald-400" size={20} />
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-white uppercase tracking-wider">Banner Image</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Hero image for the district panel</div>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    id="dist-img" 
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                                <label htmlFor="dist-img" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-emerald-500/30 transition-all">
                                    {imageFile ? imageFile.name : "Select File"}
                                </label>
                            </div>

                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black py-4 rounded-2xl disabled:opacity-50 transition-all uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/10"
                            >
                                {saving ? "Updating..." : "Save District Content"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
