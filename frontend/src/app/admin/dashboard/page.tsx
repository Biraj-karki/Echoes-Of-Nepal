"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Users, Images } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { API_BASE } from "@/lib/api";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [usersCount, setUsersCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

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

      const usersList = uData.users || [];
      const storiesList = sData.stories || [];

      setUsersCount(usersList.length);
      setStoriesCount(storiesList.length);

      // Process chart data
      const dateMap: Record<string, { date: string; newUsers: number; newStories: number }> = {};
      
      const processDate = (isoString: string) => {
          if (!isoString) return null;
          const d = new Date(isoString);
          if (isNaN(d.getTime())) return null;
          return d.toISOString().split('T')[0];
      };

      usersList.forEach((u: any) => {
          const d = processDate(u.created_at);
          if (d) {
              if (!dateMap[d]) dateMap[d] = { date: d, newUsers: 0, newStories: 0 };
              dateMap[d].newUsers++;
          }
      });

      storiesList.forEach((s: any) => {
          const d = processDate(s.created_at);
          if (d) {
              if (!dateMap[d]) dateMap[d] = { date: d, newUsers: 0, newStories: 0 };
              dateMap[d].newStories++;
          }
      });

      const sortedData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
      setChartData(sortedData.slice(-30)); // Last 30 active days
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

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mt-4 h-96 flex flex-col">
        <div className="text-lg font-black mb-6">Growth Analytics (Last 30 Days)</div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              <Line type="monotone" dataKey="newStories" name="New Stories" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
