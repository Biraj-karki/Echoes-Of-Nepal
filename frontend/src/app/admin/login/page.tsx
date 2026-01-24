"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `Login failed (${res.status})`);
      }

      if (!data.token) throw new Error("Token missing from response");

      localStorage.setItem("admin_token", data.token);
      router.replace("/admin/dashboard");
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100 grid place-items-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 grid place-items-center">
            <Shield className="text-emerald-300" size={20} />
          </div>
          <div>
            <div className="text-xl font-black">Echoes Admin</div>
            <div className="text-sm text-slate-400">Login to continue</div>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 font-semibold">
            {err}
          </div>
        )}

        <form onSubmit={login} className="mt-5 grid gap-3">
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="mt-2 rounded-2xl bg-emerald-500 px-4 py-3 font-extrabold text-black hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-xs text-slate-400">
          Endpoint used: <span className="text-slate-200 font-semibold">{API_BASE}/api/admin/login</span>
        </div>
      </div>
    </div>
  );
}
