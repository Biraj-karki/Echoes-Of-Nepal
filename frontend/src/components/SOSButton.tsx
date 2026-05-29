'use client'

import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

type SOSButtonProps = {
    onClick?: () => void;
    className?: string;
};

export default function SOSButton({ onClick, className = "" }: SOSButtonProps) {
    return (
        <Link
            href="/sos"
            onClick={onClick}
            aria-label="Emergency SOS"
            className={`flex items-center gap-2 font-bold px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-all duration-300 group shadow-lg shadow-red-500/5 hover:shadow-red-500/10 ${className}`}
        >
            <AlertCircle className="w-5 h-5 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="text-[11px] sm:text-[10px] font-black uppercase tracking-[0.16em] sm:tracking-[0.2em] leading-none">
                Emergency SOS
            </span>
        </Link>
    );
}
