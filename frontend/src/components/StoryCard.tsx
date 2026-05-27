"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Heart, Trash2, MapPin, Share2, Send, Bookmark, Compass } from "lucide-react";
import SaveButton from "./SaveButton";

type StoryMedia = {
    id?: number | string;
    _id?: string;
    media_url?: string;
    media_type?: string;
};

export type Story = {
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
    author_profile_image?: string;
    like_count?: number;
    comment_count?: number;
    liked_by_me?: boolean;
    user?: {
        id?: number;
        name?: string;
        email?: string;
        picture_url?: string;
        profile_image?: string;
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
    const firstMedia = mediaList[0];

    return (
        <div className="bg-[#0f172a]/40 border border-white/5 rounded-[3rem] overflow-hidden hover:border-blue-500/30 transition-all duration-700 group flex flex-col shadow-2xl hover:shadow-blue-500/10 hover:translate-y-[-8px] hover:scale-[1.01]">
            {/* CARD HEADER */}
            <div className="p-7 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 p-[1px] border border-white/10 overflow-hidden shrink-0 group-hover:rotate-6 transition-transform duration-700">
                        {story.author_profile_image || story.user?.picture_url || story.user?.profile_image ? (
                            <img 
                                src={story.author_profile_image || story.user?.picture_url || story.user?.profile_image} 
                                alt={story.user_name || "Author"} 
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full flex items-center justify-center text-sm font-black text-slate-500 bg-slate-900 italic">
                                {(story.user?.name || story.user_name || "U")[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-[13px] font-black text-white italic tracking-tight">{story.user?.name || story.user_name || "Unknown Adventurer"}</div>
                        <div className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/5 w-fit">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{when ? new Date(when).toLocaleDateString() : "Timestamp Missing"}</span>
                        </div>
                    </div>
                </div>
                
                {isOwner && (
                    <button onClick={() => onDelete(storyId)} className="p-3 text-slate-700 hover:text-red-500 transition-all hover:bg-red-500/5 rounded-2xl">
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* MEDIA FOCUS */}
            {firstMedia ? (
              <div className="px-7 pb-2">
                  <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden bg-black/40 border border-white/5 shadow-inner">
                      {firstMedia.media_type === "video" || firstMedia.media_url?.match(/\.(mp4|webm|mov)$/i) ? (
                          <video src={firstMedia.media_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" muted loop autoPlay playsInline />
                      ) : (
                          <img src={firstMedia.media_url} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      )}
                      
                      {/* VIGNETTE GRADIENT */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                      
                      {/* OVERLAY CONTENT */}
                      <div className="absolute bottom-8 left-8 right-8 space-y-2">
                          {story.location_tag && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full w-fit">
                                  <MapPin size={10} className="text-emerald-400" />
                                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{story.location_tag}</span>
                              </div>
                          )}
                          <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none drop-shadow-2xl uppercase group-hover:translate-x-2 transition-transform duration-700">{story.title}</h3>
                      </div>
                  </div>
              </div>
            ) : (
                <div className="px-9 py-6 border-l-2 border-blue-500/30 bg-blue-500/[0.02] mx-7 rounded-3xl mb-4">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">{story.title}</h3>
                    {story.location_tag && (
                      <span className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                          <MapPin size={12} /> {story.location_tag}
                      </span>
                    )}
                </div>
            )}
            
            {/* DESCRIPTION */}
            {story.description && (
                <div className="px-9 py-4">
                    <p className="text-[13px] font-medium text-slate-400 leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                        <span className="text-blue-500 pr-1">"</span>
                        {story.description}
                        <span className="text-blue-500 pl-1">"</span>
                    </p>
                </div>
            )}

            {/* SUB-GALLERY */}
            {mediaList.length > 1 && (
                <div className="px-7 py-3 flex gap-3 overflow-x-auto no-scrollbar pb-6">
                  {mediaList.slice(1).map((m, i) => (
                    <div key={i} className="h-20 aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shrink-0 opacity-40 hover:opacity-100 hover:scale-105 transition-all duration-500 shadow-xl">
                        <img src={m.media_url} alt="Gallery" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <div className="h-20 aspect-video rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center shrink-0 opacity-20">
                      <Compass size={16} />
                  </div>
                </div>
            )}

            {/* ACTION CENTER */}
            <div className="px-7 py-6 mt-auto flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onLike(storyId)}
                        className={`group flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${story.liked_by_me ? 'bg-pink-500 text-white shadow-xl shadow-pink-500/20' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Heart size={14} className={story.liked_by_me ? "fill-current" : "group-hover:scale-125 transition-transform"} />
                        <span>{story.like_count || 0}</span>
                    </button>

                    <button
                        onClick={() => onToggleComments(storyId)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${commentsOpen ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                    >
                        <MessageCircle size={14} />
                        <span>{story.comment_count || 0}</span>
                    </button>
                    
                    <button className="p-3 text-slate-700 hover:text-blue-400 transition-all hover:bg-white/5 rounded-2xl">
                        <Share2 size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <SaveButton itemType="story" itemId={storyId} />
                </div>
            </div>

            {/* COMMENTS PANEL */}
            {commentsOpen && (
                <div className="px-9 pb-9 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-7 shadow-inner">
                        {loadingComments ? (
                            <div className="py-6 text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 animate-pulse">Syncing Journey Narrative...</div>
                        ) : (
                            <div className="space-y-8">
                                <div className="max-h-72 overflow-y-auto space-y-6 pr-3 custom-scrollbar">
                                    {comments.length === 0 ? (
                                        <div className="text-center py-10 flex flex-col items-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
                                            <MessageCircle size={32} />
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">The Silence of the Himalayas</p>
                                        </div>
                                    ) : (
                                        comments.map((c) => (
                                            <div key={c.id} className="flex gap-5 group/comment">
                                                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-900 to-black border border-white/10 flex items-center justify-center font-black text-[11px] shrink-0 text-slate-500 italic rotate-3 group-hover/comment:rotate-0 transition-transform">
                                                    {c.user_name?.[0] || "?"}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-end gap-3 text-xs">
                                                        <span className="font-black text-white italic tracking-tight">{c.user_name}</span>
                                                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                                                            {new Date(c.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-[12px] text-slate-400 font-medium leading-relaxed italic border-l-2 border-white/5 pl-4">"{c.text}"</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-white/5">
                                    <input
                                        type="text"
                                        value={commentDraft}
                                        onChange={(e) => setCommentDraft(e.target.value)}
                                        placeholder="Add your voice to this echo..."
                                        className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:outline-none focus:border-blue-500/20 transition-all placeholder:text-slate-800"
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
                                        className="w-14 h-14 bg-white text-black hover:bg-blue-600 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-2xl shadow-blue-500/10 disabled:opacity-20 active:scale-95"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
