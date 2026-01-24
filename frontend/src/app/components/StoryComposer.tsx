"use client";

import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:5000";
const MAX_MEDIA = 6;

export default function StoryComposer({ onPosted }: { onPosted: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationTag, setLocationTag] = useState("");

  //  use File[] instead of FileList
  const [files, setFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);

  // create preview urls
  const previews = useMemo(() => {
    return files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video") ? "video" : "image",
      name: file.name,
      sizeMB: (file.size / (1024 * 1024)).toFixed(1),
    }));
  }, [files]);

  //  cleanup blob urls
  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    setFiles((prev) => [...prev, ...picked].slice(0, MAX_MEDIA));

    // allow picking the same file again
    e.target.value = "";
  };

  const removeAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAll = () => setFiles([]);

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      return;
    }
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    setPosting(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("location_tag", locationTag);

      //  append files
      files.forEach((f) => form.append("media", f));

      const res = await fetch(`${API}/api/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to post story");
        return;
      }

      setTitle("");
      setDescription("");
      setLocationTag("");
      setFiles([]);

      onPosted();
      alert("Story posted ");
    } catch (e) {
      console.error(e);
      alert("Something went wrong posting story");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="eon-dash-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="eon-card-title">Create a story</h2>

        {files.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="eon-form-grid">
        <input
          className="eon-input2"
          placeholder="Story title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="eon-input2"
          placeholder="Location tag (e.g., Mustang, Rara, Pokhara)"
          value={locationTag}
          onChange={(e) => setLocationTag(e.target.value)}
        />

        <textarea
          className="eon-textarea"
          placeholder="Write something about your journey..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/*  Upload + counter */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 cursor-pointer">
            <span>📎</span>
            <span>Choose media</span>
            <input
              className="hidden"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handlePick}
            />
          </label>

          <div className="text-sm text-white/70">
            Selected media{" "}
            <span className="font-semibold text-white">
              {files.length}/{MAX_MEDIA}
            </span>
          </div>
        </div>

        {/*  Preview grid */}
        {previews.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {previews.map((p, idx) => (
              <div
                key={p.url}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                title={`${p.name} • ${p.sizeMB} MB`}
              >
                {p.type === "image" ? (
                  <img
                    src={p.url}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    src={p.url}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
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
                  ✕
                </button>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent p-2">
                  <p className="truncate text-xs text-white/90">{p.name}</p>
                  <p className="text-[11px] text-white/60">{p.sizeMB} MB</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/*  Submit row */}
        <div className="eon-upload-row">
          <button
            className="eon-submit2"
            onClick={submit}
            disabled={posting || !title.trim()}
            title={!title.trim() ? "Title is required" : ""}
          >
            {posting ? "Posting..." : "Post story"}
          </button>
        </div>

        <p className="eon-hint">Max 6 files. Images + videos supported.</p>
      </div>
    </section>
  );
}
