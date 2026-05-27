"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ChevronLeft } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(
        `${API_BASE}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong while sending reset email");
        return;
      }

      setSuccessMsg("If this email exists, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      console.error("Forgot password error", err);
      setErrorMsg("Something went wrong while sending reset email");
    } finally {
      setSubmitting(false);
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
            Let’s help you get <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              back on the trail.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Enter your email and we&apos;ll send you a secure link to reset your
            password.
          </p>
          <div className="space-y-4">
            {[
              "No password is changed without your confirmation.",
              "Links expire after a short period for security."
            ].map((point, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-sm font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="flex items-center justify-center p-6 lg:p-12 bg-radial-at-t from-[#0b1120] to-[#020617]">
        <Card className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl">
          <header className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Forgot your password?</h2>
            <p className="text-slate-400 text-sm">We&apos;ll email you a link to reset it.</p>
          </header>

          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              {successMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Sending link…" : "Send reset link"}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                onClick={() => router.push("/login")}
              >
                <ChevronLeft size={14} /> Back to login
              </button>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
