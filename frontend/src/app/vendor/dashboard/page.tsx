"use client";

import { useVendor } from "../layout";
import { 
    LayoutDashboard, 
    Briefcase, 
    CalendarCheck, 
    TrendingUp, 
    Users, 
    ArrowRight,
    Search,
    Edit2,
    Eye
} from "lucide-react";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


export default function VendorDashboardOverview() {
    const { vendor, loading } = useVendor();
    const [stats, setStats] = useState({
        listingsCount: 0,
        activeListings: 0,
        pendingBookings: 0,
        totalBookings: 0,
        totalRevenue: 0
    });
    const [recentBookings, setRecentBookings] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        if (!vendor) return;
        fetchOverviewStats();
    }, [vendor]);

    const fetchOverviewStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const [listingsRes, bookingsRes] = await Promise.all([
                fetch(`${API_BASE}/api/vendors/listings`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_BASE}/api/bookings/vendor`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (listingsRes.ok && bookingsRes.ok) {
                const listingsData = await listingsRes.json();
                const bookingsData = await bookingsRes.json();
                
                const listings = listingsData.listings || [];
                const bookings = bookingsData.bookings || [];

                // Generate chart data by date
                const dateMap: Record<string, { date: string; bookings: number; revenue: number }> = {};
                
                const processDate = (isoString: string) => {
                    if (!isoString) return null;
                    const d = new Date(isoString);
                    if (isNaN(d.getTime())) return null;
                    return d.toISOString().split('T')[0];
                };

                bookings.forEach((b: any) => {
                    const d = processDate(b.created_at || b.travel_date);
                    if (d) {
                        if (!dateMap[d]) dateMap[d] = { date: d, bookings: 0, revenue: 0 };
                        dateMap[d].bookings++;
                        if (b.payment_status === 'paid') {
                            dateMap[d].revenue += parseFloat(b.amount) || 0;
                        }
                    }
                });

                const sortedData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
                setChartData(sortedData.slice(-30));

                const revenue = bookings
                    .filter((b: any) => b.payment_status === 'paid')
                    .reduce((acc: number, b: any) => acc + (parseFloat(b.amount) || 0), 0);

                setStats({
                    listingsCount: listings.length,
                    activeListings: listings.filter((l: any) => l.is_active).length,
                    pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
                    totalBookings: bookings.length,
                    totalRevenue: revenue
                });

                setRecentBookings(bookings.slice(0, 5));
            }
        } catch (e) {
            console.error("Overview stats failed", e);
        }
    };

    if (loading || !vendor) return null;

    const cards = [
        { label: "Total Listings", value: stats.listingsCount, sub: `${stats.activeListings} Active`, icon: Briefcase, color: "blue", href: "/vendor/listings" },
        { label: "Bookings", value: stats.totalBookings, sub: `${stats.pendingBookings} Pending`, icon: CalendarCheck, color: "emerald", href: "/vendor/bookings" },
        { label: "Total Revenue", value: `NPR ${stats.totalRevenue.toLocaleString()}`, sub: "Confirmed & Paid", icon: TrendingUp, color: "orange" },
        { label: "Customers", value: stats.totalBookings, sub: "Journey Echoes", icon: Users, color: "purple" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-[#0f172a] border border-white/5 p-6 rounded-[2rem] hover:border-blue-500/20 transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${card.color}-500/10 text-${card.color}-400 border border-${card.color}-500/20 group-hover:scale-110 transition-transform`}>
                                <card.icon size={20} />
                            </div>
                            {card.href && (
                                <Link href={card.href} className="text-slate-600 hover:text-white transition-colors">
                                    <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>
                        <h3 className="text-3xl font-black text-white tracking-tight">{card.value}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{card.label}</p>
                        <div className={`mt-3 py-1 px-2.5 rounded-lg bg-white/5 border border-white/5 w-fit text-[10px] font-bold text-slate-400`}>
                            {card.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-[#0f172a] border border-white/5 rounded-[2.5rem] p-8 h-96 flex flex-col">
                <h3 className="text-xl font-black text-white tracking-tight mb-6">Revenue & Booking Trends (Last 30 Days)</h3>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (NPR)" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            <Area yAxisId="right" type="monotone" dataKey="bookings" name="Bookings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-[#0f172a] border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">Recent Booking Requests</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manage new customer inquiries</p>
                        </div>
                        <Link href="/vendor/bookings" className="text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="p-4 pl-8 text-[10px] uppercase font-black tracking-widest text-slate-500">Service</th>
                                    <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Customer</th>
                                    <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Payment</th>
                                    <th className="p-4 text-[10px] uppercase font-black tracking-widest text-slate-500">Status</th>
                                    <th className="p-4 pr-8 text-[10px] uppercase font-black tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {recentBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-slate-600 font-medium italic text-sm">No recent bookings found.</td>
                                    </tr>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-white/[0.01] transition-colors">
                                            <td className="p-4 pl-8">
                                                <div className="font-bold text-white text-sm">{booking.listing_title}</div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">{new Date(booking.travel_date).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-4 text-sm text-slate-300 font-medium">{booking.contact_name}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border
                                                    ${booking.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-white/5'}`}
                                                >
                                                    {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                                                    ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                      booking.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                                      'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="p-4 pr-8 text-right">
                                                <Link href="/vendor/bookings" className="p-2 text-slate-500 hover:text-white transition-colors inline-block">
                                                    <ArrowRight size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Tips */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl shadow-blue-600/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <h4 className="text-xl font-black text-white mb-2 italic">Ready to scale?</h4>
                        <p className="text-blue-100/80 text-sm leading-relaxed mb-6">Promote your homestay or guide services on the main Echoes of Nepal interactive map.</p>
                        <Link href="/vendor/listings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                            Add New Listing <Edit2 size={14} />
                        </Link>
                    </div>

                    <div className="bg-[#0f172a] border border-white/5 p-8 rounded-[2.5rem]">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6">Service Health</h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Visibility</span>
                                </div>
                                <span className="text-xs font-black text-white">98%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[98%]"></div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Rating</span>
                                </div>
                                <span className="text-xs font-black text-white">4.9/5</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[92%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
