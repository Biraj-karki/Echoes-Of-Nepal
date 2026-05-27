"use client";

import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { API_BASE } from "@/lib/api";
const MAX_MEDIA = 6;

export default function StoryComposer({ onPosted }: { onPosted: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const previews = useMemo(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      name: file.name,
      sizeMB: (file.size / (1024 * 1024)).toFixed(1),
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    setFiles((prev) => [...prev, ...picked].slice(0, MAX_MEDIA));
    e.target.value = "";
  };

  const removeAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => setFiles([]);

  const validateStory = () => {
    if (!title.trim()) {
      setError("A title is required for your story.");
      return false;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError("Please write a bit more in the description.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to share your story.");
      return;
    }

    if (!validateStory()) return;

    setPosting(true);
    try {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("location_tag", locationTag.trim());
      files.forEach((f) => form.append("media", f));

      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to post your story. Please try again.");
        return;
      }

      setTitle("");
      setDescription("");
      setLocationTag("");
      setFiles([]);
      setSuccess(true);
      onPosted?.();
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError("Network error. Could not connect to the server.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="eon-surface-strong p-6 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="eon-pill mb-3">Story</div>
          <h2 className="eon-card-title text-2xl">Share your travel story</h2>
        </div>

        {files.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-4">
        <input
          className="eon-input px-4 py-3"
          placeholder="Story title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="eon-input px-4 py-3"
          placeholder="Location tag (e.g., Mustang, Rara, Pokhara)"
          value={locationTag}
          onChange={(e) => setLocationTag(e.target.value)}
        />

        <textarea
          className="eon-textarea min-h-[140px] px-4 py-3"
          placeholder="Write something about your journey..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10">
            <span>Attach</span>
            <span>Choose media</span>
            <input className="hidden" type="file" multiple accept="image/*,video/*" onChange={handlePick} />
          </label>

          <div className="text-sm text-white/70">
            Selected media <span className="font-semibold text-white">{files.length}/{MAX_MEDIA}</span>
          </div>
        </div>

        {previews.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {previews.map((p, idx) => (
              <div
                key={p.url}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                title={`${p.name} • ${p.sizeMB} MB`}
              >
                {p.type === "image" ? (
                  <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <video src={p.url} className="h-full w-full object-cover" muted playsInline />
                )}

                <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                  {p.type === "video" ? "Video" : "Image"}
                </div>

                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/85"
                  aria-label="Remove"
                >
                  ×
                </button>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent p-2">
                  <p className="truncate text-xs text-white/90">{p.name}</p>
                  <p className="text-[11px] text-white/60">{p.sizeMB} MB</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(error || success) && (
          <div className="mt-4">
            <Alert
              type={error ? "error" : "success"}
              message={error || "Your story has been posted successfully!"}
            />
          </div>
        )}

        <div className="mt-4">
          <Button className="w-full py-4" onClick={submit} loading={posting} disabled={posting}>
            {posting ? "Publishing Story..." : "Publish Journey Story"}
          </Button>
        </div>

        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
          Max 6 files. Images and videos supported.
        </p>
      </div>
    </section>
  );
}
