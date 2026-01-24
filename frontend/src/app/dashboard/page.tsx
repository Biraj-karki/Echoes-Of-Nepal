"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";
import {
  Heart,
  MessageCircle,
  Trash2,
  RefreshCcw,
  MapPin,
  X,
  LogOut,
  Plus,
  Image as ImageIcon,
  Send,
} from "lucide-react";

type StoryMedia = {
  id?: number | string;
  _id?: string;
  media_url?: string;
  media_type?: string;
};

type Comment = {
  id: number;
  text: string;
  created_at: string;
  user_id: number;
  user_name: string;
  user_email: string;
};

type Story = {
  id?: number; // postgres
  story_id?: number; // fallback
  _id?: string; // mongo fallback (just in case)

  title: string;
  description?: string;
  location_tag?: string;

  created_at?: string;
  createdAt?: string;

  user_id?: number;
  user_name?: string;
  user_email?: string;

  like_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;

  user?: {
    id?: number;
    name?: string;
    email?: string;
    picture_url?: string;
  };

  media?: StoryMedia[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    []
  );

  const [stories, setStories] = useState<Story[]>([]);
  const [fetchingStories, setFetchingStories] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [locationTag, setLocationTag] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);

  // UI messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // comments state
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [commentsByStory, setCommentsByStory] = useState<Record<number, Comment[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());

  const myId = (user as any)?.id;
  const myEmail = (user as any)?.email;

  // redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const logout = async () => {
    localStorage.removeItem("token");
    await refreshUser();
    router.replace("/login");
  };

  const resolveUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const normalizeStories = (data: any): Story[] => {
    const list: Story[] = Array.isArray(data) ? data : data?.stories || [];

    return list.map((s: any) => {
      const nestedUser =
        s.user ||
        (s.user_name || s.user_email || s.user_id
          ? {
              id: s.user_id,
              name: s.user_name,
              email: s.user_email,
            }
          : undefined);

      const mediaArr = Array.isArray(s.media) ? s.media : [];

      return {
        ...s,
        user: nestedUser,
        media: mediaArr,
        like_count: Number(s.like_count ?? 0),
        comment_count: Number(s.comment_count ?? 0),
        liked_by_me: !!s.liked_by_me,
      };
    });
  };

  const fetchStories = async () => {
    setFetchingStories(true);
    setErrorMsg(null);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Stories fetch failed (${res.status}). ${
            text?.slice(0, 120) || "Check backend route /api/stories"
          }`
        );
      }

      const data = await res.json();
      setStories(normalizeStories(data));
    } catch (e: any) {
      setStories([]);
      setErrorMsg(e?.message || "Failed to load stories");
    } finally {
      setFetchingStories(false);
    }
  };

  useEffect(() => {
    if (!loading && user) fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  // ✅ better file handling (append + max 6 + can remove)
  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setFiles((prev) => [...prev, ...selected].slice(0, 6));
    e.target.value = ""; // allow selecting same file again
  };

  const removeFileAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearAllFiles = () => setFiles([]);

  // ✅ previews
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

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [mediaPreviews]);

  const resetForm = () => {
    setTitle("");
    setLocationTag("");
    setDescription("");
    setFiles([]);
  };

  const postStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not logged in. Please login again.");

      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("location_tag", locationTag.trim());
      fd.append("description", description.trim());

      files.forEach((file) => fd.append("media", file));

      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Failed to post story (${res.status}). ${
            text?.slice(0, 160) || "Check backend POST /api/stories"
          }`
        );
      }

      setSuccessMsg("Story posted successfully ");
      resetForm();
      await fetchStories();
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to post story");
    } finally {
      setPosting(false);
    }
  };

  // ownership check
  const isOwner = (s: Story) => {
    const storyOwnerId = s.user?.id ?? s.user_id;
    const storyOwnerEmail = s.user?.email ?? s.user_email;
    return (
      (myId && storyOwnerId && Number(myId) === Number(storyOwnerId)) ||
      (myEmail && storyOwnerEmail && myEmail === storyOwnerEmail)
    );
  };

  // Delete whole story
  const deleteStory = async (storyId: number) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Not logged in.");

      const ok = confirm("Delete this story? This cannot be undone.");
      if (!ok) return;

      const res = await fetch(`${API_BASE}/api/stories/${storyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Delete failed (${res.status}). ${text?.slice(0, 140) || ""}`);
      }

      setStories((prev) => prev.filter((s) => (s.id ?? s.story_id) !== storyId));
      setSuccessMsg("Story deleted ");
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to delete story");
      setSuccessMsg(null);
    }
  };

  // Delete single media
  const deleteMedia = async (storyId: number, mediaId: number | string) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Not logged in.");

      const ok = confirm("Delete this media?");
      if (!ok) return;

      const res = await fetch(`${API_BASE}/api/stories/${storyId}/media/${mediaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Delete media failed (${res.status}). ${text?.slice(0, 140) || ""}`
        );
      }

      setStories((prev) =>
        prev.map((s) => {
          const sid = s.id ?? s.story_id;
          if (sid !== storyId) return s;

          const nextMedia = (s.media || []).filter((m: any) => {
            const mid = m.id ?? m._id;
            return String(mid) !== String(mediaId);
          });

          return { ...s, media: nextMedia };
        })
      );

      setSuccessMsg("Media deleted ");
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to delete media");
      setSuccessMsg(null);
    }
  };

  // ✅ REAL like toggle (calls backend)
  const toggleLike = async (storyId: number) => {
    const token = getToken();
    if (!token) {
      setErrorMsg("Please login again to like.");
      return;
    }

    // optimistic
    setStories((prev) =>
      prev.map((s) => {
        const sid = (s.id ?? s.story_id) as number;
        if (sid !== storyId) return s;

        const liked = !!s.liked_by_me;
        const nextCount = Math.max(0, (s.like_count ?? 0) + (liked ? -1 : 1));

        return { ...s, liked_by_me: !liked, like_count: nextCount };
      })
    );

    const res = await fetch(`${API_BASE}/api/stories/${storyId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      await fetchStories();
      setErrorMsg("Like failed. Try again.");
    }
  };

  // ✅ load comments for one story
  const loadComments = async (storyId: number) => {
    if (loadingComments.has(storyId)) return;

    setLoadingComments((prev) => new Set(prev).add(storyId));

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/stories/${storyId}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Comments fetch failed (${res.status}). ${text?.slice(0, 120) || ""}`
        );
      }

      const data = await res.json();
      setCommentsByStory((p) => ({ ...p, [storyId]: data.comments || [] }));
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to load comments");
    } finally {
      setLoadingComments((prev) => {
        const next = new Set(prev);
        next.delete(storyId);
        return next;
      });
    }
  };

  // ✅ open/close comments UI
  const toggleCommentsUI = async (storyId: number) => {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(storyId)) next.delete(storyId);
      else next.add(storyId);
      return next;
    });

    if (!commentsByStory[storyId]) {
      await loadComments(storyId);
    }
  };

  // ✅ post comment (calls backend)
  const postComment = async (storyId: number) => {
    const token = getToken();
    if (!token) {
      setErrorMsg("Please login again to comment.");
      return;
    }

    const text = (commentDraft[storyId] || "").trim();
    if (!text) return;

    const res = await fetch(`${API_BASE}/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      setErrorMsg(`Comment failed. ${t?.slice(0, 120) || ""}`);
      return;
    }

    setCommentDraft((p) => ({ ...p, [storyId]: "" }));
    await loadComments(storyId);

    setStories((prev) =>
      prev.map((s) => {
        const sid = (s.id ?? s.story_id) as number;
        if (sid !== storyId) return s;
        return { ...s, comment_count: (s.comment_count ?? 0) + 1 };
      })
    );
  };

  if (loading || !user) {
    return <div style={{ padding: 24, color: "#e5e7eb" }}>Loading dashboard…</div>;
  }

  return (
    <div style={{ padding: 24, color: "#e5e7eb" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Top header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
              Echoes Of Nepal — Stories
            </h1>
            <p style={{ color: "#9ca3af", marginTop: 0 }}>
              Share your journey. Explore stories from everyone.
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700 }}>{(user as any)?.name}</div>
            <div style={{ color: "#9ca3af", fontSize: 13 }}>{(user as any)?.email}</div>

            <button
              onClick={logout}
              style={{
                marginTop: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: "1px solid rgba(148,163,184,0.35)",
                color: "#e5e7eb",
                padding: "8px 12px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 700,
              }}
              title="Logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* Create story card */}
        <div className="eon-auth-card" style={{ marginTop: 18, maxWidth: "100%", padding: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Create a story</h2>
              <p style={{ color: "#9ca3af", marginTop: 0 }}>
                Photos, videos, a location tag — keep it real.
              </p>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              <Plus size={16} />
              New post
            </div>
          </div>

          {errorMsg && (
            <div
              style={{
                background: "rgba(220,38,38,0.12)",
                border: "1px solid rgba(220,38,38,0.35)",
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                color: "#fecaca",
                fontWeight: 700,
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: "rgba(34,197,94,0.10)",
                border: "1px solid rgba(34,197,94,0.30)",
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                color: "#bbf7d0",
                fontWeight: 700,
              }}
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={postStory} className="eon-form" style={{ gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label>
                <span>Story title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Snowfall near Shivapuri"
                  required
                />
              </label>

              <label>
                <span>Location tag</span>
                <input
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  placeholder="Shivapuri"
                />
              </label>
            </div>

            <label>
              <span>Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write something about your journey..."
                rows={4}
                style={{
                  borderRadius: 14,
                  border: "1px solid #4b5563",
                  padding: "10px 12px",
                  background: "rgba(15,23,42,0.95)",
                  color: "#e5e7eb",
                  outline: "none",
                }}
              />
            </label>

            {/* ✅ Better media UI */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
                  <ImageIcon size={16} /> Media (max 6)
                </div>

                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                <Plus size={16} />
                Choose files
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={onFilesChange}
                />
              </label>

              <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 6 }}>
                Selected: {files.length}/6
              </div>

              {mediaPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  {mediaPreviews.map((m, idx) => (
                    <div
                      key={m.url}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-white/20 bg-black/30"
                      title={`${m.name} • ${m.sizeMB} MB`}
                    >
                      {m.type === "image" ? (
                        <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                      ) : (
                        <video src={m.url} className="h-full w-full object-cover" muted playsInline />
                      )}

                      <button
                        type="button"
                        onClick={() => removeFileAt(idx)}
                        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label="Remove"
                        title="Remove"
                      >
                        ✕
                      </button>

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent p-1 text-[11px] text-white">
                        <div className="truncate">{m.name}</div>
                        <div className="text-gray-300">{m.sizeMB} MB</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="eon-submit-btn"
              disabled={posting}
              style={{ width: 180, alignSelf: "flex-end" }}
            >
              {posting ? "Posting..." : "Post story"}
            </button>
          </form>
        </div>

        {/* Stories list */}
        <div className="eon-auth-card" style={{ marginTop: 18, maxWidth: "100%", padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Latest stories</h2>
              <p style={{ color: "#9ca3af", marginTop: 0 }}>Explore stories from everyone.</p>
            </div>

            <button
              onClick={fetchStories}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "transparent",
                border: "1px solid rgba(148,163,184,0.35)",
                color: "#e5e7eb",
                padding: "8px 12px",
                borderRadius: 12,
                cursor: "pointer",
                fontWeight: 700,
              }}
              disabled={fetchingStories}
              title="Refresh"
            >
              <RefreshCcw size={16} />
              {fetchingStories ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {fetchingStories ? (
            <p style={{ color: "#9ca3af" }}>Loading stories…</p>
          ) : stories.length === 0 ? (
            <p style={{ color: "#9ca3af" }}>No stories yet. Post the first one 👀</p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {stories.map((s, idx) => {
                const storyId = (s.id ?? s.story_id ?? idx) as number;
                const owner = isOwner(s);
                const when = s.createdAt || s.created_at;
                const commentsOpen = openComments.has(storyId);
                const comments = commentsByStory[storyId] || [];
                const isLoadingThis = loadingComments.has(storyId);

                return (
                  <div
                    key={String(storyId)}
                    style={{
                      border: "1px solid rgba(148,163,184,0.22)",
                      borderRadius: 16,
                      padding: 14,
                      background: "rgba(2,6,23,0.30)",
                    }}
                  >
                    {/* top row */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 16 }}>{s.title}</div>

                        <div
                          style={{
                            color: "#9ca3af",
                            fontSize: 13,
                            marginTop: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          {s.location_tag ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <MapPin size={14} />
                              {s.location_tag}
                            </span>
                          ) : null}

                          {s.location_tag && when ? <span>•</span> : null}
                          {when ? <span>{new Date(when).toLocaleString()}</span> : null}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#9ca3af", fontSize: 13 }}>
                          <div style={{ fontWeight: 800, color: "#e5e7eb" }}>
                            {s.user?.name || s.user_name || "Unknown"}
                          </div>
                          <div>{s.user?.email || s.user_email || ""}</div>
                        </div>
                      </div>
                    </div>

                    {s.description && <p style={{ marginTop: 10, color: "#e5e7eb" }}>{s.description}</p>}

                    {/* media grid */}
                    {Array.isArray(s.media) && s.media.length > 0 && (
                      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {s.media.slice(0, 6).map((m, i) => {
                          const mid = (m.id ?? m._id ?? i) as any;
                          const rawUrl = m.media_url || "";
                          const url = resolveUrl(rawUrl);
                          const type = m.media_type || "";
                          if (!url) return null;

                          const isVideo = type.includes("video") || url.match(/\.(mp4|webm|mov)$/i);

                          return (
                            <div
                              key={String(mid)}
                              style={{
                                width: 220,
                                borderRadius: 14,
                                overflow: "hidden",
                                border: "1px solid rgba(148,163,184,0.22)",
                                background: "rgba(0,0,0,0.25)",
                                position: "relative",
                              }}
                            >
                              {isVideo ? (
                                <video src={url} controls style={{ width: "100%", display: "block" }} />
                              ) : (
                                <img
                                  src={url}
                                  alt="story media"
                                  style={{
                                    width: "100%",
                                    height: 160,
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                />
                              )}

                              {owner && (
                                <button
                                  onClick={() => deleteMedia(storyId, mid)}
                                  title="Delete media"
                                  style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    background: "rgba(220,38,38,0.92)",
                                    border: "none",
                                    color: "white",
                                    width: 30,
                                    height: 30,
                                    borderRadius: 999,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* action bar */}
                    <div
                      style={{
                        marginTop: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                        <button
                          onClick={() => toggleLike(storyId)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                            color: "#e5e7eb",
                          }}
                          title="Like"
                        >
                          <Heart
                            size={22}
                            strokeWidth={2}
                            fill={s.liked_by_me ? "#ef4444" : "none"}
                            color={s.liked_by_me ? "#ef4444" : "#e5e7eb"}
                            style={{ transition: "all 0.15s ease" }}
                          />
                          <span style={{ fontSize: 14, fontWeight: 800 }}>{s.like_count ?? 0}</span>
                        </button>

                        <button
                          onClick={() => toggleCommentsUI(storyId)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 4,
                            color: "#e5e7eb",
                          }}
                          title="Comments"
                        >
                          <MessageCircle size={22} strokeWidth={2} />
                          <span style={{ fontSize: 14, fontWeight: 800 }}>{s.comment_count ?? 0}</span>
                        </button>
                      </div>

                      {owner && (
                        <button
                          onClick={() => deleteStory(storyId)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 6,
                            color: "#fca5a5",
                            fontWeight: 800,
                          }}
                          title="Delete story"
                        >
                          <Trash2 size={20} />
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Comments panel */}
                    {commentsOpen && (
                      <div
                        style={{
                          marginTop: 12,
                          borderTop: "1px solid rgba(148,163,184,0.18)",
                          paddingTop: 12,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontWeight: 800 }}>Comments</div>
                          <button
                            onClick={() =>
                              setOpenComments((p) => {
                                const next = new Set(p);
                                next.delete(storyId);
                                return next;
                              })
                            }
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#9ca3af",
                              cursor: "pointer",
                            }}
                            title="Close"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {isLoadingThis ? (
                          <p style={{ color: "#9ca3af", marginTop: 10 }}>Loading comments…</p>
                        ) : comments.length === 0 ? (
                          <p style={{ color: "#9ca3af", marginTop: 10 }}>No comments yet.</p>
                        ) : (
                          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                            {comments.map((c) => (
                              <div
                                key={c.id}
                                style={{
                                  padding: 10,
                                  borderRadius: 12,
                                  border: "1px solid rgba(148,163,184,0.18)",
                                  background: "rgba(0,0,0,0.18)",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                                  <div style={{ fontWeight: 800, fontSize: 13 }}>
                                    {c.user_name}{" "}
                                    <span style={{ color: "#9ca3af", fontWeight: 600 }}>
                                      • {new Date(c.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ marginTop: 6, color: "#e5e7eb" }}>{c.text}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                          <input
                            value={commentDraft[storyId] || ""}
                            onChange={(e) =>
                              setCommentDraft((p) => ({ ...p, [storyId]: e.target.value }))
                            }
                            placeholder="Add a comment…"
                            style={{
                              flex: 1,
                              borderRadius: 12,
                              border: "1px solid rgba(148,163,184,0.25)",
                              padding: "10px 12px",
                              background: "rgba(15,23,42,0.95)",
                              color: "#e5e7eb",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => postComment(storyId)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "10px 12px",
                              borderRadius: 12,
                              border: "1px solid rgba(148,163,184,0.25)",
                              background: "rgba(255,255,255,0.04)",
                              color: "#e5e7eb",
                              cursor: "pointer",
                              fontWeight: 800,
                            }}
                            title="Send"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
