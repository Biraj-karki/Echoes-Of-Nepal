"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MountainSnow, Calendar, Compass, Filter, ChevronDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { API_BASE } from "@/lib/api";

type Trek = {
  id: number;
  featured?: boolean;
  created_at: string;
  image: string;
  name: string;
  difficulty: string;
  altitude?: string;
  duration?: string;
  district_name?: string;
  description?: string;
};

const difficultyOrder: Record<string, number> = {
  easy: 1,
  moderate: 2,
  challenging: 3,
  difficult: 3,
  hard: 3,
};

export default function TreksPage() {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "recent" | "difficulty">("featured");
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const fetchTreks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/tourism/treks`);
        if (res.ok) {
          const data = await res.json();
          setTreks(data.treks || []);
        }
      } catch (err) {
        console.error("Failed to fetch treks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreks();
  }, []);

  const filteredTreks = useMemo(() => {
    const list = [...treks].filter((trek) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        trek.name.toLowerCase().includes(q) ||
        (trek.district_name || "").toLowerCase().includes(q) ||
        (trek.difficulty || "").toLowerCase().includes(q) ||
        (trek.description || "").toLowerCase().includes(q);
      const matchesDifficulty =
        difficulty === "all" || (trek.difficulty || "").toLowerCase().includes(difficulty);
      return matchesSearch && matchesDifficulty;
    });

    return list.sort((a, b) => {
      if (sortBy === "difficulty") {
        const aScore = difficultyOrder[(a.difficulty || "").toLowerCase()] || 0;
        const bScore = difficultyOrder[(b.difficulty || "").toLowerCase()] || 0;
        return bScore - aScore;
      }

      if (sortBy === "recent") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [treks, searchTerm, difficulty, sortBy]);

  return (
    <main className="min-h-screen bg-[#020617] pb-24">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Explore
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300">
                Treks
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  All Treks
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Explore every trail in one clean browse view, then sort by freshness, difficulty, or highlight the featured routes.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <div className="relative w-full lg:w-[320px]">
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search treks"
                  className="eon-input h-12 rounded-full pl-11 pr-4 text-sm"
                />
              </div>
              <Button variant="outline" onClick={() => setShowSortMenu((p) => !p)} className="justify-center" size="md">
                <Filter size={16} className="mr-2" />
                {sortBy === "featured" ? "Featured first" : sortBy === "recent" ? "Newest first" : "Hardest first"}
                <ChevronDown size={14} className={`ml-2 transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>

          {showSortMenu && (
            <div className="mt-4 inline-flex flex-wrap gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-2 backdrop-blur-xl">
              {[
                { key: "featured", label: "Featured" },
                { key: "recent", label: "Newest" },
                { key: "difficulty", label: "Difficulty" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setSortBy(item.key as typeof sortBy);
                    setShowSortMenu(false);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                    sortBy === item.key
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {["all", "easy", "moderate", "challenging"].map((item) => (
            <button
              key={item}
              onClick={() => setDifficulty(item)}
              className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] transition-all ${
                difficulty === item
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-white/5 bg-white/[0.03] text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="eon-surface h-[420px] animate-pulse" />
            ))}
          </div>
        ) : filteredTreks.length === 0 ? (
          <div className="eon-surface py-20 text-center">
            <h3 className="text-2xl font-black text-white">No treks found</h3>
            <p className="mt-2 text-sm text-slate-400">Try another search or change the difficulty filter.</p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">
                {filteredTreks.length} treks
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTreks.map((trek) => (
                <Link
                  href={`/trek/${trek.id}`}
                  key={trek.id}
                  className="group eon-surface overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-800">
                    <img
                      src={trek.image}
                      alt={trek.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                      {trek.difficulty}
                    </div>
                    {trek.altitude && (
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2 py-1.5 text-xs font-bold text-sky-400 backdrop-blur-md">
                        <MountainSnow size={12} />
                        <span>{trek.altitude}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-black text-white transition-colors group-hover:text-emerald-300">
                      {trek.name}
                    </h3>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                      <Calendar size={15} className="text-blue-400" />
                      <span>{trek.duration || "Duration not set"}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                      <Compass size={15} className="text-emerald-400" />
                      <span>{trek.district_name || "Unknown district"}</span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-300">
                      {trek.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
