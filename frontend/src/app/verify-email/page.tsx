"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token missing.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/auth/verify-email?token=${token}`
        );

        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
          return;
        }

        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");

        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong during verification.");
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6">
      <Card className="w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl text-center">
        {status === "loading" && (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verifying your email…
              </h2>
              <p className="text-slate-400 text-sm">Please wait while we confirm your account.</p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Email Verified 🎉
              </h2>
              <p className="text-emerald-400/80 text-sm font-medium">{message}</p>
            </div>
            <Button onClick={() => router.push("/login")} fullWidth>
              Go to Login
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verification Failed ❌
              </h2>
              <p className="text-red-400/80 text-sm font-medium">{message}</p>
            </div>
            <Button onClick={() => router.push("/login")} fullWidth variant="danger">
              Back to Login
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
