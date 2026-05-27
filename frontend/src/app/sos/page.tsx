'use client'

import React, { useState } from 'react';
import { AlertCircle, Loader2, Send, CheckCircle2, Phone, ShieldAlert, HeartPulse, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/app/AuthProvider';
import { useSocket } from '@/app/SocketProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { API_BASE } from '@/lib/api';

export default function SOSPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { socket } = useSocket();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [customMessage, setCustomMessage] = useState('');
    const [myAlerts, setMyAlerts] = useState<any[]>([]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/sos');
        } else if (user) {
            fetchMyAlerts();
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!socket) return;
        
        const handleNotification = (notification: any) => {
            if (notification.type === 'sos_update') {
                fetchMyAlerts();
            }
        };

        socket.on('new_notification', handleNotification);
        return () => {
            socket.off('new_notification', handleNotification);
        };
    }, [socket]);

    const fetchMyAlerts = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/sos/my-alerts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyAlerts(data.alerts || []);
            }
        } catch (e) {
            console.error("Failed to fetch alerts", e);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    const handleSOS = async () => {
        setLoading(true);
        setStatus('idle');

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE}/api/sos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        latitude,
                        longitude,
                        message: customMessage.trim() || "Emergency SOS triggered from dedicated SOS page"
                    })
                });

                if (res.ok) {
                    setStatus('success');
                    setCustomMessage('');
                    fetchMyAlerts();
                } else {
                    throw new Error("Failed to send alert");
                }
            } catch (err) {
                console.error(err);
                setStatus('error');
            } finally {
                setLoading(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            setLoading(false);
            setStatus('error');
        });
    };

    const emergencyNumbers = [
        { name: "Police", number: "100", icon: <ShieldAlert className="text-blue-500" /> },
        { name: "Ambulance", number: "102", icon: <HeartPulse className="text-red-500" /> },
        { name: "Fire Brigade", number: "101", icon: <LifeBuoy className="text-orange-500" /> },
        { name: "Tourist Police", number: "1144", icon: <ShieldAlert className="text-emerald-500" /> },
        { name: "Traffic Police", number: "103", icon: <AlertCircle className="text-yellow-500" /> },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-12">
                
                {/* HEADER */}
                <div className="text-center space-y-4">
                    <div className="inline-flex p-4 bg-red-500/20 rounded-3xl border border-red-500/30 animate-pulse mb-4">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-5xl font-black tracking-tight uppercase italic">Emergency Help</h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        In case of an emergency, use the button below to send your live GPS location to our response team, or call the local authorities directly.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* SOS TRIGGER SECTION */}
                    <div className="bg-slate-900/40 border border-red-500/20 rounded-[3rem] p-8 space-y-8 flex flex-col justify-between shadow-[0_0_50px_rgba(239,68,68,0.05)]">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Trigger SOS Alert</h2>
                            <p className="text-slate-400 leading-relaxed mb-6">
                                Sending an SOS will share your exact coordinates with the nearest help center and Echoes of Nepal administrators.
                            </p>
                            
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Instant GPS Location Sharing</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>24/7 Response Monitoring</span>
                                </div>
                            </div>
                        </div>

                        {status === 'success' ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl text-center space-y-3">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                                <h3 className="text-xl font-bold text-emerald-400">Alert Sent!</h3>
                                <p className="text-sm text-slate-400">Help has been notified of your position. Please stay where you are.</p>
                                <Button variant="ghost" onClick={() => setStatus('idle')} className="text-xs text-slate-500">Send another alert</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Optional: Describe your situation (e.g., 'Injured leg', 'Lost on trail')"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 resize-none h-24 text-sm"
                                    disabled={loading}
                                />
                                <Button 
                                    onClick={handleSOS}
                                    disabled={loading}
                                    className="w-full h-20 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black text-2xl shadow-xl shadow-red-600/30 transition-all active:scale-95 flex items-center justify-center gap-4"
                                >
                                    {loading ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <Send className="w-8 h-8" />
                                    )}
                                    SEND SOS
                                </Button>
                            </div>
                        )}
                        
                        {status === 'error' && (
                            <p className="text-center text-red-500 text-sm font-bold">
                                Failed to send SOS. Please check your internet/GPS and try again.
                            </p>
                        )}
                    </div>

                    {/* EMERGENCY NUMBERS SECTION */}
                    <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] p-8 space-y-6">
                        <h2 className="text-2xl font-bold">Local Emergency Numbers</h2>
                        <div className="grid gap-3">
                            {emergencyNumbers.map((item, idx) => (
                                <a 
                                    key={idx}
                                    href={`tel:${item.number}`}
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.name}</p>
                                            <p className="text-xl font-black group-hover:text-blue-400 transition-colors">{item.number}</p>
                                        </div>
                                    </div>
                                    <Phone className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                </a>
                            ))}
                        </div>
                        <p className="text-center text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                            Available 24/7 in all regions of Nepal
                        </p>
                    </div>

                </div>

                {/* MY ACTIVE ALERTS */}
                {myAlerts.length > 0 && (
                    <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] p-8 space-y-6">
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                            <ShieldAlert className="text-blue-500" />
                            Your Recent Alerts
                        </h3>
                        <div className="grid gap-4">
                            {myAlerts.map(alert => (
                                <div key={alert.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:bg-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-300">Sent on: {new Date(alert.created_at).toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 mt-1 italic">"{alert.message}"</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                                            alert.status === 'active' ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                    {alert.notes && (
                                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                                <HeartPulse className="w-4 h-4" /> Response Team Notes
                                            </p>
                                            <p className="text-sm text-slate-200 mt-2">{alert.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SAFETY TIPS */}
                <div className="bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] p-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <LifeBuoy className="text-blue-500" />
                        Safety Guidelines
                    </h3>
                    <ul className="grid sm:grid-cols-2 gap-4 text-slate-400 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            Keep your phone charged and carry a power bank when trekking.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            Always register your trek details with the Tourist Police.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            Inform your hotel or family of your itinerary before leaving.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            If lost, stay in one place and seek a visible higher ground.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
