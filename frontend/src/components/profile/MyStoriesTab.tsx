import React, { useState, useEffect } from 'react';
import StoryCard from '@/components/StoryCard';
import { API_BASE } from '@/lib/api';

export default function MyStoriesTab({ user }: { user?: any }) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsOpenId, setCommentsOpenId] = useState<number | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [storyComments, setStoryComments] = useState<Record<number, any[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteMsg, setDeleteMsg] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchMyStories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/stories/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStories(data.stories || []);
    } catch (err) {
      console.error("Error fetching my stories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyStories();
  }, []);

  const handleLike = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/stories/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Optimistic update or refetch
        fetchMyStories();
      }
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteError("");
    setDeleteMsg("");
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/stories/${pendingDeleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setStories(prev => prev.filter(s => (s.id || s.story_id) !== pendingDeleteId));
        setDeleteMsg("Story deleted successfully.");
        setPendingDeleteId(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || "Failed to delete story.");
        setPendingDeleteId(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("Something went wrong while deleting the story.");
      setPendingDeleteId(null);
    }
  };

  const toggleComments = async (id: number) => {
    if (commentsOpenId === id) {
      setCommentsOpenId(null);
      return;
    }
    setCommentsOpenId(id);
    if (!storyComments[id]) {
      fetchComments(id);
    }
  };

  const fetchComments = async (id: number) => {
    setLoadingComments(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/stories/${id}/comments`);
      const data = await res.json();
      setStoryComments(prev => ({ ...prev, [id]: data.comments || [] }));
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePostComment = async (id: number) => {
    const text = commentDrafts[id];
    if (!text?.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/stories/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setCommentDrafts(prev => ({ ...prev, [id]: "" }));
        fetchComments(id);
        setStories(prev => prev.map(s => (s.id || s.story_id) === id ? { ...s, comment_count: (Number(s.comment_count) || 0) + 1 } : s));
      }
    } catch (err) {
      console.error("Post comment error:", err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Retrieving your legends...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="border-b border-white/5 pb-6 flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black text-white tracking-tight">My Stories</h3>
          <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-semibold">Your chronicles across the mountain peaks</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
          <span className="text-blue-400 font-bold text-sm">{stories.length}</span>
        </div>
      </div>

      {pendingDeleteId && (
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 px-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-red-300">Confirm Story Deletion</p>
            <p className="text-sm text-slate-300 mt-1">Delete this story and its uploaded media from your history?</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPendingDeleteId(null)}
              className="px-5 py-2.5 rounded-2xl border border-white/10 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-5 py-2.5 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {deleteMsg && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-xs font-medium text-emerald-300">
          {deleteMsg}
        </div>
      )}

      {deleteError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-xs font-medium text-red-300">
          {deleteError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {stories.map((story: any) => {
          const sId = story.id || story.story_id;
          return (
            <div key={sId} className="transition-all duration-300 hover:translate-y-[-4px]">
              <StoryCard
                story={story}
                onLike={handleLike}
                onDelete={handleDelete}
                onToggleComments={toggleComments}
                commentsOpen={commentsOpenId === sId}
                commentDraft={commentDrafts[sId] || ""}
                setCommentDraft={(val) => setCommentDrafts(prev => ({ ...prev, [sId]: val }))}
                onPostComment={handlePostComment}
                comments={storyComments[sId] || []}
                loadingComments={loadingComments[sId] || false}
                isOwner={true}
              />
            </div>
          );
        })}
      </div>

      {stories.length === 0 && (
        <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center space-y-6 group">
          <div className="h-20 w-20 rounded-full bg-slate-900/60 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-white tracking-tight">The ink remains dry...</h4>
            <p className="text-slate-500 max-w-xs mx-auto font-medium text-sm leading-relaxed">
              Every adventurer has a tale. Share your first discovery with the Echoes of Nepal community.
            </p>
          </div>
          <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20">
            Share a Story
          </button>
        </div>
      )}
    </div>
  );
}
