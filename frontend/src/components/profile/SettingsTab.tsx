import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { User, Lock, Bell, Palette, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';

export default function SettingsTab({ user, onProfileUpdate }: { user?: any, onProfileUpdate?: () => void }) {
  const { refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  
  // Form states
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update internal state if user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
    }
  }, [user]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio, location }),
      });

      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: 'success' });
        await refreshUser(); // Refresh global auth state (Navbar name, etc.)
        if (onProfileUpdate) onProfileUpdate(); // Refresh local profile page state
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/users/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setMessage({ text: "Avatar updated successfully!", type: 'success' });
        await refreshUser();
        if (onProfileUpdate) onProfileUpdate();
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to upload avatar");
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-b border-white/5 pb-6">
        <h3 className="text-3xl font-black text-white tracking-tight">Account Settings</h3>
        <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">Manage your identity and preferences</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-12">
        {/* Settings Navigation */}
        <div className="w-full xl:w-72 flex-shrink-0">
          <nav className="flex flex-col gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 text-left text-sm font-bold uppercase tracking-wide group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5'
                    }
                  `}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1">
          {activeSection === 'profile' && (
            <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-8 space-y-10">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-black text-white tracking-tight">Profile Information</h4>
                {message && (
                  <div className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-full transform animate-in zoom-in-95 duration-300 ${
                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {message.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-8 bg-white/5 p-6 rounded-3xl border border-white/5">
                <div className="relative w-32 h-32 flex-shrink-0 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative w-full h-full rounded-full border-2 border-white/10 overflow-hidden shadow-2xl">
                    <img 
                      src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=random`} 
                      alt={user?.name || "User"} 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? 'opacity-30' : 'opacity-100'}`}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isUploading ? "Uploading..." : "Change Avatar"}
                    </button>
                    <button className="px-6 py-2.5 bg-white/5 text-slate-300 border border-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                      Remove
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Prefer JPG, WEBP or PNG. 5MB max limit.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all font-medium"
                    placeholder="e.g. Biraj Jung Karki"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Username (Static)</label>
                  <input 
                    type="text" 
                    value={user?.username?.replace('@', '') || ''}
                    readOnly
                    className="w-full px-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl text-slate-500 cursor-not-allowed outline-none font-medium"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Bio</label>
                  <textarea 
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all resize-none font-medium leading-relaxed"
                    placeholder="Tell your story. Where have the winds of Nepal taken you?"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all font-medium"
                    placeholder="e.g. Kathmandu, Nepal"
                />
              </div>

              <div className="pt-8 flex justify-end gap-4 border-t border-white/5">
                <button 
                  onClick={() => {
                    setName(user?.name || "");
                    setBio(user?.bio || "");
                    setLocation(user?.location || "");
                    setMessage(null);
                  }}
                  className="px-8 py-3 bg-white/5 text-slate-300 border border-white/5 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
                  disabled={isSaving || isUploading}
                >
                  Discard
                </button>
                <button 
                  onClick={handleSaveChanges}
                  disabled={isSaving || isUploading}
                  className="px-10 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Encrypting...
                    </>
                  ) : "Commit Changes"}
                </button>
              </div>
            </div>
          )}

          {activeSection !== 'profile' && (
            <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 p-12 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Lock size={32} className="text-slate-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white tracking-tight">Encryption in Progress</h4>
                <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
                  The &quot;{sections.find(s => s.id === activeSection)?.label}&quot; module is currently being optimized for peak performance. Check back shortly.
                </p>
              </div>
              <button 
                onClick={() => setActiveSection('profile')}
                className="px-6 py-2 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all"
              >
                Back to Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

