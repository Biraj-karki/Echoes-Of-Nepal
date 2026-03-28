"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";

interface SaveButtonProps {
    itemType: "destination" | "story" | "trek";
    itemId: string | number;
    className?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function SaveButton({ itemType, itemId, className = "" }: SaveButtonProps) {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkSaved = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE}/api/saved/check?item_type=${itemType}&item_id=${itemId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setIsSaved(data.isSaved);
                }
            } catch (err) {
                console.error("Check saved status error:", err);
            }
        };

        checkSaved();
    }, [user, itemType, itemId]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            // Redirect to login or show tooltip
            window.location.href = "/login";
            return;
        }

        const previousState = isSaved;
        setIsSaved(!previousState); // Optimistic Update

        try {
            const token = localStorage.getItem("token");
            if (!previousState) {
                // Save item
                const res = await fetch(`${API_BASE}/api/saved`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ item_type: itemType, item_id: itemId.toString() })
                });
                if (!res.ok) throw new Error("Failed to save");
            } else {
                // Unsave item
                const res = await fetch(`${API_BASE}/api/saved`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ item_type: itemType, item_id: itemId.toString() })
                });
                if (!res.ok) throw new Error("Failed to unsave");
            }
        } catch (err) {
            console.error("Toggle save error:", err);
            setIsSaved(previousState); // Rollback on error
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            disabled={isLoading}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 border ${
                isSaved 
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                : "bg-black/40 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
            } ${className}`}
        >
            <Bookmark size={16} className={isSaved ? "fill-current" : ""} />
        </button>
    );
}
