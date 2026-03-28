"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/AuthProvider"; // Use absolute alias for AuthProvider
import { Eye, EyeOff, Mail, Lock, Briefcase } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
      <VendorLoginPageContent />
    </Suspense>
  );
}

function VendorLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

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

  // If already logged in, redirect to Vendor Dashboard
  useEffect(() => {
    if (!loading && user) router.replace("/vendor/dashboard");
  }, [user, loading, router]);


  // Clear error when tab changes
  useEffect(() => {
    setErrorMsg("");
  }, [activeTab]);

  // ---------- GOOGLE LOGIN ----------
  const handleCredentialResponse = async (response: any) => {
    try {
      setErrorMsg("");
      const idToken = response?.credential;
      if (!idToken) {
        setErrorMsg("Google login didn’t return a token. Try again.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/auth/google", {
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
      router.replace("/vendor/dashboard");
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
        width: 320,
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

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
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
      router.replace("/vendor/dashboard");
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

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Registration failed. Try again.");
        return;
      }

      alert("Account created! Please check your email to verify your account.");
      setActiveTab("login");
      setLoginEmail(regEmail);
    } catch (err) {
      console.error("Register error", err);
      setErrorMsg("Something went wrong while creating your account.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="eon-auth-root">
        <section className="eon-auth-hero bg-slate-900 border-r border-white/10">
          <div className="eon-auth-hero-overlay" />
        </section>
        <section className="eon-auth-panel bg-[#0f172a]">
          <div className="eon-auth-card">
            <p style={{ textAlign: "center", color: "white" }}>Loading Partner Portal…</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async defer onLoad={renderGoogleButton} />

      <div className="eon-auth-root bg-[#020617] text-slate-300">
        {/* LEFT HERO (Vendor Themed) */}
        <section className="eon-auth-hero border-r border-white/10 relative overflow-hidden hidden md:flex">
          {/* Subtle vendor background */}
          <div className="absolute inset-0 bg-blue-950/20 z-0 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617]/80 to-transparent z-10"></div>
          
          <div className="eon-auth-hero-content z-20">
            <div className="flex items-center gap-2 mb-4">
                <Briefcase className="text-amber-500" size={24} />
                <p className="eon-pill bg-amber-500/10 text-amber-500 border border-amber-500/20" style={{margin: 0}}>VENDOR PORTAL</p>
            </div>
            <h1 className="text-white">
              Connect your business
              <br />
              with thousands of travelers.
            </h1>
            <p className="eon-sub text-slate-400">
              Manage your local services, accept bookings, and showcase your business to a global audience.
            </p>
            <ul className="eon-points text-slate-400">
              <li>List Hotels, Homestays, and Transport</li>
              <li>Track all your incoming booking requests</li>
              <li>Grow your business with verified reviews</li>
            </ul>
          </div>
        </section>

        {/* RIGHT PANEL (Vendor Themed) */}
        <section className="eon-auth-panel bg-[#0f172a]">
          <div className="eon-auth-card">
            <header className="eon-auth-header text-center pb-6">
              <h2 className="text-2xl font-black text-white">Partner Sign In</h2>
              <p className="text-slate-400">Access your Echoes of Nepal vendor account.</p>
            </header>

            {/* Tabs */}
            <div className="eon-auth-tabs grid grid-cols-2 bg-slate-900 rounded-xl p-1 mb-8" role="tablist">
              <button
                type="button"
                className={`py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-[#0f172a] text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'register' ? 'bg-[#0f172a] text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={() => setActiveTab("register")}
              >
                Create Hub Account
              </button>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium rounded-xl text-center mb-6">
                {errorMsg}
              </div>
            )}

            {/* Forms */}
            <div className="eon-form-wrapper">
              {activeTab === "login" ? (
                <form className="eon-form space-y-4" onSubmit={handleLogin}>
                  {/* Email */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Business Email</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="contact@hotel.com"
                        required
                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Password</label>
                        <button type="button" onClick={() => router.push("/forgot-password")} className="text-[10px] text-amber-500 hover:text-amber-400 uppercase tracking-widest font-bold">Forgot?</button>
                    </div>
                    
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Lock size={16} />
                      </span>
                      <input
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 text-xs mt-6" disabled={submitting}>
                    {submitting ? "Authenticating..." : "Access Dashboard"}
                  </button>
                </form>
              ) : (
                <form className="eon-form space-y-4" onSubmit={handleRegister}>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Business Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="contact@business.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 block">Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 text-xs mt-6" disabled={submitting}>
                    {submitting ? "Registering..." : "Create Partner Account"}
                  </button>
                </form>
              )}
            </div>

            {/* Divider + Google */}
            <div className="flex items-center gap-4 my-8">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Or continue with</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <div id={googleBtnId} className="flex justify-center w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <span className="sr-only">Sign in with Google</span>
            </div>
            <p className="text-[10px] text-center text-slate-500 mt-6">By logging in, you agree to Echoes of Nepal's Vendor Terms of Service.</p>
          </div>
        </section>
      </div>
    </>
  );
}
