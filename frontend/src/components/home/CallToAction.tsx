"use client";

import Link from "next/link";
import { PenTool, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/app/LanguageProvider";

export default function CallToAction() {
  const { t } = useLanguage();

  return (
    <section className="eon-section relative overflow-hidden">
      <div className="absolute inset-0 bg-[#020617]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <div className="eon-surface-strong px-6 py-14">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-blue-500/10 text-blue-300">
            <PenTool size={28} />
          </div>

          <div className="eon-pill mx-auto mb-4">
            <Sparkles size={14} />
            {t("cta.badge")}
          </div>

          <h2 className="eon-page-title mx-auto max-w-3xl">
            {t("cta.title")}
          </h2>

          <p className="eon-page-subtitle mx-auto mt-5 max-w-2xl text-lg">
            {t("cta.subtitle")}
          </p>

          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition-all hover:bg-slate-200"
          >
            {t("cta.button")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
