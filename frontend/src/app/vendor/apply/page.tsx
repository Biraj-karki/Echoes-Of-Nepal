"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  Building,
  Image as ImageIcon,
  ArrowRight
} from "lucide-react";

export default function VendorApplyPage() {
  const router = useRouter();
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    vendor_type: "",
    district_slug: "",
    description: "",
    phone: "",
    email: "",
    pan_number: "",
    registration_number: ""
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/tourism/districts`);
        const data = await res.json();
        if (res.ok) setDistricts(data.districts);
      } catch (err) {
        console.error("Failed to load districts");
      }
    };
    fetchDistricts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to apply as a vendor.");
      setLoading(false);
      return;
    }

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    if (documentFile) submitData.append("document", documentFile);
    if (imageFile) submitData.append("image", imageFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/vendors/apply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: submitData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit application");

      setSuccess(true);
      setTimeout(() => router.push("/profile"), 3000); // Redirect to profile after success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-slate-950 -z-20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-43b9e4a3ed60')] bg-cover bg-center opacity-10 -z-10 mix-blend-luminosity"></div>
        
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl max-w-lg w-full text-center shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-4">Application Submitted!</h2>
          <p className="text-slate-400 leading-relaxed mb-8">
            Thank you for applying to be an Echoes of Nepal vendor. Our team will review your documents and verify your business shortly.
          </p>
          <p className="text-sm font-bold text-blue-400 uppercase tracking-widest animate-pulse">Redirecting to profile...</p>
        </div>
      </div>
    );
  }

  const VENDOR_TYPES = ["Hotel", "Homestay", "Guide", "Trekking Agency", "Transport", "Local Experience"];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-slate-950 -z-20"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544735716-43b9e4a3ed60')] bg-cover bg-center opacity-5 -z-10 mix-blend-luminosity fixed"></div>
      <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[5%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
            <Briefcase size={14} /> Partner With Us
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Become a <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Verified Vendor</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Join the Echoes of Nepal ecosystem. Connect your tourism business with travelers exploring districts, destinations, and hidden treks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
          
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-in fade-in slide-in-from-top-4">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Business Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <Building size={20} className="text-blue-400" /> Business Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Business Name</label>
                  <input required type="text" name="business_name" value={formData.business_name} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all" placeholder="Enter full business name" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Vendor Type</label>
                    <div className="relative">
                      <select required name="vendor_type" value={formData.vendor_type} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all appearance-none cursor-pointer">
                        <option value="" disabled className="bg-slate-900 text-slate-500">Select type...</option>
                        {VENDOR_TYPES.map(type => (
                          <option key={type} value={type} className="bg-slate-900">{type}</option>
                        ))}
                      </select>
                      <Briefcase size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">District</label>
                    <div className="relative">
                      <select required name="district_slug" value={formData.district_slug} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all appearance-none cursor-pointer">
                        <option value="" disabled className="bg-slate-900 text-slate-500">Select district...</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.slug} className="bg-slate-900">{d.name}</option>
                        ))}
                      </select>
                      <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all resize-none" placeholder="Describe your services, specialties, and exactly what you offer..." />
                </div>
              </div>
            </div>

            {/* Contact & Verification Info */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-white/5 pb-4 flex items-center gap-2">
                <FileText size={20} className="text-emerald-400" /> Verification & Contact
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                    <div className="relative">
                      <input required type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" placeholder="+977..." />
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
                    <div className="relative">
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all" placeholder="biz@example.com" />
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">PAN Number</label>
                    <input required type="text" name="pan_number" value={formData.pan_number} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono" placeholder="XXXXXXXXX" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registration No.</label>
                    <input required type="text" name="registration_number" value={formData.registration_number} onChange={handleInputChange} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono" placeholder="REG-XXX" />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Official Document</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group overflow-hidden relative">
                      <input type="file" required accept=".pdf,image/*" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} className="hidden" />
                      {documentFile ? (
                        <div className="flex flex-col items-center p-2 text-center z-10">
                            <CheckCircle2 size={24} className="text-emerald-400 mb-1" />
                            <span className="text-xs text-white font-medium truncate max-w-full">{documentFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center p-2 text-center text-slate-500 group-hover:text-emerald-400 transition-colors z-10">
                            <UploadCloud size={24} className="mb-1" />
                            <span className="text-xs font-medium">Upload PDF/Image</span>
                        </div>
                      )}
                      {documentFile && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>}
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Business Banner</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group overflow-hidden relative">
                      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                      {imageFile ? (
                        <div className="flex flex-col items-center p-2 text-center z-10">
                            <CheckCircle2 size={24} className="text-blue-400 mb-1" />
                            <span className="text-xs text-white font-medium truncate max-w-full">{imageFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center p-2 text-center text-slate-500 group-hover:text-blue-400 transition-colors z-10">
                            <ImageIcon size={24} className="mb-1" />
                            <span className="text-xs font-medium">Upload Image</span>
                        </div>
                      )}
                      {imageFile && <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>}
                    </label>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/5 pt-8 flex justify-end">
             <button 
                type="submit" 
                disabled={loading}
                className="bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300 flex items-center gap-3 disabled:opacity-50 hover:scale-[1.02] shadow-xl hover:shadow-white/20"
              >
                {loading ? (
                   <span className="flex items-center gap-2">
                       <span className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></span>
                       Submitting...
                   </span>
                ) : (
                    <>Submit Application <ArrowRight size={18} /></>
                )}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
