'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget({
  onSelectDate,
}: {
  onSelectDate?: (dateStr: string) => void;
}) {
  const [selectedDay, setSelectedDay] = useState(8);

  const days = [
    { day: 'M', date: 3 },
    { day: 'T', date: 4 },
    { day: 'W', date: 5, hasItems: true },
    { day: 'T', date: 6, hasItems: true },
    { day: 'F', date: 7, hasItems: true },
    { day: 'S', date: 8, hasItems: true, isToday: true },
    { day: 'S', date: 9 },
  ];

  return (
    <div className="glass-card p-5 rounded-3xl space-y-4">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            November, 2026
          </h3>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button className="p-1 hover:text-slate-800 transition">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 hover:text-slate-800 transition">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {days.map((d, i) => {
          const isSelected = selectedDay === d.date;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelectedDay(d.date);
                if (onSelectDate) onSelectDate(`2026-11-0${d.date}`);
              }}
              className={`py-2 px-1 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                isSelected
                  ? 'bg-[#121c1d] text-white shadow-md'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <span className="text-[10px] font-semibold text-slate-400">{d.day}</span>
              <span className="text-xs font-bold">{d.date}</span>
              {d.hasItems && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              )}
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
