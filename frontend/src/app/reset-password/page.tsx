"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    if (!email || !token) {
      alert("Invalid or missing reset link.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not reset password");
        return;
      }

      alert("Password updated! You can now log in with your new password.");
      router.push("/login");
    } catch (err) {
      console.error("Reset password error:", err);
      alert("Something went wrong while resetting your password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617]">
      {/* LEFT HERO */}
      <section className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-emerald-500/10 z-0" />
        <div 
          className="absolute inset-0 z-[-1] opacity-40 bg-cover bg-center" 
          style={{ backgroundImage: 'url("/mountain.jpg")' }}
        />
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black tracking-widest text-blue-400 uppercase mb-6">
            Echoes of Nepal
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Reset your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              password.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Choose a strong new password to keep your journeys safe.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-12 bg-radial-at-t from-[#0b1120] to-[#020617]">
        <Card className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create a new password</h2>
            <p className="text-slate-400 text-sm italic">{email || "your account"}</p>
          </header>

          <form className="space-y-6" onSubmit={handleReset}>
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
            
            <p className="text-center text-[10px] text-slate-500">
              After updating, you’ll be redirected back to the login page.
            </p>
          </form>
        </Card>
      </section>
    </div>
  );
}
