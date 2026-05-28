"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/AuthProvider"; // Use absolute alias for AuthProvider
import { Eye, EyeOff, Mail, Lock, Briefcase } from "lucide-react";
import { API_BASE } from "@/lib/api";

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
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [resendSubmitting, setResendSubmitting] = useState(false);

  // login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");

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
        "Account created! Please check your email to verify your account before logging in."
      );
      setPendingVerificationEmail(regEmail);
      setActiveTab("login");
      setLoginEmail(regEmail);
    } catch (err) {
      console.error("Register error", err);
      setErrorMsg("Something went wrong while creating your account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const email = (pendingVerificationEmail || loginEmail).trim();
    if (!email) {
      setErrorMsg("Please enter your email address first.");
      return;
    }

    try {
      setResendSubmitting(true);
      setErrorMsg("");

      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error || "Could not resend verification email.");
        return;
      }

      setSuccessMsg(
        "Verification email sent again. Please check your inbox and spam folder."
      );
      setPendingVerificationEmail(email);
    } catch (err) {
      console.error("Resend verification error", err);
      setErrorMsg("Something went wrong while resending the verification email.");
    } finally {
      setResendSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">Authenticating Partner...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async defer onLoad={renderGoogleButton} />

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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black tracking-widest text-amber-500 uppercase mb-6 backdrop-blur-md">
              <Briefcase size={12} className="animate-pulse" />
              Vendor Portal
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-6 drop-shadow-2xl">
              Connect your business <br />
              <span className="text-white opacity-90">
                with thousands of travelers.
              </span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 drop-shadow-md">
              Manage your local services, accept bookings, and showcase your business to a global audience.
            </p>
            <div className="space-y-4">
              {[
                "List Hotels, Homestays, and Transport",
                "Track all your incoming booking requests",
                "Grow your business with verified reviews"
              ].map((point, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-200 group cursor-default">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center group-hover:border-amber-500 transition-colors">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  </div>
                  <span className="text-sm font-medium drop-shadow-sm">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex items-center justify-center p-6 lg:p-12 bg-radial-at-t from-[#0b1120] to-[#020617]">
          <div className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Subtle light effect top right */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <header className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Partner Sign In</h2>
              <p className="text-slate-400 text-sm">Access your Echoes of Nepal vendor account.</p>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-800/50 rounded-xl mb-8 border border-white/5">
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "login" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-white"}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === "register" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-white"}`}
                onClick={() => setActiveTab("register")}
              >
                Join Hub
              </button>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-shake">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                {successMsg}
                {pendingVerificationEmail && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-emerald-200/80 font-medium">
                      Didn’t get it? Resend the verification email.
                    </span>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendSubmitting}
                      className="px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/20 text-amber-300 hover:text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                    >
                      {resendSubmitting ? "Resending..." : "Resend email"}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              {activeTab === "login" ? (
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Business Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={16} />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="contact@hotel.com"
                        required
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Secure Password</label>
                      <button type="button" onClick={() => router.push("/forgot-password")} className="text-[10px] font-bold text-amber-500 hover:text-amber-400 uppercase tracking-widest">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={16} />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-11 pr-11 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all shadow-xl shadow-amber-600/20 active:scale-[0.98] disabled:opacity-50 text-[10px] mt-2 group"
                  >
                    {submitting ? "Verifying..." : (
                      <span className="flex items-center justify-center gap-2">
                        Access Dashboard <Briefcase size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Business Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="contact@business.com"
                      className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Secure Password</label>
                    <div className="relative group">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="w-full bg-slate-950/50 border border-white/5 rounded-xl pl-4 pr-11 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((prev) => !prev)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-50 text-[10px] mt-2"
                  >
                    {submitting ? "Creating Hub..." : "Register Partner"}
                  </button>
                </form>
              )}

              <div className="relative py-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <span className="relative px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 bg-[#0c1425]">
                  OR CONTINUE WITH
                </span>
              </div>

              <div id={googleBtnId} className="flex justify-center w-full transform hover:scale-[1.02] transition-transform" />
              
              <p className="text-[10px] text-center text-slate-600 leading-relaxed px-4">
                By entering the portal, you agree to our <span className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors">Partner Terms</span> & <span className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
