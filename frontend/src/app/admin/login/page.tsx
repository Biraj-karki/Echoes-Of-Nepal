"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const res = await fetch(`${API}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || "Login failed");
      return;
    }

    localStorage.setItem("admin_token", data.token);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <form onSubmit={login} className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5">
        <h1 className="text-2xl font-extrabold">Admin Login</h1>
        {err && <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 font-semibold">{err}</div>}

        <div className="mt-4 grid gap-2">
          <input className="rounded-xl bg-black/30 border border-white/10 p-3"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input className="rounded-xl bg-black/30 border border-white/10 p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="mt-2 rounded-xl bg-white text-black font-extrabold p-3">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
