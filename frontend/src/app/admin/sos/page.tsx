'use client'

import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, MapPin, Clock, ExternalLink, MessageSquare, Save, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useSocket } from '@/app/SocketProvider';
import { API_BASE } from '@/lib/api';

interface SOSAlert {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    latitude: number;
    longitude: number;
    status: 'active' | 'resolved';
    message: string;
    notes: string;
    created_at: string;
    updated_at: string;
}

export default function AdminSOSPage() {
    const [alerts, setAlerts] = useState<SOSAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});
    const [saving, setSaving] = useState<Record<number, boolean>>({});
    const { socket } = useSocket();

    const fetchAlerts = async () => {
        try {
            // Check both locations where tokens might be stored
            const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/sos/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    setError("Unauthorized: You must be logged in as an Admin to access this page.");
                } else {
                    setError("Failed to fetch alerts. Please check if the backend is running.");
                }
                return;
            }

            const data = await res.json();
            if (data.alerts) {
                setAlerts(data.alerts);
                setError(null);
            }
        } catch (err) {
            console.error("Failed to fetch alerts:", err);
            setError("Network Error: Could not connect to the emergency server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleAdminAlert = (notification: any) => {
            if (notification.type === 'sos_alert') {
                fetchAlerts();
            }
        };

        socket.on('admin_alert', handleAdminAlert);

        return () => {
            socket.off('admin_alert', handleAdminAlert);
        };
    }, [socket]);

    const handleUpdateSituation = async (id: number, status: 'active' | 'resolved') => {
        setSaving({ ...saving, [id]: true });
        try {
            const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
            const endpoint = status === 'resolved' ? 'resolve' : 'update';
            const res = await fetch(`${API_BASE}/api/sos/admin/${endpoint}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notes: editingNotes[id] || "" })
            });

            if (res.ok) {
                await fetchAlerts();
                setEditingNotes((prev: Record<number, string>) => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            }
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setSaving({ ...saving, [id]: false });
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center">
                <div className="p-10 bg-red-500/5 border border-red-500/20 rounded-[3rem] max-w-lg w-full shadow-2xl">
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Access Restricted</h2>
                    <p className="text-slate-400 mb-8 font-medium leading-relaxed">
                        {error} Only authorized emergency personnel with valid admin credentials can view live SOS data.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => window.location.href = '/admin/login'}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                        >
                            Sign in as Administrator
                        </Button>
                        <Button
                            onClick={() => window.location.href = '/'}
                            variant="ghost"
                            className="text-slate-500 hover:text-white"
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
                <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Initializing Emergency Feed...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-red-500/20 rounded-[2rem] border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                            <Shield className="w-10 h-10 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight uppercase">SOS COMMAND CENTER</h1>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-sm font-medium uppercase tracking-widest">Live Surveillance Active</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 flex gap-8">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Total Alerts</p>
                            <p className="text-2xl font-black text-white">{alerts.length}</p>
                        </div>
                        <div className="text-center border-l border-white/10 pl-8">
                            <p className="text-[10px] uppercase tracking-widest text-red-500 mb-1">Active</p>
                            <p className="text-2xl font-black text-red-500">
                                {alerts.filter((a: SOSAlert) => a.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8">
                    {alerts.length === 0 ? (
                        <div className="bg-slate-900/40 border border-dashed border-white/20 rounded-[3rem] p-20 text-center">
                            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 text-center w-full">Systems Clear</h3>
                            <p className="text-slate-400 max-w-md mx-auto">No emergency alerts detected in the region. All travelers are currently accounted for.</p>
                        </div>
                    ) : (
                        alerts.map((alert: SOSAlert) => (
                            <div
                                key={alert.id}
                                className={`group bg-slate-900/40 border transition-all duration-500 rounded-[2.5rem] overflow-hidden ${alert.status === 'active'
                                    ? 'border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.1)] ring-1 ring-red-500/20'
                                    : 'border-white/10 opacity-70 grayscale-[0.5]'
                                    }`}
                            >
                                <div className="p-8">
                                    <div className="flex flex-col lg:flex-row gap-8">
                                        <div className="flex-shrink-0 w-full lg:w-64 space-y-4">
                                            <div className={`p-6 rounded-[2rem] flex flex-col items-center text-center gap-3 ${alert.status === 'active' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800/50 text-slate-400'
                                                }`}>
                                                <AlertCircle className={`w-12 h-12 ${alert.status === 'active' ? 'animate-pulse' : ''}`} />
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60">Status</p>
                                                    <p className="text-xl font-black uppercase">{alert.status}</p>
                                                </div>
                                            </div>

                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Reported By</p>
                                                <p className="font-bold text-white truncate">{alert.user_name || "Guest User"}</p>
                                                <p className="text-xs text-slate-400 truncate">{alert.user_email || "No email provided"}</p>
                                            </div>
                                        </div>

                                        <div className="flex-grow space-y-6">
                                            <div className="flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                    <span>Triggered {new Date(alert.created_at).toLocaleString()}</span>
                                                </div>
                                                <a
                                                    href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-500/20 transition-all active:scale-95"
                                                >
                                                    <MapPin className="w-4 h-4" />
                                                    TRACK ON MAP
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>

                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Initial Distress Message</p>
                                                <p className="text-xl text-white font-medium bg-white/5 p-4 rounded-2xl border border-white/5 italic">
                                                    "{alert.message}"
                                                </p>
                                            </div>

                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4 text-slate-500" />
                                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Situation Update</p>
                                                    </div>
                                                </div>

                                                <textarea
                                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                    placeholder="Enter updates on the emergency response..."
                                                    rows={3}
                                                    value={editingNotes[alert.id] !== undefined ? editingNotes[alert.id] : (alert.notes || "")}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingNotes({ ...editingNotes, [alert.id]: e.target.value })}
                                                />

                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={() => handleUpdateSituation(alert.id, 'active')}
                                                        disabled={saving[alert.id] || editingNotes[alert.id] === undefined}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex-grow font-bold flex items-center justify-center gap-2"
                                                    >
                                                        {saving[alert.id] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                        Save Situation Update
                                                    </Button>

                                                    {alert.status === 'active' && (
                                                        <Button
                                                            onClick={() => handleUpdateSituation(alert.id, 'resolved')}
                                                            disabled={saving[alert.id]}
                                                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 font-black uppercase tracking-widest text-xs"
                                                        >
                                                            Resolve
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
