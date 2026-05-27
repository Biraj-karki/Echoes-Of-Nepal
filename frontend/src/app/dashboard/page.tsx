"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthProvider";
import { 
  Mountain, 
  RefreshCcw, 
  Sparkles, 
  Filter, 
  ChevronDown, 
  History, 
  TrendingUp, 
  LayoutGrid, 
  Compass, 
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import StoryCard from "@/components/StoryCard";
import { Story } from "@/components/StoryCard";
import CreateStory from "@/components/CreateStory";
import { API_BASE } from "@/lib/api";

type FilterType = "recent" | "popular" | "all";


function FilterOption({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${active ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const filterRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);
  const scrollYRef = useRef(0);

  const [stories, setStories] = useState<Story[]>([]);
  const [fetchingStories, setFetchingStories] = useState(false);
  const [posting, setPosting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("recent");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  
  // UI states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(true);

  // comments state
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [commentsByStory, setCommentsByStory] = useState<Record<number, any[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<number, string>>({});
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());

  const myId = (user as any)?.id;
  const myEmail = (user as any)?.email;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Scroll listener for auto-hiding filter bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > scrollYRef.current && currentScrollY > 200) {
        setShowFilterBar(false);
      } else {
        setShowFilterBar(true);
      }
      scrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside filter menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const normalizeStories = (data: any): Story[] => {
    const list: Story[] = Array.isArray(data) ? data : data?.stories || [];
    return list.map((s: any) => ({
      ...s,
      user: s.user || { id: s.user_id, name: s.user_name, email: s.user_email },
      media: Array.isArray(s.media) ? s.media : [],
      like_count: Number(s.like_count ?? 0),
      comment_count: Number(s.comment_count ?? 0),
      liked_by_me: !!s.liked_by_me,
    }));
  };

  const fetchStories = async () => {
    setFetchingStories(true);
    setErrorMsg(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/stories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Stories fetch failed");
      const data = await res.json();
      setStories(normalizeStories(data));
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to load stories");
    } finally {
      setFetchingStories(false);
    }
  };

  useEffect(() => {
    if (!loading && user) fetchStories();
  }, [loading, user]);

  const handlePostStory = async (fd: FormData) => {
    setPosting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/stories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Failed to post story");
      setSuccessMsg("Your echo has been released into the mountains! 🎉");
      setIsCreateModalOpen(false); 
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchStories();
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to post story");
    } finally {
      setPosting(false);
    }
  };

  const isOwner = (s: Story) => {
    const sid = s.user?.id ?? s.user_id;
    const semail = s.user?.email ?? s.user_email;
    return Boolean((myId && sid && Number(myId) === Number(sid)) || (myEmail && semail && myEmail === semail));
  };

  const handleDeleteStory = async (storyId: number) => {
    setPendingDeleteId(storyId);
  };

  const confirmDeleteStory = async () => {
    if (!pendingDeleteId) return;
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/stories/${pendingDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setStories((prev) => prev.filter((s) => (s.id ?? s.story_id) !== pendingDeleteId));
      setSuccessMsg("Story deleted successfully.");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleLike = async (storyId: number) => {
    const token = getToken();
    if (!token) return;
    setStories((prev) =>
      prev.map((s) => {
        const sid = (s.id ?? s.story_id) as number;
        if (sid !== storyId) return s;
        const liked = !!s.liked_by_me;
        return { ...s, liked_by_me: !liked, like_count: Math.max(0, (s.like_count ?? 0) + (liked ? -1 : 1)) };
      })
    );
    await fetch(`${API_BASE}/api/stories/${storyId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
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
    if (!commentsByStory[storyId]) await loadComments(storyId);
  };

  const handlePostComment = async (storyId: number) => {
    const token = getToken();
    const text = (commentDraft[storyId] || "").trim();
    if (!token || !text) return;
    const res = await fetch(`${API_BASE}/api/stories/${storyId}/comments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setCommentDraft((p) => ({ ...p, [storyId]: "" }));
      await loadComments(storyId);
      setStories((prev) => prev.map((s) => (s.id ?? s.story_id) === storyId ? { ...s, comment_count: (s.comment_count ?? 0) + 1 } : s));
    }
  };

  const filteredStories = useMemo(() => {
    let list = [...stories];
    if (filter === "popular") {
      list.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    } else if (filter === "recent") {
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0).getTime();
        const dateB = new Date(b.createdAt || b.created_at || 0).getTime();
        return dateB - dateA;
      });
    }
    return list;
  }, [stories, filter]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#020617] text-slate-500">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="h-14 w-14 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.45em] text-slate-500">Syncing Echoes</p>
            <p className="mt-2 text-sm text-slate-400">Preparing your travel feed...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-24">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="pt-8 sm:pt-12">
          <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
                  <Mountain size={12} /> The Soul of Nepal
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Journey Echoes
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                    A lighter, cleaner story feed for travelers. Browse community posts, share your own memories, and keep the journey flowing.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-2">
                    <Sparkles size={12} className="text-emerald-400" />
                    Live stories
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-2">
                    <Compass size={12} className="text-blue-400" />
                    Travel notes
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  variant="secondary"
                  onClick={fetchStories}
                  disabled={fetchingStories}
                  className="justify-center lg:min-w-[180px]"
                  size="lg"
                >
                  <RefreshCcw size={16} className={fetchingStories ? "mr-2 animate-spin" : "mr-2"} />
                  {fetchingStories ? "Syncing..." : "Refresh Feed"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="justify-center lg:min-w-[180px]"
                  size="lg"
                >
                  <Plus size={16} className="mr-2" />
                  Share a Story
                </Button>
              </div>
            </div>
          </div>
        </section>

        {(errorMsg || successMsg) && (
          <div className={`mt-6 rounded-2xl border px-4 py-3 ${errorMsg ? 'border-red-500/20 bg-red-500/10 text-red-300' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}>
            <p className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={16} />
              {errorMsg || successMsg}
            </p>
          </div>
        )}

        {pendingDeleteId && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300">Confirm Story Deletion</p>
                <p className="mt-1 text-sm text-slate-300">Delete this story and its media?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingDeleteId(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteStory}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <div
            ref={filterBarRef}
            className={`sticky top-4 z-20 rounded-2xl border border-white/5 bg-slate-950/80 p-2 backdrop-blur-2xl transition-all duration-500 ${showFilterBar ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.04] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-white/10 active:scale-95"
                >
                  <Filter size={14} className="text-blue-400" />
                  <span>{filter} stories</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterMenuOpen && (
                  <div className="absolute left-0 top-full z-30 mt-2 w-52 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <FilterOption active={filter === "recent"} onClick={() => { setFilter("recent"); setIsFilterMenuOpen(false); }} label="Recent" icon={<History size={14} />} />
                    <FilterOption active={filter === "popular"} onClick={() => { setFilter("popular"); setIsFilterMenuOpen(false); }} label="Popular" icon={<TrendingUp size={14} />} />
                    <FilterOption active={filter === "all"} onClick={() => { setFilter("all"); setIsFilterMenuOpen(false); }} label="All Stories" icon={<LayoutGrid size={14} />} />
                  </div>
                )}
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 sm:flex">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                {stories.length} echoes discovered
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-6">
            {fetchingStories && stories.length === 0 ? (
              <div className="rounded-[2rem] border border-white/5 bg-white/[0.02] py-20 text-center">
                <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Unfolding the narrative</p>
              </div>
            ) : filteredStories.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center sm:p-14">
                <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] text-slate-500">
                  <Mountain size={34} />
                  <Compass size={16} className="absolute -bottom-1 -right-1 text-blue-400" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">The peaks are quiet</h3>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
                  No echoes have been released here yet. Be the first to mark your trail and start the conversation.
                </p>
                <div className="mt-7">
                  <Button onClick={() => setIsCreateModalOpen(true)} size="lg">
                    <Plus size={16} className="mr-2" />
                    Publish your first story
                  </Button>
                </div>
              </div>
            ) : (
              filteredStories.map((story) => {
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
        </div>
      </main>

      {/* MODAL OVERLAY */}
      {isCreateModalOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          onMouseDown={(e) => e.target === e.currentTarget && setIsCreateModalOpen(false)}
        >
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl animate-in fade-in duration-500"></div>
          
          <div className="relative w-full max-w-2xl transform animate-in zoom-in-95 duration-500 slide-in-from-bottom-10">
            <CreateStory 
              onPost={handlePostStory} 
              posting={posting} 
              onClose={() => setIsCreateModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
