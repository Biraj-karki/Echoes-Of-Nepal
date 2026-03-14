"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { RefreshCcw } from "lucide-react";

import CreateStory from "@/components/CreateStory";
import StoryCard from "@/components/StoryCard";

type UserType = {
  id: number;
  name: string;
  email: string;
};

type Story = {
  id?: number;
  story_id?: number;
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
  media?: any[];
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
  const [posting, setPosting] = useState(false);

  // UI messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // comments state
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [commentsByStory, setCommentsByStory] = useState<Record<number, any[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());

  const myId = (user as unknown as UserType)?.id;
  const myEmail = (user as unknown as UserType)?.email;

  // redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
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
        throw new Error("Stories fetch failed");
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
  }, [loading, user]); // eslint-disable-line

  const handlePostStory = async (fd: FormData) => {
    setPosting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not logged in.");

      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        throw new Error("Failed to post story");
      }

      setSuccessMsg("Story posted successfully! 🎉");
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchStories();
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to post story");
    } finally {
      setPosting(false);
    }
  };

  const isOwner = (s: Story) => {
    const storyOwnerId = s.user?.id ?? s.user_id;
    const storyOwnerEmail = s.user?.email ?? s.user_email;
    return Boolean(
      (myId && storyOwnerId && Number(myId) === Number(storyOwnerId)) ||
      (myEmail && storyOwnerEmail && myEmail === storyOwnerEmail)
    );
  };

  const handleDeleteStory = async (storyId: number) => {
    if (!confirm("Delete this story?")) return;

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/stories/${storyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Delete failed");

      setStories((prev) => prev.filter((s) => (s.id ?? s.story_id) !== storyId));
      setSuccessMsg("Story deleted");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setErrorMsg(e.message);
    }
  };

  const handleLike = async (storyId: number) => {
    const token = getToken();
    if (!token) return;

    // optimistic
    setStories((prev) =>
      prev.map((s) => {
        const sid = (s.id ?? s.story_id) as number;
        if (sid !== storyId) return s;
        const liked = !!s.liked_by_me;
        return {
          ...s,
          liked_by_me: !liked,
          like_count: Math.max(0, (s.like_count ?? 0) + (liked ? -1 : 1)),
        };
      })
    );

    const res = await fetch(`${API_BASE}/api/stories/${storyId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) fetchStories(); // revert on fail
  };

  const loadComments = async (storyId: number) => {
    if (loadingComments.has(storyId)) return;
    setLoadingComments((p) => new Set(p).add(storyId));

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/stories/${storyId}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCommentsByStory((p) => ({ ...p, [storyId]: data.comments || [] }));
      }
    } finally {
      setLoadingComments((p) => {
        const n = new Set(p);
        n.delete(storyId);
        return n;
      });
    }
  };

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

  const handlePostComment = async (storyId: number) => {
    const token = getToken();
    const text = (commentDraft[storyId] || "").trim();
    if (!token || !text) return;

    const res = await fetch(`${API_BASE}/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      setCommentDraft((p) => ({ ...p, [storyId]: "" }));
      await loadComments(storyId);
      setStories((prev) =>
        prev.map((s) => {
          const sid = (s.id ?? s.story_id) as number;
          if (sid !== storyId) return s;
          return { ...s, comment_count: (s.comment_count ?? 0) + 1 };
        })
      );
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20">
      <main className="max-w-3xl mx-auto px-5 pt-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Community Stories
            </h1>
            <p className="text-slate-400 mt-2">
              Share your journey. Discover hidden trails.
            </p>
          </div>

          <button
            onClick={fetchStories}
            disabled={fetchingStories}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCcw size={16} className={fetchingStories ? "animate-spin" : ""} />
            {fetchingStories ? "Refreshing" : "Refresh Feed"}
          </button>
        </div>

        {/* FEEDBACK */}
        {(errorMsg || successMsg) && (
          <div className={`mb-6 p-4 rounded-xl border ${errorMsg ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-green-500/10 border-green-500/20 text-green-200'}`}>
            <p className="font-medium text-sm text-center">{errorMsg || successMsg}</p>
          </div>
        )}

        {/* CREATE STORY */}
        <div className="mb-10">
          <CreateStory onPost={handlePostStory} posting={posting} />
        </div>

        {/* FEED */}
        <div className="space-y-6">
          {fetchingStories && stories.length === 0 ? (
            <div className="py-20 text-center text-slate-500 animate-pulse">Loading stories...</div>
          ) : stories.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl font-semibold text-slate-600">No stories yet</p>
              <p className="text-slate-500 mt-2">Be the first to share your adventure!</p>
            </div>
          ) : (
            stories.map((story) => {
              const storyId = (story.id ?? story.story_id) as number;
              return (
                <StoryCard
                  key={storyId}
                  story={story}
                  isOwner={isOwner(story)}
                  onLike={handleLike}
                  onDelete={handleDeleteStory}
                  onToggleComments={toggleCommentsUI}
                  commentsOpen={openComments.has(storyId)}
                  loadingComments={loadingComments.has(storyId)}
                  comments={commentsByStory[storyId] || []}
                  commentDraft={commentDraft[storyId] || ""}
                  setCommentDraft={(val) => setCommentDraft((p) => ({ ...p, [storyId]: val }))}
                  onPostComment={handlePostComment}
                />
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
