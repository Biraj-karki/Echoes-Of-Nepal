"use client";

import Link from "next/link";
import { Map, BookOpen, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/app/LanguageProvider";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="absolute inset-0">
        <img
          src="/mountain.jpg"
          alt="Nepal mountain landscape"
          className="h-full w-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/30 via-[#020617]/68 to-[#020617]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="eon-pill mb-6">
              <Sparkles size={14} />
              {t("hero.badge")}
            </div>

            <h1 className="eon-page-title max-w-4xl">
              {t("hero.title")}
            </h1>

            <p className="eon-page-subtitle mt-6 max-w-2xl text-lg lg:text-xl">
              {t("hero.subtitle")}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500"
              >
                <Map size={18} />
                {t("hero.ctaExplore")}
                <ArrowRight size={16} />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-100 transition-all hover:border-white/20 hover:bg-white/8"
              >
                <BookOpen size={18} />
                {t("hero.ctaStories")}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                {t("hero.verified")}
              </div>
              <div className="h-1 w-1 rounded-full bg-slate-700" />
              <div>{t("hero.meta")}</div>
            </div>
          </div>

          <div className="eon-surface-strong overflow-hidden">
            <div className="relative aspect-[4/5]">
              <img
                src="/mountain.jpg"
                alt="Echoes of Nepal preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{t("hero.cardEyebrow")}</div>
                <div className="mt-2 text-xl font-black text-white">{t("hero.cardTitle")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
