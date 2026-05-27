"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Users, Clock, MapPin, User, MessageSquare } from "lucide-react";

interface Booking {
    id: number;
    listing_title: string;
    travel_date: string;
    people_count: number;
    contact_name: string;
    status: string;
    message?: string;
}

interface VendorCalendarProps {
    bookings: Booking[];
}

export default function VendorCalendar({ bookings }: VendorCalendarProps) {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Get bookings for this month
    const monthBookings = useMemo(() => {
        return bookings.filter(b => {
            const d = new Date(b.travel_date);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });
    }, [bookings, currentYear, currentMonth]);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const getBookingsForDay = (day: number) => {
        return monthBookings.filter(b => new Date(b.travel_date).getUTCDate() === day);
    };

    const nextMonth = () => {
        setViewDate(new Date(currentYear, currentMonth + 1, 1));
        setSelectedDay(null);
    };
    const prevMonth = () => {
        setViewDate(new Date(currentYear, currentMonth - 1, 1));
        setSelectedDay(null);
    };

    const selectedDayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Calendar Grid */}
            <div className="lg:col-span-8 bg-[#0f172a] border border-white/5 rounded-[3rem] p-8">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-white italic tracking-tight">
                            {monthNames[currentMonth]} <span className="text-blue-500 font-black">{currentYear}</span>
                        </h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Monthly Schedule Overview</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={prevMonth} className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl grid place-items-center text-slate-400 hover:text-white transition-all active:scale-90">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextMonth} className="w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl grid place-items-center text-slate-400 hover:text-white transition-all active:scale-90">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-[10px] font-black uppercase tracking-widest text-slate-600 text-center pb-4">{d}</div>
                    ))}
                    
                    {blanks.map(b => <div key={`b-${b}`} className="aspect-square opacity-20"></div>)}
                    
                    {days.map(day => {
                        const dayBookings = getBookingsForDay(day);
                        const isSelected = selectedDay === day;
                        const isToday = new Date().getUTCDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`
                                    aspect-square relative flex flex-col items-center justify-center rounded-3xl transition-all border
                                    ${isSelected ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-600/20 z-10 scale-105' : 
                                      'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/5 hover:border-white/10'}
                                    ${isToday && !isSelected ? 'border-amber-500/30' : ''}
                                `}
                            >
                                <span className={`text-sm font-black italic ${isSelected ? 'text-white' : 'text-slate-300'}`}>{day}</span>
                                
                                {dayBookings.length > 0 && (
                                    <div className="flex gap-0.5 mt-1.5 px-2 flex-wrap justify-center">
                                        {dayBookings.slice(0, 3).map((b, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${
                                                b.status === 'confirmed' ? 'bg-emerald-400' : 
                                                b.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'
                                            }`}></div>
                                        ))}
                                    </div>
                                )}
                                {isToday && !isSelected && <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Day Details Flyout/Panel */}
            <div className="lg:col-span-4 h-full">
                <div className="bg-[#0f172a] border border-white/5 rounded-[3rem] p-8 h-full sticky top-8">
                    {!selectedDay ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                            <Clock size={48} className="text-slate-700 mb-6" />
                            <h3 className="text-xl font-black text-slate-400 italic">Select a Date</h3>
                            <p className="text-xs font-medium text-slate-600 mt-2 px-6">Click any day on the calendar to view scheduled adventures.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight leading-none italic">{monthNames[currentMonth]} {selectedDay}</h3>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-3">Agenda for this date</p>
                            </div>

                            {selectedDayBookings.length === 0 ? (
                                <div className="py-12 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
                                    <p className="text-sm font-bold text-slate-600 italic">No bookings scheduled</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedDayBookings.map(b => (
                                        <div key={b.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all group">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                    b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                    b.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                }`}>
                                                    {b.status}
                                                </span>
                                                <div className="text-[10px] font-bold text-slate-600">ID: #{b.id}</div>
                                            </div>
                                            <h4 className="text-base font-black text-white italic leading-tight group-hover:text-blue-400 transition-colors">{b.listing_title}</h4>
                                            
                                            <div className="grid grid-cols-2 gap-4 mt-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    <User size={12} className="text-blue-500" /> {b.contact_name}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    <Users size={12} className="text-blue-500" /> {b.people_count} Pax
                                                </div>
                                            </div>
                                            
                                            {b.message && (
                                                <p className="mt-4 text-xs text-slate-400 italic line-clamp-2 border-t border-white/5 pt-4">"{b.message}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
