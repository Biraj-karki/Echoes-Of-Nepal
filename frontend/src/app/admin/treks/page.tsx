"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Upload, MountainSnow, Clock, MapPin } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminTreks() {
    const [treks, setTreks] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        district_id: "",
        difficulty: "Moderate",
        duration: "",
        altitude: "",
        description: "",
        featured: false,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const [trekRes, distRes] = await Promise.all([
                fetch(`${API_BASE}/api/admin/treks`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/api/admin/districts`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            const trekData = await trekRes.json();
            const distData = await distRes.json();
            if (trekRes.ok) setTreks(trekData.treks || []);
            if (distRes.ok) setDistricts(distData.districts || []);
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
            Object.entries(formData).forEach(([key, val]) => data.append(key, val.toString()));
            if (imageFile) data.append("image", imageFile);

            const url = editingId 
                ? `${API_BASE}/api/admin/treks/${editingId}` 
                : `${API_BASE}/api/admin/treks`;
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: data
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ name: "", district_id: "", difficulty: "Moderate", duration: "", altitude: "", description: "", featured: false });
                setImageFile(null);
                fetchData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/treks/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const filteredTreks = treks.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.district_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search treks or districts..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => { setEditingId(null); setIsModalOpen(true); }}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold transition-all"
                >
                    <Plus size={18} /> Add Trek
                </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400 text-[10px]">Trek Name</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400 text-[10px]">District & Difficulty</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400 text-[10px]">Duration</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400 text-[10px]">Status</th>
                            <th className="px-6 py-4 font-black uppercase tracking-wider text-slate-400 text-[10px] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-6 py-4 h-16 bg-white/[0.02]"></td>
                                </tr>
                            ))
                        ) : filteredTreks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-white/[0.01]">No treks found.</td>
                            </tr>
                        ) : (
                            filteredTreks.map((trek) => (
                                <tr key={trek.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-12 rounded-lg bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
                                                {trek.image && <img src={trek.image} alt="" className="h-full w-full object-cover" />}
                                            </div>
                                            <span className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{trek.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-300 font-semibold">{trek.district_name}</span>
                                            <span className={`text-[10px] uppercase font-black ${
                                                trek.difficulty === 'Hard' ? 'text-red-400' : 
                                                trek.difficulty === 'Moderate' ? 'text-orange-400' : 'text-emerald-400'
                                            }`}>{trek.difficulty}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                            <Clock size={14} className="text-emerald-500" />
                                            {trek.duration}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {trek.featured ? (
                                            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase border border-blue-500/20">Featured</span>
                                        ) : (
                                            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Standard</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => {
                                                    setEditingId(trek.id);
                                                    setFormData({
                                                        name: trek.name || "",
                                                        district_id: trek.district_id || "",
                                                        difficulty: trek.difficulty || "Moderate",
                                                        duration: trek.duration || "",
                                                        altitude: trek.altitude || "",
                                                        description: trek.description || "",
                                                        featured: !!trek.featured
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(trek.id)}
                                                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <h3 className="text-2xl font-black text-white">{editingId ? "Edit Trek" : "Add Trek"}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Trek Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">District</label>
                                    <select 
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                                        value={formData.district_id}
                                        onChange={(e) => setFormData({...formData, district_id: e.target.value})}
                                    >
                                        <option value="" className="bg-slate-900">Select District</option>
                                        {districts.map(d => <option key={d.id} value={d.id} className="bg-slate-900">{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Difficulty</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                                    >
                                        <option value="Easy" className="bg-slate-900">Easy</option>
                                        <option value="Moderate" className="bg-slate-900">Moderate</option>
                                        <option value="Hard" className="bg-slate-900">Hard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Duration (e.g. 5-7 days)</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50" 
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Max Altitude (e.g. 4,500m)</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50" 
                                        value={formData.altitude}
                                        onChange={(e) => setFormData({...formData, altitude: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 h-24 resize-none" 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <Upload className="text-emerald-400" size={20} />
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-white uppercase tracking-wider">Trek Image</div>
                                    <div className="text-[10px] text-slate-400 font-medium">JPG, PNG, WebP allowed</div>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    id="trek-img" 
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                                <label htmlFor="trek-img" className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-emerald-500/30 transition-all">
                                    {imageFile ? imageFile.name : "Select File"}
                                </label>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                                />
                                <div className={`w-12 h-6 rounded-full border border-white/10 transition-all relative ${formData.featured ? 'bg-emerald-500' : 'bg-white/5'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.featured ? 'left-7' : 'left-1'}`}></div>
                                </div>
                                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Featured Trek</span>
                            </label>

                            <button 
                                type="submit"
                                disabled={saving}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl disabled:opacity-50 transition-all uppercase tracking-widest text-xs"
                            >
                                {saving ? "Processing..." : editingId ? "Save Changes" : "Create Trek"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
