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
  Plus 
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import StoryCard from "@/components/StoryCard";
import { Story } from "@/components/StoryCard";
import CreateStory from "@/components/CreateStory";

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

  const API_BASE = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
    []
  );

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
  const [lastScrollY, setLastScrollY] = useState(0);

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
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setShowFilterBar(false);
      } else {
        setShowFilterBar(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
    return <div className="min-h-screen grid place-items-center bg-[#020617] text-slate-500 font-black italic uppercase tracking-[0.4em] animate-pulse">Syncing Echoes...</div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-32">
      <main className="max-w-4xl mx-auto px-6">
        
        {/* HERO TITLE SECTION */}
        <div className="pt-16 pb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 mb-12">
            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-black tracking-widest text-blue-400 uppercase">
                    <Mountain size={10} /> The Soul of Nepal
                </div>
                <h1 className="text-5xl font-bold tracking-tight text-white">
                  Journey Echoes
                </h1>
                <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl italic opacity-80">
                  Traverse raw landscapes and hidden narratives. Every coordinate has a story.
                </p>
            </div>

            <Button
                variant="secondary"
                onClick={fetchStories}
                disabled={fetchingStories}
                className="lg:mb-1 shrink-0 px-8"
                size="lg"
            >
                <RefreshCcw size={16} className={fetchingStories ? "animate-spin mr-2" : "mr-2 text-blue-400 group-hover:rotate-180 transition-transform duration-700"} />
                {fetchingStories ? "Syncing..." : "Sync Journeys"}
            </Button>
        </div>

        {/* FEEDBACK */}
        {(errorMsg || successMsg) && (
          <div className={`mb-12 p-5 rounded-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-500 text-center ${errorMsg ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            <p className="text-sm font-bold flex items-center justify-center gap-2">
              <Sparkles size={16} />
              {errorMsg || successMsg}
            </p>
          </div>
        )}

        {pendingDeleteId && (
          <div className="mb-12 p-5 rounded-2xl border border-red-500/20 bg-red-500/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold text-red-300 uppercase tracking-widest">Confirm Story Deletion</p>
                <p className="text-sm text-slate-300 mt-1">Delete this snapshot from history and remove its uploaded media?</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingDeleteId(null)}
                  className="px-5 py-2.5 rounded-2xl border border-white/10 text-slate-300 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteStory}
                  className="px-5 py-2.5 rounded-2xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-500 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN FEED */}
        <div className="flex flex-col gap-12">
          
          {/* FILTER BAR */}
          <div className={`flex items-center justify-between p-2 bg-slate-900/60 border border-white/5 rounded-2xl sticky top-24 z-20 backdrop-blur-2xl shadow-2xl transition-all duration-500 ${showFilterBar ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}>
              <div className="relative" ref={filterRef}>
                <button 
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className="flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 transition-all active:scale-95"
                >
                  <Filter size={14} className="text-blue-500" />
                  <span>{filter} Stories</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFilterMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-3xl backdrop-blur-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-300 z-30">
                    <FilterOption active={filter === 'recent'} onClick={() => { setFilter('recent'); setIsFilterMenuOpen(false); }} label="Recent" icon={<History size={14} />} />
                    <FilterOption active={filter === 'popular'} onClick={() => { setFilter('popular'); setIsFilterMenuOpen(false); }} label="Popular" icon={<TrendingUp size={14} />} />
                    <FilterOption active={filter === 'all'} onClick={() => { setFilter('all'); setIsFilterMenuOpen(false); }} label="All Stories" icon={<LayoutGrid size={14} />} />
                  </div>
                )}
              </div>

              <div className="hidden sm:flex px-6 items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                  {stories.length} Echoes Discovered
              </div>
          </div>

          <div className="space-y-16">
              {fetchingStories && stories.length === 0 ? (
                  <div className="py-40 text-center text-slate-700 animate-pulse font-bold uppercase tracking-[0.4em] text-sm italic">Unfolding the Narrative...</div>
              ) : filteredStories.length === 0 ? (
                  <div className="py-40 text-center bg-white/[0.01] border border-dashed border-white/5 rounded-[4rem] p-16 flex flex-col items-center group">
                      <div className="relative mb-8 opacity-20 group-hover:opacity-40 transition-opacity">
                          <Mountain size={64} className="text-slate-400" />
                          <Compass size={24} className="absolute -bottom-2 -right-2 text-blue-500 animate-spin-slow" />
                      </div>
                      <h3 className="text-3xl font-bold text-slate-600 mb-4 italic">The peaks are silent</h3>
                      <p className="text-slate-500 font-medium text-sm max-w-xs mx-auto leading-relaxed">No echoes have been released here yet. Be the first to mark your trail.</p>
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

      {/* CREATE STORY FAB */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-12 right-12 h-16 w-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all duration-300 z-40 group"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
      </button>

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
