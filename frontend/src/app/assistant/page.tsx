"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, Loader2, Compass, Map, Clock, Zap } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import DestinationCard from "@/components/DestinationCard";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    destinations?: any[];
    timestamp: Date;
}

const QUICK_PROMPTS = [
    { label: "Plan a 3-day trip to Pokhara", icon: <Compass size={14} /> },
    { label: "Short trek near Kathmandu", icon: <Map size={14} /> },
    { label: "Budget travel in Nepal", icon: <Zap size={14} /> },
    { label: "Best places this season", icon: <Clock size={14} /> },
];

export default function AssistantPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "initial",
            role: "assistant",
            content: "Hi! I'm your Echoes of Nepal travel assistant. I can help you plan trips, find treks, and explore the hidden gems of Nepal. What's on your mind today? ✨",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
            const response = await fetch(`${apiBase}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: text,
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await response.json();

            if (data.success) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.message,
                    destinations: data.destinations,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, aiMsg]);
            } else {
                throw new Error(data.error || "Failed to get AI response");
            }
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please make sure Ollama is running and try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromptClick = (label: string) => {
        handleSend(label);
    };

    return (
        <main className="min-h-[calc(100vh-64px)] bg-[#020617] text-slate-200 py-10 px-4">
            <div className="max-w-4xl mx-auto w-full flex flex-col h-[750px] bg-[#0f172a] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">Travel Assistant</h1>
                            <p className="text-xs text-slate-400">Powered by Echoes of Nepal AI</p>
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Online
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                                    msg.role === "user" 
                                    ? "bg-blue-600 border-white/10" 
                                    : "bg-slate-800 border-white/5"
                                }`}>
                                    {msg.role === "user" ? <User size={14} className="text-white" /> : <Bot size={14} className="text-blue-400" />}
                                </div>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === "user"
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/10 rounded-tr-none"
                                    : "bg-slate-800/50 text-slate-200 border border-white/5 rounded-tl-none"
                                }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                    
                                    {msg.destinations && msg.destinations.length > 0 && (
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {msg.destinations.map((dest: any) => (
                                                <div key={dest.id} className="w-full max-w-[280px]">
                                                    <DestinationCard destination={dest} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className={`text-[10px] mt-2 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                                    <Bot size={14} className="text-blue-400" />
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-blue-400" />
                                    <span className="text-sm text-slate-400 italic">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white/5 border-t border-white/10 space-y-4">
                    {/* Suggestion Chips */}
                    {!isLoading && messages.length < 5 && (
                        <div className="flex flex-wrap gap-2">
                            {QUICK_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt.label}
                                    onClick={() => handlePromptClick(prompt.label)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-white/10 text-xs text-slate-300 hover:bg-slate-700 hover:border-blue-500/50 hover:text-white transition-all active:scale-95"
                                >
                                    {prompt.icon}
                                    {prompt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                        className="relative flex items-center"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about treks, places, or plan a trip..."
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p className="text-[10px] text-center text-slate-500">
                        AI can make mistakes. Consider checking important travel information locally.
                    </p>
                </div>
            </div>
        </main>
    );
}
