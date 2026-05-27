"use client";

import { useMemo, useState, useRef } from "react";
import { Image as ImageIcon, MapPin, X, Send, Sparkles, Plus, Compass, Mountain } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import LocationAutocomplete, { SelectedLocation } from "@/components/LocationAutocomplete";

interface CreateStoryProps {
    onPost: (data: FormData) => Promise<void>;
    posting: boolean;
    onClose?: () => void;
}

export default function CreateStory({ onPost, posting, onClose }: CreateStoryProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [locationTag, setLocationTag] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [showLocationInput, setShowLocationInput] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mediaPreviews = useMemo(
        () =>
            files.map((file) => ({
                file,
                url: URL.createObjectURL(file),
                type: file.type.startsWith("video") ? "video" : "image",
            })),
        [files]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const fd = new FormData();
        fd.append("title", title.trim());
        fd.append("location_tag", locationTag.trim());
        fd.append("description", description.trim());
        // Pass structured location ids if user picked from autocomplete
        if (selectedLocation) {
            if (selectedLocation.type === "destination" && selectedLocation.id) {
                fd.append("destination_id", String(selectedLocation.id));
            } else if (selectedLocation.type === "district" && selectedLocation.id) {
                fd.append("district_id", String(selectedLocation.id));
            }
        }
        files.forEach((file) => fd.append("media", file));

        await onPost(fd);

        setTitle("");
        setLocationTag("");
        setSelectedLocation(null);
        setDescription("");
        setFiles([]);
        setShowLocationInput(false);
        if (onClose) onClose();
    };

    const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        setFiles((prev) => [...prev, ...selected].slice(0, 6));
        e.target.value = "";
    };

    const removeFileAt = (idx: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="bg-[#0f172a]/95 backdrop-blur-[60px] border border-white/10 rounded-[2.5rem] lg:rounded-[3.5rem] p-8 lg:p-10 transition-all duration-500 relative ring-1 ring-white/5 w-full max-w-2xl">
            {/* CLOSE BUTTON */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-full transition-all active:scale-95 z-10"
                >
                    <X size={20} />
                </button>
            )}

            {/* COMPOSER HEADER */}
            <div className="flex items-center gap-5 mb-10">
                <div className="h-16 w-16 rounded-[2rem] bg-gradient-to-br from-blue-600 via-emerald-500 to-emerald-400 p-[1px] rotate-2 group-hover:rotate-0 transition-transform duration-700">
                    <div className="h-full w-full rounded-[2rem] bg-slate-900 flex items-center justify-center overflow-hidden border border-white/5">
                        {user?.profile_image ? (
                            <img src={user.profile_image} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <Compass size={24} className="text-white opacity-40 italic" />
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="text-white font-black italic tracking-tighter leading-none text-2xl uppercase">Map your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Echo</span></h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                        <Sparkles size={11} className="text-amber-500 animate-pulse" /> Leave a trail in Nepal
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group/input">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Where did your compass take you?"
                        required
                        className="w-full bg-white/[0.04] border border-white/5 rounded-2xl px-6 py-5 text-sm font-black text-white italic tracking-tight focus:outline-none focus:border-blue-500/40 focus:bg-blue-500/[0.02] transition-all placeholder:text-slate-700 shadow-inner"
                    />
                  </div>
                  <div className="relative group/input">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the moment. The air, the colors, the feeling..."
                        rows={6}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-3xl px-6 py-5 text-xs font-semibold text-slate-300 leading-relaxed focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/[0.01] transition-all placeholder:text-slate-800 resize-none shadow-inner"
                    />
                  </div>
                </div>

                {showLocationInput && (
                    <div className="animate-in slide-in-from-top-3 duration-500">
                        <LocationAutocomplete
                            value={locationTag}
                            onChange={setLocationTag}
                            onSelect={(loc) => {
                                setSelectedLocation(loc);
                                setLocationTag(loc.name);
                            }}
                            onClear={() => {
                                setSelectedLocation(null);
                                setLocationTag("");
                            }}
                            placeholder="Tag the terrain (e.g. Annapurna Base Camp)"
                        />
                    </div>
                )}

                {/* MEDIA PREVIEWS */}
                {files.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 py-4">
                        {mediaPreviews.map((m, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-white/10 group/thumb shadow-2xl">
                                {m.type === "image" ? (
                                    <img src={m.url} alt="preview" className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-700" />
                                ) : (
                                    <video src={m.url} className="w-full h-full object-cover" muted />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeFileAt(idx)}
                                        className="p-2.5 bg-red-600 text-white rounded-full scale-50 group-hover/thumb:scale-100 transition-transform"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {files.length < 6 && (
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 flex flex-col items-center justify-center gap-2 group/add transition-all shadow-inner"
                            >
                                <Plus size={24} className="text-slate-800 group-hover/add:text-blue-500 group-hover/add:scale-110 transition-all" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-800 group-hover/add:text-blue-400">Add More</span>
                            </button>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-6">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-4 rounded-2xl transition-all shadow-xl active:scale-90 ${files.length > 0 ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-slate-600 hover:text-blue-400 hover:bg-white/10 border border-white/5 hover:border-blue-500/20'}`}
                            title="Add Media"
                        >
                            <ImageIcon size={22} />
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={onFilesChange}
                                className="hidden"
                            />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLocationInput(!showLocationInput)}
                            className={`p-4 rounded-2xl transition-all shadow-xl active:scale-90 ${showLocationInput ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-600 hover:text-emerald-400 hover:bg-white/10 border border-white/5 hover:border-emerald-500/20'}`}
                            title="Add Location"
                        >
                            <MapPin size={22} />
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={posting || !title.trim()}
                        className="group relative flex items-center gap-4 px-10 py-5 bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 text-white font-black uppercase tracking-[0.25em] text-[11px] rounded-[1.5rem] transition-all overflow-hidden shadow-[0_20px_40px_-12px_rgba(59,130,246,0.5)] hover:shadow-[0_20px_40px_-12px_rgba(59,130,246,0.8)] hover:scale-105 active:scale-95 disabled:opacity-30"
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {posting ? (
                            "Syncing Journey..."
                        ) : (
                            <>
                                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                <span>Release Echo</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
            
            {/* DECORATIVE ELEMENT */}
            <div className="mt-10 flex items-center justify-center gap-4 opacity-[0.03]">
                <div className="h-[1px] flex-1 bg-white"></div>
                <Mountain size={20} className="text-white" />
                <div className="h-[1px] flex-1 bg-white"></div>
            </div>
        </div>
    );
}
