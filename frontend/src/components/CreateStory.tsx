"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, Plus, Trash2, Video } from "lucide-react";

interface CreateStoryProps {
    onPost: (data: FormData) => Promise<void>;
    posting: boolean;
}

export default function CreateStory({ onPost, posting }: CreateStoryProps) {
    const [title, setTitle] = useState("");
    const [locationTag, setLocationTag] = useState("");
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    // Calculate previews
    const mediaPreviews = useMemo(
        () =>
            files.map((file) => ({
                file,
                url: URL.createObjectURL(file),
                type: file.type.startsWith("video") ? "video" : "image",
                name: file.name,
                sizeMB: (file.size / (1024 * 1024)).toFixed(1),
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
        files.forEach((file) => fd.append("media", file));

        await onPost(fd);

        // Reset form on success (parent handles errors)
        setTitle("");
        setLocationTag("");
        setDescription("");
        setFiles([]);
    };

    const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        if (!selected.length) return;
        setFiles((prev) => [...prev, ...selected].slice(0, 6)); // max 6
        e.target.value = "";
    };

    const removeFileAt = (idx: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-bold text-white">Create a story</h2>
                    <p className="text-sm text-slate-400">Photos, videos, a location tag — keep it real.</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg">
                    <Plus size={14} /> New Post
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-xs font-semibold text-slate-400 ml-1 mb-1 block">Story Title</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Snowfall near Shivapuri"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-slate-600"
                        />
                    </label>

                    <label className="block">
                        <span className="text-xs font-semibold text-slate-400 ml-1 mb-1 block">Location</span>
                        <input
                            type="text"
                            value={locationTag}
                            onChange={(e) => setLocationTag(e.target.value)}
                            placeholder="e.g. Kathmandu"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-slate-600"
                        />
                    </label>
                </div>

                <label className="block">
                    <span className="text-xs font-semibold text-slate-400 ml-1 mb-1 block">Description</span>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Share the details of your adventure..."
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-slate-600 resize-none"
                    />
                </label>

                {/* MEDIA UPLOAD */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-semibold text-slate-400 ml-1">Media ({files.length}/6)</span>
                        {files.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setFiles([])}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {/* ADD BUTTON */}
                        {files.length < 6 && (
                            <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group">
                                <ImageIcon size={20} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
                                <span className="text-[10px] text-slate-500 font-medium group-hover:text-slate-300">Add Media</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    onChange={onFilesChange}
                                    className="hidden"
                                />
                            </label>
                        )}

                        {/* PREVIEWS */}
                        {mediaPreviews.map((m, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10 group">
                                {m.type === "image" ? (
                                    <img src={m.url} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <video src={m.url} className="w-full h-full object-cover" muted />
                                )}

                                {/* Overlay Info */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeFileAt(idx)}
                                        className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                                    {m.sizeMB}MB
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={posting}
                        className="px-6 py-2.5 bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {posting ? "Publishing..." : "Post Story"}
                    </button>
                </div>
            </form>
        </div>
    );
}
