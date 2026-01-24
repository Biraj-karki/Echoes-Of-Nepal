"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr(null);

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const [uRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/stories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const uData = await uRes.json();
      const sData = await sRes.json();

      if (!uRes.ok) throw new Error(uData.error || "Failed loading users");
      if (!sRes.ok) throw new Error(sData.error || "Failed loading stories");

      setUsers(uData.users || []);
      setStories(sData.stories || []);
    } catch (e: any) {
      setErr(e.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.replace("/admin/login");
  };

  const deleteStory = async (storyId: number) => {
    if (!confirm("Delete this story as admin?")) return;

    const res = await fetch(`${API_BASE}/api/admin/stories/${storyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Delete failed");
      return;
    }

    setStories((p) => p.filter((s) => s.id !== storyId));
  };

  if (loading) return <div className="p-6 text-slate-200">Loading…</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage users & stories.</p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 font-semibold">
            {err}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Users */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-extrabold">Users ({users.length})</h2>
            <div className="mt-3 grid gap-2 max-h-[520px] overflow-auto pr-1">
              {users.map((u) => (
                <div key={u.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="font-bold">{u.name}</div>
                  <div className="text-slate-400 text-sm">{u.email}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stories */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="text-lg font-extrabold">Stories ({stories.length})</h2>

            <div className="mt-3 grid gap-3 max-h-[520px] overflow-auto pr-1">
              {stories.map((s) => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="font-extrabold">{s.title}</div>
                  <div className="text-slate-400 text-sm">
                    by {s.user_name} ({s.user_email})
                  </div>

                  {/* media preview */}
                  {Array.isArray(s.media) && s.media.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {s.media.slice(0, 6).map((m: any) => {
                        const url = m.media_url;
                        const isVideo =
                          (m.media_type || "").includes("video") ||
                          /\.(mp4|webm|mov)$/i.test(url);

                        return (
                          <div key={m.id} className="w-[160px] overflow-hidden rounded-xl border border-white/10 bg-black/30">
                            {isVideo ? (
                              <video src={url} controls className="w-full h-[110px] object-cover" />
                            ) : (
                              <img src={url} alt="media" className="w-full h-[110px] object-cover" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => deleteStory(s.id)}
                      className="rounded-xl bg-red-500 px-3 py-1.5 text-sm font-bold text-white hover:opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-bold hover:bg-white/10"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
