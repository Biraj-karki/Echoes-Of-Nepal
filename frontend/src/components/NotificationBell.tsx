'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash } from 'lucide-react';
import { useSocket } from '@/app/SocketProvider';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationBell() {
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        fetchNotifications();

        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            
            // For SOS we might show a different toast, but this covers standard notifications
            if (notification.type !== 'sos_alert') {
                toast(notification.title + ": " + notification.message, {
                    icon: '🔔',
                });
            }
        });

        // Admin SOS alerts handling
        socket.on('admin_alert', (notification: Notification) => {
             toast.error(notification.title + "\n" + notification.message, {
                 duration: 6000,
                 style: { background: '#ef4444', color: '#fff', fontWeight: 'bold' }
             });
        });

        return () => {
            socket.off('new_notification');
            socket.off('admin_alert');
        };
    }, [socket]);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
            if (!token) return;
            const res = await fetch(`${API_BASE}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
            await fetch(`${API_BASE}/api/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (e) {
            console.error("Failed to mark read", e);
        }
    };

    const markAllRead = async () => {
        try {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
            await fetch(`${API_BASE}/api/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setIsOpen(false);
        } catch (e) {
            console.error("Failed to mark all read", e);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-[#0f172a]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl z-50 flex flex-col">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]/90 backdrop-blur z-10">
                        <h3 className="font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                <Check size={12} /> Mark all read
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto max-h-[300px]">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div 
                                    key={n.id} 
                                    className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white mb-1">{n.title}</p>
                                            <p className="text-xs text-slate-400 leading-relaxed mb-2">{n.message}</p>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {!n.is_read && (
                                            <button 
                                                onClick={() => markAsRead(n.id)}
                                                className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"
                                                title="Mark as read"
                                            />
                                        )}
                                    </div>
                                    {n.link && (
                                        <Link 
                                            href={n.link} 
                                            onClick={() => {
                                                markAsRead(n.id);
                                                setIsOpen(false);
                                            }}
                                            className="mt-2 inline-block text-xs font-semibold text-blue-400 hover:text-blue-300"
                                        >
                                            View Details &rarr;
                                        </Link>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
