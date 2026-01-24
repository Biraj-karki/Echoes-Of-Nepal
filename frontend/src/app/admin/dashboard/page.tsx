"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Users, Images } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [usersCount, setUsersCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("admin_token") || "";
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setErr(null);

      const [uRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
        fetch(`${API_BASE}/api/admin/stories`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ]);

      const uData = await uRes.json();
      const sData = await sRes.json();

      if (!uRes.ok) throw new Error(uData.error || "Failed loading users");
      if (!sRes.ok) throw new Error(sData.error || "Failed loading stories");

      setUsersCount((uData.users || []).length);
      setStoriesCount((sData.stories || []).length);
    } catch (e: any) {
      setErr(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Quick overview & moderation stats.</p>
        </div>

        <button
          onClick={fetchSummary}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 font-extrabold hover:bg-white/10"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 font-semibold">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 grid place-items-center">
              <Users className="text-emerald-300" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total users</div>
              <div className="text-3xl font-black">
                {loading ? "…" : usersCount}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 grid place-items-center">
              <Images className="text-blue-300" size={20} />
            </div>
            <div>
              <div className="text-sm text-slate-400">Total stories</div>
              <div className="text-3xl font-black">
                {loading ? "…" : storiesCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-lg font-black">Next improvements</div>
        <ul className="mt-2 text-slate-300 list-disc pl-5 space-y-1">
          <li>Charts (stories per day, new users)</li>
          <li>Report flags & moderation notes</li>
          <li>User role / ban system</li>
        </ul>
      </div>
    </div>
  );
}
