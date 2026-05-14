'use client'

import React from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function SOSButton() {
    return (
        <Link
            href="/sos"
            className="flex items-center gap-2 font-bold px-4 py-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-all duration-300 group shadow-lg shadow-red-500/5 hover:shadow-red-500/10"
        >
            <AlertCircle className="w-5 h-5 animate-pulse group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.2em]">Emergency SOS</span>
        </Link>
    );
}
