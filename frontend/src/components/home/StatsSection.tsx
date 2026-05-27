"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, BookHeart, MountainSnow } from "lucide-react";
import { useLanguage } from "@/app/LanguageProvider";
import { API_BASE } from "@/lib/api";

export default function StatsSection() {
  const { t } = useLanguage();
  const [stats, setStats] = useState([
    { labelKey: "stats.districts", value: "77", icon: MapPin },
    { labelKey: "stats.destinations", value: "120+", icon: Navigation },
    { labelKey: "stats.stories", value: "300+", icon: BookHeart },
    { labelKey: "stats.treks", value: "40+", icon: MountainSnow },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tourism/stats`);
        if (!res.ok) {
          throw new Error(`Stats request failed with status ${res.status}`);
        }

        const data = await res.json();
        setStats([
          { labelKey: "stats.districts", value: data.districts.toString(), icon: MapPin },
          { labelKey: "stats.destinations", value: data.destinations.toString(), icon: Navigation },
          { labelKey: "stats.stories", value: data.stories.toString(), icon: BookHeart },
          { labelKey: "stats.treks", value: data.treks.toString(), icon: MountainSnow },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="px-6 py-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="eon-surface p-6 text-center transition-transform hover:-translate-y-1">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-blue-500/10 text-blue-300">
                <Icon size={22} />
              </div>
              <div className="text-3xl font-black tracking-tight text-white">{stat.value}</div>
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.28em] text-slate-500">{t(stat.labelKey)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
