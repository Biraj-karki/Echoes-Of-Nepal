"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { API_BASE } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const googleBtnId = useMemo(() => "googleSignInDiv", []);

  // If already logged in, don’t show login page – go to dashboard or vendor portal
  useEffect(() => {
    if (!loading && user) {
      if (user.verification_status === "approved") {
        router.replace("/vendor/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, router]);

  // If we came here with ?token=... (from reset link), redirect to reset page
  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");
    if (token && email) {
      router.push(
        `/reset-password?token=${encodeURIComponent(
          token
        )}&email=${encodeURIComponent(email)}`
      );
    }
  }, [searchParams, router]);

  // Clear tab-specific errors when switching views, but preserve success feedback
  // after registration so it remains visible on the login tab.
  useEffect(() => {
    setErrorMsg("");
  }, [activeTab]);

  // ---------- GOOGLE LOGIN ----------
  const handleCredentialResponse = async (response: any) => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      const idToken = response?.credential;
      if (!idToken) {
        setErrorMsg("Google login didn’t return a token. Try again.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Google authentication failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      await refreshUser();
    } catch (err) {
      console.error("Google login error", err);
      setErrorMsg("Something went wrong with Google login.");
    }
  };

  const renderGoogleButton = () => {
    if (!window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      const el = document.getElementById(googleBtnId);
      if (!el) return;

      el.innerHTML = "";
      window.google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        width: 380,
      });
    } catch (e) {
      console.error("Google button render error", e);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => renderGoogleButton(), 50);
    return () => clearTimeout(t);
  }, [activeTab]);

  // ---------- EMAIL LOGIN ----------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Login failed. Check your details.");
        return;
      }

      localStorage.setItem("token", data.token);
      await refreshUser();
    } catch (err) {
      console.error("Login error", err);
      setErrorMsg("Something went wrong while logging in.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- EMAIL REGISTER ----------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Registration failed. Try again.");
        return;
      }

      setSuccessMsg(
        "Account created successfully. Please check your email to verify your account before logging in."
      );
      setActiveTab("login");
      setLoginEmail(regEmail);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setShowRegPassword(false);
    } catch (err) {
      console.error("Register error", err);
      setErrorMsg("Something went wrong while creating your account.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={renderGoogleButton}
      />

      <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617]">
        {/* LEFT HERO */}
        <section className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden border-r border-white/5">
          {/* Background Image with slight scale animation */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[20000ms] hover:scale-110" 
            style={{ 
              backgroundImage: 'url("/mountain.jpg")',
              opacity: 0.7 
            }}
          />
          
          {/* Overlays for depth and readability */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#020617] via-[#020617]/60 to-transparent" />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
          
          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black tracking-widest text-blue-400 uppercase mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Echoes of Nepal
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Log in and pick up <br />
              where your journey paused.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 drop-shadow-md">
              Save routes, stories and hidden spots across the Himalayas. One account for all your rides,
              treks and adventures.
            </p>
            <div className="space-y-4">
              {[
                "AI-powered route ideas inside Nepal",
                "Save your favorite rides & trails",
                "Plan treks, stays and local experiences"
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-200 group cursor-default">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-sm font-medium drop-shadow-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex items-center justify-center p-6 lg:p-12 bg-radial-at-t from-[#0b1120] to-[#020617]">
          <Card className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl">
            <header className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back, traveler</h2>
              <p className="text-slate-400 text-sm">Sign in to your Echoes Of Nepal account.</p>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-800 rounded-xl mb-8">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "login" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === "register" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium animate-shake">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                {successMsg}
              </div>
            )}

            <div className="space-y-6">
              {activeTab === "login" ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute right-3 bottom-2.5 p-1 text-slate-500 hover:text-white transition-colors"
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <Button type="submit" fullWidth disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                      onClick={() => router.push("/forgot-password")}
                    >
                      Forgot your password?
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                  <div className="relative">
                    <Input
                      label="Password"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="absolute right-3 bottom-2.5 p-1 text-slate-500 hover:text-white transition-colors"
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <Button type="submit" fullWidth disabled={submitting} variant="secondary">
                    {submitting ? "Creating..." : "Create Account"}
                  </Button>
                  
                  <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed">
                    By creating an account, you agree to our Terms of Service and Privacy Policy. Verify your email after signup.
                  </p>
                </form>
              )}

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <span className="relative px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 shadow-sm">
                  or
                </span>
              </div>

              <div id={googleBtnId} className="flex justify-center" />
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
