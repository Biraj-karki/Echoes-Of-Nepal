"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function VerifyPaymentPage() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = params?.id;
    
    // Khalti KPG appended these queries to the return_url
    const pidx = searchParams.get("pidx");
    const status = searchParams.get("status");

    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState("");
    const verifyAttempted = useRef(false);

    useEffect(() => {
        if (!id || !pidx) {
            setError("Invalid verification parameters.");
            setVerifying(false);
            return;
        }

        if (status === "User canceled") {
            setError("You cancelled the payment.");
            setVerifying(false);
            setTimeout(() => router.push(`/booking/${id}/payment`), 3000);
            return;
        }

        const verifyPayment = async () => {
            if (verifyAttempted.current) return;
            verifyAttempted.current = true;

            try {
                const authToken = localStorage.getItem("token");
                const res = await fetch(`${API_BASE}/api/bookings/verify-khalti`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ pidx, bookingId: id })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    router.push(`/booking/${id}/success`);
                } else {
                    setError(data.error || "Verification failed with gateway.");
                }
            } catch (err) {
                setError("Network error bridging to verification gateway.");
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [id, pidx, status, router]);

    return (
        <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-center space-y-6">
                
                {verifying ? (
                    <>
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Verifying Payment</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            Communicating securely with Khalti servers. Please don&apos;t close this window.
                        </p>
                    </>
                ) : error ? (
                    <>
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="text-red-500 w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Verification Failed</h2>
                        <p className="text-red-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                            {error}
                        </p>
                        <button 
                            onClick={() => router.push(`/booking/${id}/payment`)}
                            className="w-full mt-4 py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-xl transition-colors text-xs"
                        >
                            Return to Checkout
                        </button>
                    </>
                ) : null}

                <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-emerald-500/50">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
            </div>
        </main>
    );
}
