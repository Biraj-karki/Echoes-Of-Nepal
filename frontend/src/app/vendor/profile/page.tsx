"use client";

import { useVendor } from "../layout";
import { 
    Briefcase, 
    Mail, 
    Phone, 
    MapPin, 
    FileText, 
    ShieldCheck, 
    ExternalLink, 
    Info, 
    Building2,
    Hash,
    Users,
    Image as ImageIcon
} from "lucide-react";

export default function VendorProfilePage() {
    const { vendor, loading } = useVendor();

    if (loading || !vendor) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Business Hero */}
            <div className="relative h-64 w-full rounded-[3.5rem] overflow-hidden group shadow-2xl shadow-blue-500/5">
                {vendor.image_url ? (
                    <img src={vendor.image_url} alt={vendor.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                        <Building2 size={64} className="text-white/20" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
                <div className="absolute bottom-8 left-10">
                    <h1 className="text-4xl font-black text-white italic tracking-tight mb-2 uppercase">{vendor.business_name}</h1>
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">{vendor.vendor_type}</span>
                        <p className="text-sm font-bold text-slate-300 flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> {vendor.district_slug || "Global Nepal"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Identity */}
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-10 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                           <Info size={16} className="text-blue-500" /> Business Narrative
                        </h3>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed italic border-l-2 border-blue-500/30 pl-8 bg-blue-500/5 py-8 rounded-r-[2rem]">
                            "{vendor.description || "No public narrative provided. Update your bio to build trust with potential customers."}"
                        </p>
                    </section>

                    <section className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                           <ShieldCheck size={16} className="text-emerald-500" /> Compliance & Verification
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:border-emerald-500/20 transition-all">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Registration Number</div>
                                <div className="text-xl font-mono text-white flex items-center gap-3"><Hash size={18} className="text-emerald-500/50" /> {vendor.registration_number || "NOT_PROVIDED"}</div>
                            </div>
                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:border-emerald-500/20 transition-all">
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Taxpayer Identification (PAN)</div>
                                <div className="text-xl font-mono text-white flex items-center gap-3"><FileText size={18} className="text-emerald-500/50" /> {vendor.pan_number || "NOT_PROVIDED"}</div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Official Documentation</h4>
                            {vendor.document_url ? (
                                <div className="group relative rounded-[2rem] overflow-hidden border border-white/10 bg-black/40 hover:border-blue-500/30 transition-all">
                                    <div className="h-48 grid place-items-center bg-slate-800">
                                        {vendor.document_url.toLowerCase().endsWith('.pdf') ? (
                                            <div className="text-center space-y-4">
                                                <FileText size={48} className="mx-auto text-blue-500/40" />
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified PDF Document</p>
                                            </div>
                                        ) : (
                                            <img src={vendor.document_url} alt="Compliance Doc" className="w-full h-full object-cover group-hover:blur-sm transition-all" />
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                                        <a 
                                            href={vendor.document_url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="px-8 py-3 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 hover:scale-105 transition-all"
                                        >
                                            Inspect Document <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                                    <FileText size={40} className="mx-auto text-slate-700 mb-4" />
                                    <p className="text-sm text-slate-500 font-medium italic">No compliance documents found in our archives.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar / Contact Info */}
                <div className="space-y-8">
                    <section className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-8 space-y-8">
                        <h4 className="text-xs font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                           <Users size={16} className="text-blue-500" /> Direct Contact
                        </h4>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 shrink-0">
                                    <Mail size={16} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Business Email</p>
                                    <p className="text-sm font-bold text-white break-all">{vendor.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 shrink-0">
                                    <Phone size={16} className="text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Direct Phone</p>
                                    <p className="text-sm font-bold text-white">{vendor.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all">
                                Request Profile Update
                            </button>
                        </div>
                    </section>

                    <div className="bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 text-center space-y-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl grid place-items-center mx-auto shadow-xl shadow-blue-600/20">
                            <ImageIcon size={24} />
                        </div>
                        <h5 className="text-lg font-black text-white tracking-tight italic">Global Identity</h5>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">Your business is currently featured in the <span className="text-blue-400 font-bold">{vendor.district_slug || "All Nepal"}</span> regional listings.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
