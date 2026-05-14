import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface AlertProps {
    type: "error" | "success";
    message: string;
    className?: string;
}

export const Alert = ({ type, message, className = "" }: AlertProps) => {
    if (!message) return null;

    const isError = type === "error";

    return (
        <div 
            className={`flex items-center gap-3 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 ${
                isError 
                    ? "bg-red-500/10 border border-red-500/20 text-red-500" 
                    : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
            } ${className}`}
        >
            {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <p className="text-[11px] font-bold uppercase tracking-widest">{message}</p>
        </div>
    );
};
