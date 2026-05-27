"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, DollarSign, Navigation, RotateCcw, Compass } from "lucide-react";
import { API_BASE } from "@/lib/api";

const QUICK_PROMPTS = [
    { emoji: "🏔️", label: "Everest trekking adventure" },
    { emoji: "🛕", label: "Ancient temples & culture in Kathmandu" },
    { emoji: "💎", label: "Hidden gems off the beaten path" },
    { emoji: "🌊", label: "Lakes and peaceful nature escapes" },
    { emoji: "🦁", label: "Wildlife safari on a budget" },
    { emoji: "🧘", label: "Spiritual journey to Lumbini" },
];

export default function AiRecommendations() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<"ai" | "fallback" | null>(null);
    const [displayedPrompt, setDisplayedPrompt] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    const parsePrompt = (text: string) => {
        // Extract location, budget, interest from natural text
        const lower = text.toLowerCase();
        const trekKeywords = ["trek", "trekking", "hike", "hikimg", "hiking", "trail", "climb", "adventure", "base camp", "mountain", "everest", "annapurna"];
        const cultureKeywords = ["temple", "culture", "heritage", "spiritual", "buddha", "lumbini", "kathmandu", "historical"];
        const budgetKeywords = ["budget", "cheap", "affordable", "backpacker"];
        const luxuryKeywords = ["luxury", "premium", "high-end", "upscale"];

        let interest = "Nature, Culture";
        if (trekKeywords.some(k => lower.includes(k))) interest = "Trekking";
        else if (cultureKeywords.some(k => lower.includes(k))) interest = "Culture";

        let budget = "Mixed";
        if (budgetKeywords.some(k => lower.includes(k))) budget = "Budget";
        else if (luxuryKeywords.some(k => lower.includes(k))) budget = "Luxury";

        return { location: "", budget, interest };
    };

    const handleAsk = async (text?: string) => {
        const query = (text || prompt).trim();
        if (!query) return;

        setDisplayedPrompt(query);
        setLoading(true);
        setError(null);
        setHasSearched(true);
        setRecommendations([]);

        const parsed = parsePrompt(query);

        try {
            const res = await fetch(`${API_BASE}/api/ai/recommendations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(parsed),
            });

            const data = await res.json();
            if (res.ok) {
                setRecommendations(data.recommendations || []);
                setSource(data.source === "ai" ? "ai" : "fallback");
                setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
            } else {
                setError(data.error || "Failed to get recommendations.");
            }
        } catch {
            setError("Connection error. Please check your backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleChip = (label: string) => {
        setPrompt(label);
        handleAsk(label);
    };

    const handleReset = () => {
        setPrompt("");
        setHasSearched(false);
        setRecommendations([]);
        setError(null);
        setSource(null);
        setDisplayedPrompt("");
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    };

    return (
        <section id="ai-recommendations" className="py-28 bg-[#020617] relative overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/8 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="relative inline-flex mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center backdrop-blur-sm shadow-2xl shadow-blue-500/10">
                            <Sparkles size={28} className="text-blue-400" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full" />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight">
                        Ask the AI Oracle
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Describe your dream Nepal trip in plain words — the AI will find the perfect match.
                    </p>
                </div>

                {/* Chat Input */}
                <div className="relative mb-5">
                    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300 focus-within:border-blue-500/40 focus-within:shadow-blue-500/10">
                        <textarea
                            ref={textareaRef}
                            rows={2}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. I want to trek near Everest on a budget..."
                            className="w-full bg-transparent px-6 pt-5 pb-4 pr-16 text-white placeholder:text-slate-600 text-base resize-none focus:outline-none leading-relaxed min-h-[72px] max-h-48"
                            disabled={loading}
                        />
                        {/* Send button inside textarea */}
                        <button
                            onClick={() => handleAsk()}
                            disabled={loading || !prompt.trim()}
                            className="absolute bottom-4 right-4 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95"
                        >
                            {loading ? (
                                <Loader2 size={16} className="text-white animate-spin" />
                            ) : (
                                <Send size={15} className="text-white translate-x-[1px]" />
                            )}
                        </button>
                    </div>
                    <p className="text-slate-600 text-xs mt-2 ml-1">Press Enter to ask · Shift+Enter for new line</p>
                </div>

                {/* Quick Prompt Chips */}
                {!hasSearched && (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {QUICK_PROMPTS.map((chip) => (
                            <button
                                key={chip.label}
                                onClick={() => handleChip(chip.label)}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-slate-300 hover:text-white text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <span>{chip.emoji}</span>
                                {chip.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* RESULTS AREA */}
                <div ref={resultsRef}>
                    {/* Loading - Typing indicator */}
                    {loading && (
                        <div className="mt-12">
                            {/* Echo of user's prompt */}
                            <div className="flex justify-end mb-6">
                                <div className="max-w-md bg-blue-600/20 border border-blue-500/20 rounded-2xl rounded-tr-sm px-5 py-3 text-sm text-blue-100 font-medium">
                                    {displayedPrompt}
                                </div>
                            </div>
                            {/* AI thinking bubble */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Sparkles size={14} className="text-blue-400" />
                                </div>
                                <div className="bg-white/[0.04] border border-white/8 rounded-2xl rounded-tl-sm px-5 py-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-2">Consulting the AI Oracle...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="mt-10 text-center p-8 bg-red-500/5 border border-red-500/15 rounded-2xl">
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                            <button onClick={handleReset} className="mt-3 text-slate-500 hover:text-white text-xs flex items-center gap-1.5 mx-auto transition-colors">
                                <RotateCcw size={12} /> Try again
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && !error && recommendations.length > 0 && (
                        <div className="mt-12">
                            {/* Prompt echo + AI reply header */}
                            <div className="flex justify-end mb-6">
                                <div className="max-w-md bg-blue-600/20 border border-blue-500/20 rounded-2xl rounded-tr-sm px-5 py-3 text-sm text-blue-100 font-medium">
                                    {displayedPrompt}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 mb-8">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Sparkles size={14} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-semibold">
                                        {source === "fallback"
                                            ? "Here are some popular picks from our collection:"
                                            : "Here are my top picks for your trip:"}
                                    </p>
                                    {source === "fallback" && (
                                        <p className="text-amber-400/70 text-xs mt-0.5 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full inline-block" />
                                            AI quota reached today — showing featured destinations
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {recommendations.map((item, i) => (
                                    <div
                                        key={i}
                                        className="group relative bg-white/[0.03] rounded-2xl border border-white/[0.07] overflow-hidden hover:border-white/20 transition-all duration-500 hover:-translate-y-1.5 shadow-xl hover:shadow-blue-500/10"
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    >
                                        {/* Image */}
                                        <div className="relative h-44 overflow-hidden bg-slate-800/50">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80";
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                            {/* Type badge */}
                                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                                                {item.type}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="text-white font-bold text-base mb-1 leading-snug">{item.name}</h3>
                                            <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{item.description}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 text-blue-400 text-xs font-semibold">
                                                    <DollarSign size={11} />
                                                    <span>{item.price || "Free Entry"}</span>
                                                </div>
                                                <button className="flex items-center gap-1 text-slate-500 hover:text-white text-xs font-medium transition-colors group/link">
                                                    Explore
                                                    <Navigation size={10} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Ask another */}
                            <div className="mt-8 text-center">
                                <button
                                    onClick={handleReset}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-white text-sm font-medium transition-all duration-200"
                                >
                                    <RotateCcw size={14} />
                                    Ask something else
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && hasSearched && recommendations.length === 0 && (
                        <div className="mt-12 text-center py-16 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                            <Compass size={40} className="mx-auto text-slate-700 mb-3" />
                            <h3 className="text-white font-bold mb-1">No matches found</h3>
                            <p className="text-slate-500 text-sm">Try something like &quot;trekking near Pokhara&quot; or &quot;wildlife safari&quot;</p>
                            <button onClick={handleReset} className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                                Try again →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
