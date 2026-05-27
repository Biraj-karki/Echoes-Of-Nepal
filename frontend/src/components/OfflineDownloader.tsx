"use client";

import { Download, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function OfflineDownloader({ targetId, fileName }: { targetId: string, fileName: string }) {
    const [status, setStatus] = useState<"idle" | "generating" | "success">("idle");

    const handleDownload = () => {
        setStatus("generating");
        
        // Use native print with CSS @media print handling the styling
        // This is much more robust with modern Tailwind v4 (oklch colors) than html2canvas
        setTimeout(() => {
            document.title = `${fileName}_Offline_Guide`;
            window.print();
            
            setStatus("success");
            
            // Reset title and status
            setTimeout(() => {
                document.title = "Echoes of Nepal";
                setStatus("idle");
            }, 3000);
        }, 300); // small delay to let UI show generating state
    };

    return (
        <button 
            onClick={handleDownload}
            disabled={status === "generating"}
            className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95
                ${status === "success" 
                    ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                    : status === "generating"
                        ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-white/5"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/20"
                }
            `}
        >
            {status === "idle" && (
                <>
                    <Download size={16} /> Save Offline Guide
                </>
            )}
            {status === "generating" && (
                <>
                    <Loader2 size={16} className="animate-spin" /> Preparing PDF...
                </>
            )}
            {status === "success" && (
                <>
                    <CheckCircle2 size={16} /> Downloaded!
                </>
            )}
        </button>
    );
}
