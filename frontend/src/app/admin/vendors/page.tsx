"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Eye, FileText, Briefcase, MapPin, X, AlertOctagon } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminVendors() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending', 'approved', 'rejected'
    
    // Modal states
    const [viewVendor, setViewVendor] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setVendors(data.vendors || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Are you sure you want to approve this vendor? They will be able to post public listings.")) return;
        
        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/vendors/${id}/approve`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchVendors();
                setViewVendor(null);
            }
        } catch (e) {
            console.error("Approval failed", e);
        }
    };

    const handleReject = async (id: number) => {
        if (!rejectReason.trim()) {
            alert("Please provide a rejection reason.");
            return;
        }

        try {
            const token = localStorage.getItem("admin_token");
            const res = await fetch(`${API_BASE}/api/admin/vendors/${id}/reject`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ reason: rejectReason })
            });
            if (res.ok) {
                fetchVendors();
                setViewVendor(null);
                setIsRejecting(false);
                setRejectReason("");
            }
        } catch (e) {
            console.error("Rejection failed", e);
        }
    };

    const filteredVendors = vendors.filter(v => {
        const matchesSearch = v.business_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              v.pan_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              v.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || v.verification_status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Vendor Management</h2>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Verify Local Businesses</p>
                </div>

                <div className="flex flex-1 max-w-2xl gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or PAN..." 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all text-slate-300 font-bold appearance-none cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all" className="bg-slate-900">All Statuses</option>
                        <option value="pending" className="bg-slate-900">Pending</option>
                        <option value="approved" className="bg-slate-900">Approved</option>
                        <option value="rejected" className="bg-slate-900">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Business</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Type / District</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Contact</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 animate-pulse font-bold tracking-widest uppercase text-xs">Loading vendors...</td>
                                </tr>
                            ) : filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 font-bold tracking-widest uppercase text-xs">No vendors found.</td>
                                </tr>
                            ) : (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {vendor.image_url ? (
                                                    <img src={vendor.image_url} alt={vendor.business_name} className="w-10 h-10 object-cover rounded-lg border border-white/10" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg flex items-center justify-center">
                                                        <Briefcase size={16} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-white text-sm">{vendor.business_name}</div>
                                                    <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase">PAN: {vendor.pan_number || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-slate-300">{vendor.vendor_type}</div>
                                            <div className="text-[10px] text-slate-500 font-black tracking-widest uppercase flex items-center gap-1 mt-1">
                                                <MapPin size={10} /> {vendor.district_slug || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-300">{vendor.email}</div>
                                            <div className="text-[10px] text-slate-500 font-medium tracking-widest uppercase mt-1">{vendor.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border
                                                ${vendor.verification_status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                  vendor.verification_status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                                            >
                                                {vendor.verification_status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => {
                                                    setViewVendor(vendor);
                                                    setIsRejecting(false);
                                                }}
                                                className="p-2 bg-white/5 hover:bg-white/10 text-blue-400 hover:text-blue-300 rounded-lg border border-white/10 transition-colors shadow-sm"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View/Review Vendor Modal */}
            {viewVendor && (
                <div className="fixed inset-0 z-[100] grid place-items-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
                            <h3 className="text-xl font-black text-white tracking-tight">Review Application</h3>
                            <button onClick={() => setViewVendor(null)} className="p-2 hover:bg-white/10 text-slate-400 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                            <div className="flex gap-6 items-start">
                                {viewVendor.image_url ? (
                                    <img src={viewVendor.image_url} alt="Business" className="w-24 h-24 rounded-2xl object-cover border border-white/10" />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                                        <Briefcase size={32} />
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-2xl font-black text-white">{viewVendor.business_name}</h4>
                                    <div className="flex gap-3 text-sm text-slate-400 font-medium mt-2">
                                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10"><Briefcase size={14} /> {viewVendor.vendor_type}</span>
                                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/10"><MapPin size={14} /> {viewVendor.district_slug || 'Unknown District'}</span>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-300 leading-relaxed border-l-2 border-blue-500 pl-4 bg-blue-500/5 p-4 rounded-r-xl">
                                        {viewVendor.description || "No description provided."}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                <div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Owner Contact</div>
                                    <div className="text-sm text-white">{viewVendor.owner_name}</div>
                                    <div className="text-sm text-slate-400">{viewVendor.owner_email} | {viewVendor.phone}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Business Credentials</div>
                                    <div className="text-sm text-white font-mono">PAN: {viewVendor.pan_number || 'N/A'}</div>
                                    <div className="text-sm text-slate-400 font-mono">REG: {viewVendor.registration_number || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-sm font-black text-white uppercase tracking-widest">Verification Document</h5>
                                {viewVendor.document_url ? (
                                    <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/5">
                                        {viewVendor.document_url.endsWith('.pdf') ? (
                                            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-4">
                                                <FileText size={48} className="text-blue-400" />
                                                <a href={viewVendor.document_url} target="_blank" rel="noreferrer" className="px-6 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold border border-blue-500/20 hover:bg-blue-500/30 transition-colors">
                                                    View PDF Document
                                                </a>
                                            </div>
                                        ) : (
                                            <img src={viewVendor.document_url} alt="Verification Doc" className="w-full max-h-[40vh] object-contain bg-black/50" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-2xl bg-white/[0.02] text-sm">
                                        No verification document uploaded.
                                    </div>
                                )}
                            </div>

                            {viewVendor.verification_status === 'rejected' && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                                    <AlertOctagon className="text-red-500 shrink-0 mt-0.5" size={18} />
                                    <div>
                                        <h6 className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Rejection Reason</h6>
                                        <p className="text-sm text-red-400/80">{viewVendor.rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                            {isRejecting && (
                                <div className="p-6 border border-amber-500/30 bg-amber-500/5 rounded-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                    <label className="text-xs font-black uppercase tracking-widest text-amber-500 block">Reason for Rejection</label>
                                    <textarea 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-amber-500/50 focus:outline-none resize-none"
                                        rows={3}
                                        placeholder="Explain why the application is denied..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                    <div className="flex gap-3 justify-end">
                                        <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                        <button onClick={() => handleReject(viewVendor.id)} className="px-6 py-2 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors">Submit Rejection</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex justify-end gap-4 shrink-0">
                            {viewVendor.verification_status !== 'approved' && !isRejecting && (
                                <button 
                                    onClick={() => handleApprove(viewVendor.id)}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-widest text-xs justify-center rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                                >
                                    <CheckCircle size={16} /> Approve Vendor
                                </button>
                            )}
                            {viewVendor.verification_status !== 'rejected' && !isRejecting && (
                                <button 
                                    onClick={() => setIsRejecting(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 text-slate-300 font-black uppercase tracking-widest text-xs justify-center rounded-xl transition-all"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
