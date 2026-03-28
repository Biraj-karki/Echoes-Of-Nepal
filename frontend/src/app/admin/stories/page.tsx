"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Search, Trash2 } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

function resolveUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("admin_token") || "";
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(`${API_BASE}/api/admin/stories`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed loading stories");

      setStories(data.stories || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteStory = async (storyId: number) => {
    if (!confirm("Delete this story as admin? This removes media too.")) return;

    const res = await fetch(`${API_BASE}/api/admin/stories/${storyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    setStories((p) => p.filter((s) => s.id !== storyId));
  };

  const filtered = stories.filter((s) => {
    const text = `${s.title || ""} ${s.user_name || ""} ${s.user_email || ""} ${
      s.location_tag || ""
    }`.toLowerCase();
    return text.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Stories</h1>
          <p className="text-slate-400 mt-1">
            Review content, preview media, delete if needed.
          </p>
        </div>

        <button
          onClick={fetchStories}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-extrabold hover:bg-white/10"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 font-semibold">
          {err}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
        <Search className="text-slate-400" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search stories by title/user/location..."
          className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="text-lg font-black mb-3">
          Stories ({loading ? "…" : filtered.length})
        </div>

        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-slate-400">No stories found.</div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="rounded-3xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black">{s.title}</div>
                    <div className="text-slate-400 text-sm mt-1">
                      by <span className="text-slate-200 font-bold">{s.user_name}</span>{" "}
                      <span className="text-slate-500">({s.user_email})</span>
                      {s.location_tag ? (
                        <>
                          {" "}
                          • <span className="text-slate-300">{s.location_tag}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteStory(s.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-extrabold text-white hover:opacity-90"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                {/* media preview */}
                {Array.isArray(s.media) && s.media.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {s.media.slice(0, 8).map((m: any, idx: number) => {
                      const url = resolveUrl(m.media_url || "");
                      const isVideo =
                        (m.media_type || "").includes("video") ||
                        /\.(mp4|webm|mov)$/i.test(url);

                      return (
                        <div
                          key={m.id ?? idx}
                          className="w-[200px] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                        >
                          {isVideo ? (
                            <video
                              src={url}
                              controls
                              className="w-full h-[130px] object-cover"
                            />
                          ) : (
                            <img
                              src={url}
                              alt="story media"
                              className="w-full h-[130px] object-cover"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
