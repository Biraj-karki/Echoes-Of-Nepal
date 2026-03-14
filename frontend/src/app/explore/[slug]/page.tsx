"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

type StoryMedia = {
  id?: number | string;
  media_url?: string;
  media_type?: string;
};

type Story = {
  id: number;
  title: string;
  description?: string;
  location_tag?: string;
  created_at?: string;
  createdAt?: string;
  user_name?: string;
  user_email?: string;
  media?: StoryMedia[];
};

const resolveUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

const normalizeKey = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

export default function DestinationPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch(`${API_BASE}/api/stories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });

        const data = await res.json();
        const list: Story[] = Array.isArray(data?.stories) ? data.stories : [];

        const filtered = list.filter((s) => {
          const loc = (s.location_tag || "").trim();
          return loc && normalizeKey(loc) === slug;
        });

        setStories(filtered);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug]);

  const locationName = useMemo(() => {
    if (stories.length > 0) return stories[0].location_tag || "Destination";
    return "Destination";
  }, [stories]);

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-extrabold hover:bg-white/10"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mt-6">
          <div className="text-sm text-slate-400">Destination</div>
          <h1 className="mt-2 text-3xl font-black flex items-center gap-2">
            <MapPin size={22} className="text-emerald-300" />
            {locationName}
          </h1>
          <p className="mt-2 text-slate-400">
            Real stories posted by travelers and locals.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 text-slate-400">Loading stories…</div>
        ) : stories.length === 0 ? (
          <div className="mt-8 text-slate-400">
            No stories found for this destination yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {stories.map((s) => (
              <div
                key={s.id}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="font-black text-lg">{s.title}</div>
                <div className="text-xs text-slate-400 mt-1">
                  by {s.user_name || "Unknown"} {s.createdAt || s.created_at ? "• " : ""}
                  {s.createdAt || s.created_at
                    ? new Date(s.createdAt || s.created_at!).toLocaleString()
                    : ""}
                </div>

                {s.description && (
                  <p className="mt-3 text-slate-200">{s.description}</p>
                )}

                {Array.isArray(s.media) && s.media.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.media.slice(0, 6).map((m, i) => {
                      const url = resolveUrl(m.media_url || "");
                      const type = (m.media_type || "").toLowerCase();
                      const isVideo =
                        type.includes("video") || /\.(mp4|mov|webm)$/i.test(url);

                      return (
                        <div
                          key={String(m.id ?? i)}
                          className="w-[180px] overflow-hidden rounded-2xl border border-white/10 bg-black/30"
                        >
                          {isVideo ? (
                            <video src={url} controls className="w-full h-[120px] object-cover" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt="media" className="w-full h-[120px] object-cover" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
