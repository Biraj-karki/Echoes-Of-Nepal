"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Heart, Trash2, MapPin } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";

type StoryMedia = {
    id?: number | string;
    _id?: string;
    media_url?: string;
    media_type?: string;
};

type Story = {
    id?: number;
    story_id?: number;
    title: string;
    description?: string;
    location_tag?: string;
    created_at?: string;
    createdAt?: string; // fallback
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

interface StoryCardProps {
    story: Story;
    onLike: (id: number) => void;
    onDelete: (id: number) => void;
    onToggleComments: (id: number) => void;
    commentsOpen: boolean;
    commentDraft: string;
    setCommentDraft: (val: string) => void;
    onPostComment: (id: number) => void;
    comments: any[];
    loadingComments: boolean;
    isOwner: boolean;
}

export default function StoryCard({
    story,
    onLike,
    onDelete,
    onToggleComments,
    commentsOpen,
    commentDraft,
    setCommentDraft,
    onPostComment,
    comments,
    loadingComments,
    isOwner,
}: StoryCardProps) {
    const storyId = (story.id ?? story.story_id) as number;
    const when = story.createdAt || story.created_at;

    const mediaList = useMemo(() => Array.isArray(story.media) ? story.media : [], [story.media]);

    return (
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5 overflow-hidden hover:border-white/20 transition-all">
            {/* HEADER */}
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{story.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-400">
                        {story.location_tag && (
                            <span className="flex items-center gap-1 text-sky-400/90">
                                <MapPin size={12} />
                                {story.location_tag}
                            </span>
                        )}
                        {story.location_tag && when && <span className="opacity-30">•</span>}
                        {when && <span>{new Date(when).toLocaleDateString()}</span>}
                    </div>
                </div>

                <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-slate-200">
                        {story.user?.name || story.user_name || "Unknown"}
                    </div>
                    {isOwner && (
                        <button
                            onClick={() => onDelete(storyId)}
                            className="mt-2 text-xs flex items-center gap-1 text-red-400 opacity-60 hover:opacity-100 transition-opacity ml-auto"
                        >
                            <Trash2 size={12} /> Delete
                        </button>
                    )}
                </div>
            </div>

            {/* DESCRIPTION */}
            {story.description && (
                <p className="mt-3 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {story.description}
                </p>
            )}

            {/* MEDIA GRID */}
            {mediaList.length > 0 && (
                <div className={`mt-4 grid gap-2 ${mediaList.length === 1 ? 'grid-cols-1' :
                        mediaList.length === 2 ? 'grid-cols-2' :
                            'grid-cols-2 sm:grid-cols-3'
                    }`}>
                    {mediaList.map((m: any, i: number) => (
                        <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-black/40">
                            {m.media_type === "video" || m.media_url?.match(/\.(mp4|webm|mov)$/i) ? (
                                <video src={m.media_url} controls className="w-full h-full object-cover" />
                            ) : (
                                <img src={m.media_url} alt="Story media" className="w-full h-full object-cover" loading="lazy" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ACTIONS */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-6">
                <button
                    onClick={() => onLike(storyId)}
                    className={`group flex items-center gap-2 text-sm font-medium transition-colors ${story.liked_by_me ? "text-pink-500" : "text-slate-400 hover:text-pink-400"
                        }`}
                >
                    <Heart size={18} className={story.liked_by_me ? "fill-current" : ""} />
                    <span>{story.like_count || 0}</span>
                </button>

                <button
                    onClick={() => onToggleComments(storyId)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${commentsOpen ? "text-blue-400" : "text-slate-400 hover:text-blue-400"
                        }`}
                >
                    <MessageCircle size={18} className={commentsOpen ? "fill-current opacity-20" : ""} />
                    <span>{story.comment_count || 0}</span>
                </button>
            </div>

            {/* COMMENTS SECTION */}
            {commentsOpen && (
                <div className="mt-4 pt-4 border-t border-white/5 bg-black/20 -mx-5 -mb-5 px-5 pb-5">
                    {loadingComments ? (
                        <div className="py-4 text-center text-xs text-slate-500 animate-pulse">Loading comments...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                                {comments.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic text-center py-2">No comments yet.</p>
                                ) : (
                                    comments.map((c) => (
                                        <div key={c.id} className="flex gap-3 text-sm">
                                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                                                {c.user_name?.[0] || "?"}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-slate-300">{c.user_name}</span>
                                                    <span className="text-[10px] text-slate-500">
                                                        {new Date(c.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 mt-0.5">{c.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* WRITE COMMENT */}
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={commentDraft}
                                    onChange={(e) => setCommentDraft(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            onPostComment(storyId);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => onPostComment(storyId)}
                                    disabled={!commentDraft.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
