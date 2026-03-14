import Link from "next/link";
import { PenTool, ArrowRight } from "lucide-react";

export default function CallToAction() {
    return (
        <section className="py-24 relative overflow-hidden bg-slate-900">
            {/* Background elements */}
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
            <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <div className="w-16 h-16 mx-auto bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mb-6">
                    <PenTool size={32} />
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Share Your Travel Story</h2>
                
                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Have you explored somewhere amazing in Nepal? Share your story, upload your favorite photos, and inspire other travelers.
                </p>
                
                <Link 
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-slate-200 font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl"
                >
                    Create Story
                    <ArrowRight size={18} />
                </Link>
            </div>
        </section>
    );
}
