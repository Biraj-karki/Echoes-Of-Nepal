"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarPickerProps {
    onChange: (date: string) => void;
    value: string;
}

export default function CalendarPicker({ onChange, value }: CalendarPickerProps) {
    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(value || today));

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getUTCMonth();

    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Get first day of month (0-6)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const isToday = (day: number) => {
        const d = new Date();
        return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    const isSelected = (day: number) => {
        if (!value) return false;
        const d = new Date(value);
        return d.getDate() === day && d.getUTCMonth() === currentMonth && d.getFullYear() === currentYear;
    };

    const handleDateSelect = (day: number) => {
        const selected = new Date(Date.UTC(currentYear, currentMonth, day));
        onChange(selected.toISOString().split('T')[0]);
    };

    const nextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
    const prevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));

    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-4 select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <h4 className="text-sm font-black uppercase tracking-widest text-white">
                    {monthNames[currentMonth]} <span className="text-blue-500">{currentYear}</span>
                </h4>
                <div className="flex items-center gap-1">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-[10px] font-black uppercase text-slate-600 text-center py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {blanks.map(b => (
                    <div key={`blank-${b}`} className="p-2"></div>
                ))}
                {days.map(day => {
                    const active = isSelected(day);
                    const current = isToday(day);
                    return (
                        <button
                            key={day}
                            onClick={() => handleDateSelect(day)}
                            className={`
                                aspect-square relative grid place-items-center rounded-xl text-xs font-bold transition-all
                                ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                                ${current && !active ? 'border border-blue-500/30' : ''}
                            `}
                        >
                            {day}
                            {current && !active && <span className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full"></span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
