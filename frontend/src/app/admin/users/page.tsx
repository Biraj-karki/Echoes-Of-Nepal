"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCcw, Search, Trash2, User } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("admin_token") || "";
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErr(null);

      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed loading users");

      setUsers(data.users || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteUser = async (userId: number) => {
    if (!confirm("Delete this user? (You should also delete their stories/media)"))
      return;

    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || "Delete user failed (backend route missing?)");
      return;
    }

    setUsers((p) => p.filter((u) => u.id !== userId));
  };

  const filtered = users.filter((u) => {
    const s = `${u.name || ""} ${u.email || ""}`.toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Users</h1>
          <p className="text-slate-400 mt-1">Search, review, delete if needed.</p>
        </div>

        <button
          onClick={fetchUsers}
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

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
        <Search className="text-slate-400" size={18} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users by name/email..."
          className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500"
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
        <div className="text-lg font-black mb-3">
          Users ({loading ? "…" : filtered.length})
        </div>

        {loading ? (
          <div className="text-slate-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-slate-400">No users found.</div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
                    <User size={18} className="text-slate-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold truncate">{u.name}</div>
                    <div className="text-slate-400 text-sm truncate">
                      {u.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteUser(u.id)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-4 py-2 text-sm font-extrabold text-white hover:opacity-90"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500">
        Note: Delete user needs backend route: <b>DELETE /api/admin/users/:id</b>
      </div>
    </div>
  );
}
